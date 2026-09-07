# 🔐 SECRET ROTATION GUIDE - STEP BY STEP
**Date:** August 15, 2026  
**Status:** ⚠️ IMMEDIATE ACTION REQUIRED

---

## 🚨 WHY THIS IS CRITICAL

Your Supabase service role key, Resend API key, and admin reset secret were hardcoded in the source code and potentially exposed in:
1. Git commit history
2. GitHub repository (if pushed)
3. Build artifacts
4. Browser DevTools (for client-side code)

**Even though we removed them from the code, anyone who accessed them before needs to be locked out by rotating the keys.**

---

## 📋 ROTATION CHECKLIST

### ✅ Step 1: Generate New Supabase Service Role Key

1. **Go to Supabase Dashboard:**
   - Visit: https://app.supabase.com
   - Log in with your account
   - Select your project: `fqtdhlbfsapkpgnxocpi`

2. **Navigate to API Settings:**
   - Click "Settings" in left sidebar
   - Click "API" tab

3. **Reset Service Role Key:**
   - Find "service_role" key (starts with `eyJhbGci...`)
   - Click "Reset" or "Regenerate" button
   - **⚠️ WARNING:** This will invalidate the old key immediately
   - Copy the new key to a secure location

4. **Reset Anon Key (Public Key):**
   - Find "anon" key (public key)
   - Click "Reset" or "Regenerate" button
   - Copy the new key

5. **Copy Your Supabase URL:**
   - Find "Project URL" (should be: `https://fqtdhlbfsapkpgnxocpi.supabase.co`)
   - Confirm it matches

**Expected Format:**
- Service Role Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey...` (very long JWT token)
- Anon Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey...` (different JWT token)

---

### ✅ Step 2: Generate New Resend API Key

1. **Go to Resend Dashboard:**
   - Visit: https://resend.com/dashboard
   - Log in with your account

2. **Navigate to API Keys:**
   - Click "API Keys" in left sidebar

3. **Create New API Key:**
   - Click "Create API Key" or "+ New API Key"
   - Name it: `Dorcy Vogue Production - 2026-08-15`
   - Select permission: "Sending access" (full access)
   - Click "Create"
   - **⚠️ IMPORTANT:** Copy the key immediately (starts with `re_`)
   - You won't be able to see it again!

4. **Delete Old API Key:**
   - Find the old exposed key in your dashboard
   - Click "Delete" or trash icon
   - Confirm deletion

**Expected Format:**
- New API Key: `re_XXXXXXXXXXXXXXXXXXXXXXXX` (starts with `re_`)

---

### ✅ Step 3: Generate New Admin Reset Secret

This is a custom secret used in your `/api/admin-reset-password` endpoint.

**Option A: Use OpenSSL (Recommended - Most Secure)**
1. Open PowerShell
2. Run this command:
   ```powershell
   # Generate 32-byte (256-bit) random hex string
   -join ((48..57) + (65..70) | Get-Random -Count 64 | % {[char]$_})
   ```

**Option B: Use Online Generator (If OpenSSL not available)**
1. Visit: https://www.random.org/strings/
2. Settings:
   - Number of strings: 1
   - Length: 64
   - Characters: Hexadecimal
   - Click "Get Strings"

**Option C: Use Node.js (If available)**
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Expected Format:**
- New Secret: 64 hexadecimal characters (e.g., `a3f7b9d2c4e8f1a6b3d7e9f2c5a8b1d4e7f3a6b9c2d5e8f1a4b7c9d2e5f8a1b4`)

---

### ✅ Step 4: Update Local .env.local File

1. **Open `.env.local` in your project root:**
   ```powershell
   notepad c:\Users\TFC\Desktop\DV eWeb\.env.local
   ```

2. **Update with new keys:**
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://fqtdhlbfsapkpgnxocpi.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<NEW_ANON_KEY_FROM_STEP_1>
   SUPABASE_SERVICE_ROLE_KEY=<NEW_SERVICE_ROLE_KEY_FROM_STEP_1>

   # Resend API Configuration
   RESEND_API_KEY=<NEW_RESEND_KEY_FROM_STEP_2>

   # Admin Configuration
   ADMIN_EMAIL=dorcyben001@gmail.com
   ADMIN_RESET_SECRET=<NEW_RANDOM_SECRET_FROM_STEP_3>

   # Site Configuration
   NEXT_PUBLIC_SITE_URL=https://dorcyvogue.com
   ```

3. **Save and close the file**

4. **Verify the file is not tracked by git:**
   ```powershell
   git status
   # Should NOT show .env.local in changes
   ```

---

### ✅ Step 5: Update Vercel Environment Variables

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/dashboard
   - Log in with your account
   - Select your project: `dorcy-vogue` or similar

2. **Navigate to Environment Variables:**
   - Click "Settings" tab
   - Click "Environment Variables" in left sidebar

3. **Update Each Variable:**

   For each variable below, click the "Edit" button and replace with new values:

   **NEXT_PUBLIC_SUPABASE_URL**
   - Value: `https://fqtdhlbfsapkpgnxocpi.supabase.co`
   - Environments: Production, Preview, Development

   **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - Value: `<NEW_ANON_KEY_FROM_STEP_1>`
   - Environments: Production, Preview, Development

   **SUPABASE_SERVICE_ROLE_KEY**
   - Value: `<NEW_SERVICE_ROLE_KEY_FROM_STEP_1>`
   - Environments: Production, Preview, Development
   - **⚠️ SENSITIVE:** This is the most critical key

   **RESEND_API_KEY**
   - Value: `<NEW_RESEND_KEY_FROM_STEP_2>`
   - Environments: Production, Preview, Development

   **ADMIN_RESET_SECRET**
   - Value: `<NEW_RANDOM_SECRET_FROM_STEP_3>`
   - Environments: Production, Preview, Development

   **ADMIN_EMAIL**
   - Value: `dorcyben001@gmail.com`
   - Environments: Production, Preview, Development

   **NEXT_PUBLIC_SITE_URL**
   - Value: `https://dorcyvogue.com`
   - Environments: Production, Preview, Development

4. **Click "Save" after each update**

---

### ✅ Step 6: Redeploy Application

After updating all environment variables in Vercel:

**Option A: Trigger Redeploy from Vercel Dashboard**
1. Go to "Deployments" tab
2. Click "..." menu on latest deployment
3. Click "Redeploy"
4. Select "Use existing Build Cache" → NO (uncheck it)
5. Click "Redeploy"

**Option B: Trigger Redeploy via Git Push**
1. Make a small change (e.g., add comment to README)
2. Commit and push:
   ```powershell
   git add README.md
   git commit -m "chore: trigger redeploy after secret rotation"
   git push origin main
   ```
3. Vercel will auto-deploy

**Option C: Use Vercel CLI**
```powershell
vercel --prod
```

---

### ✅ Step 7: Test Everything Works

After redeployment completes (usually 2-5 minutes):

1. **Test Public Site:**
   - Visit: https://dorcyvogue.com
   - Browse products
   - Add item to cart
   - Should load without errors

2. **Test Authentication:**
   - Visit: https://dorcyvogue.com/admin/login
   - Log in with admin credentials
   - Should successfully authenticate

3. **Test File Upload:**
   - Create a test order
   - Upload a receipt
   - Should upload successfully

4. **Test Database Access:**
   - Admin dashboard should load orders
   - Products should display correctly
   - No "Invalid API key" errors

5. **Check Browser Console:**
   - Open DevTools (F12)
   - No errors related to Supabase or authentication

**If any test fails:**
- Double-check environment variables in Vercel
- Ensure no typos in keys
- Verify keys are in correct environment (Production)
- Check Vercel deployment logs for errors

---

### ✅ Step 8: Verify Old Keys Are Revoked

**Test that old keys no longer work:**

1. **Test Old Supabase Key (Should Fail):**
   ```javascript
   // This should return 401 Unauthorized
   fetch('https://fqtdhlbfsapkpgnxocpi.supabase.co/rest/v1/orders', {
     headers: {
       'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxdGRobGJmc2Fwa3BnbnhvY3BpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzE3ODI1NCwiZXhwIjoyMDk4NzU0MjU0fQ.s0JEDmQAaSFB3VUowJaauL1bXbJ_A69rcM7aZc0xT8Q',
       'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxdGRobGJmc2Fwa3BnbnhvY3BpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzE3ODI1NCwiZXhwIjoyMDk4NzU0MjU0fQ.s0JEDmQAaSFB3VUowJaauL1bXbJ_A69rcM7aZc0xT8Q'
     }
   })
   ```
   Expected: 401 or 403 error

2. **Test Old Resend Key (Should Fail):**
   - Try sending email with the old exposed Resend key
   - Should get "Invalid API key" error

**✅ If old keys fail → Rotation successful!**

---

### ✅ Step 9: Document New Keys Securely

**Store new keys in secure password manager:**
1. Use: 1Password, Bitwarden, LastPass, or similar
2. Create entry: "Dorcy Vogue - Production Keys"
3. Add all new keys with labels
4. Add rotation date: August 15, 2026
5. Share with authorized team members only

**DO NOT:**
- ❌ Email keys to anyone
- ❌ Store in plain text files
- ❌ Share via Slack/WhatsApp/SMS
- ❌ Commit to git (even private repos)
- ❌ Store in screenshots

**DO:**
- ✅ Use password manager
- ✅ Use encrypted secret management (Vercel, AWS Secrets Manager)
- ✅ Limit access to need-to-know basis
- ✅ Set reminder to rotate in 90 days

---

### ✅ Step 10: Update Team (If Applicable)

If other developers work on this project:

1. **Notify team of rotation:**
   ```
   Subject: URGENT: Production secrets rotated - Action required
   
   Team,
   
   We've rotated all production secrets for security reasons.
   
   Action Required:
   1. Pull latest code from main branch
   2. Request new .env.local from me (secure channel only)
   3. Restart your local dev server
   
   Old keys will no longer work.
   
   Timeline: Complete by [date]
   ```

2. **Securely share new `.env.local`:**
   - Use encrypted file sharing (not email)
   - Or use secret management tool
   - Or share via password manager

---

## 🔒 SECURITY BEST PRACTICES GOING FORWARD

### Regular Key Rotation Schedule:
- **Production keys:** Every 90 days
- **After security incident:** Immediately
- **When team member leaves:** Within 24 hours
- **After accidental exposure:** Immediately

### Access Control:
- Use principle of least privilege
- Separate development and production keys
- Use different keys per environment
- Audit who has access quarterly

### Monitoring:
- Set up alerts for unusual API usage
- Monitor Supabase dashboard for strange queries
- Check Resend for unexpected email volume
- Review Vercel logs regularly

---

## ✅ ROTATION COMPLETION CHECKLIST

Before marking this as complete, verify:

- [ ] New Supabase service role key generated
- [ ] New Supabase anon key generated
- [ ] New Resend API key generated
- [ ] Old Resend API key deleted
- [ ] New admin reset secret generated (64 chars)
- [ ] Local `.env.local` updated with all new keys
- [ ] `.env.local` confirmed NOT tracked by git
- [ ] All Vercel environment variables updated
- [ ] Application redeployed successfully
- [ ] Production site loads and works correctly
- [ ] Admin login works
- [ ] File uploads work
- [ ] Old keys verified as revoked (failed tests)
- [ ] New keys stored in password manager
- [ ] Team notified (if applicable)
- [ ] Rotation date documented

**Estimated Time:** 30-45 minutes  
**Downtime:** None (if done correctly)  
**Risk Level:** Low (if following steps carefully)

---

## 🆘 TROUBLESHOOTING

### "Invalid API key" errors after rotation:
- Check Vercel environment variables for typos
- Ensure you updated ALL environments (Production, Preview, Development)
- Verify deployment completed successfully
- Clear browser cache and try again

### Site not loading after rotation:
- Check Vercel deployment logs for errors
- Verify NEXT_PUBLIC_SUPABASE_URL is correct
- Ensure anon key matches the one from Supabase dashboard
- Try redeploying

### Admin login not working:
- Verify SUPABASE_SERVICE_ROLE_KEY is correct
- Check that user still exists in Supabase Auth
- Try password reset flow

### File uploads failing:
- Verify storage bucket permissions in Supabase
- Check SUPABASE_SERVICE_ROLE_KEY has storage access
- Review Supabase storage logs

---

## 📞 NEED HELP?

If you encounter issues during rotation:

1. **Check Vercel Deployment Logs:**
   - Vercel Dashboard → Deployments → Latest → View Logs

2. **Check Supabase Logs:**
   - Supabase Dashboard → Logs → View errors

3. **Rollback if necessary:**
   - Vercel Dashboard → Deployments → Previous → Redeploy

4. **Contact Support:**
   - Vercel Support: https://vercel.com/support
   - Supabase Support: https://supabase.com/support

---

**Created:** August 15, 2026  
**Last Updated:** August 15, 2026  
**Next Rotation Due:** November 15, 2026 (90 days)
