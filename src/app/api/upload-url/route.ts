import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

// Buckets the client is allowed to request an upload token for.
const BUCKET_LIMITS: Record<string, number> = {
  "product-images": 10 * 1024 * 1024, // 10MB
  "product-videos": 100 * 1024 * 1024, // 100MB
};

// Whitelist of allowed buckets to prevent path traversal
const ALLOWED_BUCKETS = Object.keys(BUCKET_LIMITS);

/**
 * Issues a short-lived signed upload URL so the browser can upload the file
 * DIRECTLY to Supabase Storage. This deliberately avoids sending the file
 * through this serverless function, which on Vercel is capped at ~4.5MB
 * request bodies (the "Request Entity Too Large" error on video/large images).
 */
export async function POST(req: NextRequest) {
  try {
    const { bucket, ext } = await req.json();

    // Validate bucket against whitelist
    if (!bucket || !ALLOWED_BUCKETS.includes(bucket)) {
      return NextResponse.json({ error: "Invalid or missing bucket." }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Ensure the bucket exists (idempotent).
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    if (!buckets?.some((b) => b.name === bucket)) {
      const { error: createError } = await supabaseAdmin.storage.createBucket(bucket, {
        public: true,
        fileSizeLimit: BUCKET_LIMITS[bucket],
      });
      if (createError && !/already exists/i.test(createError.message)) {
        console.error("Failed to create storage bucket:", createError);
        return NextResponse.json(
          { error: "Failed to initialize storage" },
          { status: 500 }
        );
      }
    }

    const safeExt = String(ext || "bin").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 5) || "bin";
    const path = `products/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${safeExt}`;

    const { data, error } = await supabaseAdmin.storage.from(bucket).createSignedUploadUrl(path);
    if (error) {
      console.error("Failed to create upload URL:", error);
      return NextResponse.json({ error: "Failed to create upload URL" }, { status: 500 });
    }

    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);

    return NextResponse.json({ token: data.token, path: data.path, publicUrl });
  } catch (err) {
    console.error("Upload URL API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
