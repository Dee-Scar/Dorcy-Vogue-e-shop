// One-off maintenance: shrink oversized images already in Supabase Storage.
//
// Product images were uploaded at full camera resolution (~1 MB average, up to
// 3 MB). Uploads go straight from the browser to Storage, so nothing ever
// resized them. With Vercel's image optimization unavailable, visitors download
// those originals, which is slow and burns Supabase egress.
//
// Each file keeps its exact path and format, so the public URLs stored in the
// database keep working and no rows need updating.
//
//   node scripts/resize-product-images.mjs            dry run, changes nothing
//   node scripts/resize-product-images.mjs --apply    back up, resize, re-upload

import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import { readFileSync, mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";

const BUCKET = "product-images";
const MAX_WIDTH = 1400;
const QUALITY = 82;
const SKIP_BELOW = 250 * 1024; // already web-sized, nothing worth reclaiming
// Backups live outside the repo so they can never be committed. Keep the default
// pointing at the existing folder: an image having a backup is what marks it as
// already processed, so changing this would re-compress everything.
const BACKUP_DIR = process.env.IMAGE_BACKUP_DIR || join(process.cwd(), "..", "DV-eWeb-image-backup-20260912");

const apply = process.argv.includes("--apply");

const env = Object.fromEntries(
  readFileSync(join(process.cwd(), ".env.local"), "utf8")
    .split(/\r?\n/)
    .filter((l) => /^\s*[A-Za-z_]+\s*=/.test(l))
    .map((l) => {
      const [k, v] = l.split(/=(.*)/s);
      return [k.trim(), v.trim()];
    })
);

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const IMAGE = /\.(jpe?g|png|webp)$/i;
const kb = (n) => `${Math.round(n / 1024)} KB`;

// Storage lists one folder at a time; walk into subfolders.
async function listAll(prefix = "") {
  const out = [];
  let offset = 0;
  for (;;) {
    const { data, error } = await supabase.storage.from(BUCKET).list(prefix, {
      limit: 100,
      offset,
      sortBy: { column: "name", order: "asc" },
    });
    if (error) throw new Error(`list ${prefix || "/"}: ${error.message}`);
    if (!data || data.length === 0) break;

    for (const entry of data) {
      const path = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.id === null) {
        out.push(...(await listAll(path))); // folder
      } else {
        out.push({ path, size: Number(entry.metadata?.size ?? 0), type: entry.metadata?.mimetype });
      }
    }
    if (data.length < 100) break;
    offset += data.length;
  }
  return out;
}

// PNGs here are phone photos, and plain PNG re-encoding usually makes those
// bigger. So try several encoders and keep whichever is genuinely smallest.
// The stored path never changes; Content-Type tells browsers what it really is.
async function reencode(buf, path) {
  const img = () =>
    sharp(buf, { failOn: "none" }).rotate().resize({ width: MAX_WIDTH, withoutEnlargement: true });

  const candidates = [];
  if (/\.png$/i.test(path)) {
    candidates.push({ buf: await img().png({ compressionLevel: 9, palette: true, quality: 80 }).toBuffer(), contentType: "image/png" });
    candidates.push({ buf: await img().webp({ quality: QUALITY }).toBuffer(), contentType: "image/webp" });
  } else if (/\.webp$/i.test(path)) {
    candidates.push({ buf: await img().webp({ quality: QUALITY }).toBuffer(), contentType: "image/webp" });
  } else {
    candidates.push({ buf: await img().jpeg({ quality: QUALITY, mozjpeg: true }).toBuffer(), contentType: "image/jpeg" });
    candidates.push({ buf: await img().webp({ quality: QUALITY }).toBuffer(), contentType: "image/webp" });
  }
  return candidates.sort((a, b) => a.buf.length - b.buf.length)[0];
}

const files = (await listAll()).filter((f) => IMAGE.test(f.path));
const targets = files.filter((f) => f.size >= SKIP_BELOW);
const totalBefore = targets.reduce((n, f) => n + f.size, 0);

console.log(`bucket ${BUCKET}: ${files.length} images, ${(files.reduce((n, f) => n + f.size, 0) / 1048576).toFixed(1)} MB total`);
console.log(`over ${kb(SKIP_BELOW)}: ${targets.length} images, ${(totalBefore / 1048576).toFixed(1)} MB`);
// --report only lists what is in the bucket. A dry run has to download every
// file to measure it, which costs egress; this costs nothing.
if (process.argv.includes("--report")) {
  const big = targets.sort((a, b) => b.size - a.size).slice(0, 12);
  console.log("\nlargest remaining:");
  for (const f of big) console.log(`  ${kb(f.size).padStart(9)}  ${f.path}`);
  process.exit(0);
}

console.log(apply ? `\nAPPLYING. Originals are backed up to ${BACKUP_DIR}\n` : `\nDRY RUN - nothing will be changed. Re-run with --apply to do it.\n`);

let done = 0, failed = 0, after = 0, skippedBytes = 0, saved = 0;

for (const file of targets) {
  try {
    // A backup file means this image was already re-encoded on an earlier run.
    // Re-encoding it again would compress an already-compressed image and lose
    // quality for no gain, so leave it alone.
    if (apply && existsSync(join(BACKUP_DIR, file.path))) {
      console.log(`already ${file.path}  ${kb(file.size)} (done on a previous run)`);
      after += file.size;
      continue;
    }

    // Multi-megabyte PNGs regularly die with "fetch failed" / "terminated" during
    // a long run, so give each download a few attempts before giving up on it.
    let original;
    for (let attempt = 1; ; attempt++) {
      try {
        const { data, error } = await supabase.storage.from(BUCKET).download(file.path);
        if (error) throw new Error(error.message);
        original = Buffer.from(await data.arrayBuffer());
        break;
      } catch (err) {
        if (attempt === 4) throw err;
        await new Promise((resolve) => setTimeout(resolve, attempt * 2000));
      }
    }
    const { buf: shrunk, contentType } = await reencode(original, file.path);

    // Never upload something larger than what is already there.
    if (shrunk.length >= original.length) {
      console.log(`skip   ${file.path}  ${kb(original.length)} -> ${kb(shrunk.length)} (no gain)`);
      skippedBytes += original.length;
      after += original.length;
      continue;
    }

    if (apply) {
      const backup = join(BACKUP_DIR, file.path);
      if (!existsSync(dirname(backup))) mkdirSync(dirname(backup), { recursive: true });
      writeFileSync(backup, original);

      const { error: upErr } = await supabase.storage.from(BUCKET).upload(file.path, shrunk, {
        upsert: true,
        contentType,
        cacheControl: "31536000",
      });
      if (upErr) throw new Error(upErr.message);
    }

    after += shrunk.length;
    done++;
    console.log(`${apply ? "done  " : "would "} ${file.path}  ${kb(original.length)} -> ${kb(shrunk.length)}  (-${Math.round((1 - shrunk.length / original.length) * 100)}%)`);
  } catch (err) {
    failed++;
    after += file.size; // untouched on the server, so it still counts at full size
    console.log(`FAIL   ${file.path}: ${err.message}`);
  }
}

console.log(`\n${apply ? "resized" : "would resize"} ${done}, failed ${failed}`);
console.log(`left untouched (no encoder won): ${(skippedBytes / 1048576).toFixed(1)} MB`);
console.log(`total ${(totalBefore / 1048576).toFixed(1)} MB -> ${(after / 1048576).toFixed(1)} MB (-${Math.round((1 - after / totalBefore) * 100)}%)`);
