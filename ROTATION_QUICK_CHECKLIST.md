# 🔐 QUICK SECRET ROTATION CHECKLIST

**Date:** August 15, 2026  
**Estimated Time:** 30-45 minutes

---

## PRE-ROTATION PREP

- [ ] Read full guide: `SECRET_ROTATION_GUIDE.md`
- [ ] Have access to Supabase dashboard
- [ ] Have access to Resend dashboard
- [ ] Have access to Vercel dashboard
- [ ] Notify team of upcoming changes (if applicable)
- [ ] Schedule during low-traffic period (optional)

---

## STEP 1: SUPABASE (10 min)

- [ ] Login to https://app.supabase.com
- [ ] Navigate to: Settings → API
- [ ] Click "Reset" on Service Role key
- [ ] **COPY new service role key** → Paste in password manager
- [ ] Click "Reset" on Anon key
- [ ] **COPY new anon key** → Paste in password manager
- [ ] **COPY Project URL** → Verify: `https://fqtdhlbfsapkpgnxocpi.supabase.co`

**Keys Collected:**
- ✅ New Service Role Key (starts with `eyJhbGci...`)
- ✅ New Anon Key (starts with `eyJhbGci...`)
- ✅ Project URL confirmed

---

## STEP 2: RESEND (5 min)

- [ ] Login to https://resend.com/dashboard
- [ ] Navigate to: API Keys
- [ ] Click "Create API Key"
- [ ] Name: `Dorcy Vogue Production - 2026-08-15`
- [ ] Permission: "Sending access"
- [ ] **COPY new API key IMMEDIATELY** (starts with `re_`) → Paste in password manager
- [ ] Find old key in dashboard (the previously exposed key)
- [ ] Click "Delete" on old key
- [ ] Confirm deletion

**Keys Collected:**
- ✅ New Resend API Key (starts with `re_`)
- ✅ Old key deleted

---

## STEP 3: ADMIN SECRET (2 min)

**Generate 64-character hex secret using ONE of these methods:**

**PowerShell:**
```powershell
-join ((48..57) + (65..70) | Get-Random -Count 64 | % {[char]$_})
```

**Node.js:**
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Online (if needed):**
https://www.random.org/strings/ → 1 string, 64 chars, Hexadecimal

- [ ] **COPY generated secret** → Paste in password manager

**Keys Collected:**
- ✅ New Admin Reset Secret (64 hex characters)

---

## STEP 4: UPDATE LOCAL ENV (5 min)

- [ ] Open: `c:\Users\TFC\Desktop\DV eWeb\.env.local`
- [ ] Replace `NEXT_PUBLIC_SUPABASE_ANON_KEY` with new anon key
- [ ] Replace `SUPABASE_SERVICE_ROLE_KEY` with new service role key
- [ ] Replace `RESEND_API_KEY` with new Resend key
- [ ] Replace `ADMIN_RESET_SECRET` with new admin secret
- [ ] Save file
- [ ] Verify with: `git status` (should NOT show .env.local)

**Local Environment:**
- ✅ .env.local updated
- ✅ File not tracked by git

---

## STEP 5: UPDATE VERCEL (10 min)

- [ ] Login to https://vercel.com/dashboard
- [ ] Select project: Dorcy Vogue
- [ ] Navigate to: Settings → Environment Variables
- [ ] Edit `NEXT_PUBLIC_SUPABASE_ANON_KEY` → Paste new anon key → Save
- [ ] Edit `SUPABASE_SERVICE_ROLE_KEY` → Paste new service role key → Save
- [ ] Edit `RESEND_API_KEY` → Paste new Resend key → Save
- [ ] Edit `ADMIN_RESET_SECRET` → Paste new admin secret → Save
- [ ] Verify all environments selected: Production, Preview, Development

**Vercel Environment:**
- ✅ All 4 keys updated in Vercel
- ✅ All environments selected

---

## STEP 6: REDEPLOY (5 min)

**Choose ONE method:**

**Option A: Vercel Dashboard**
- [ ] Go to: Deployments tab
- [ ] Click "..." on latest deployment
- [ ] Click "Redeploy"
- [ ] Uncheck "Use existing Build Cache"
- [ ] Click "Redeploy"

**Option B: Git Push**
```powershell
cd "c:\Users\TFC\Desktop\DV eWeb"
git add SECRET_ROTATION_GUIDE.md ROTATION_QUICK_CHECKLIST.md .env.local.template
git commit -m "docs: add secret rotation guide and checklist"
git push origin main
```

- [ ] Wait for deployment to complete (2-5 min)
- [ ] Verify deployment status: ✅ Success

**Deployment:**
- ✅ Application redeployed successfully

---

## STEP 7: TEST EVERYTHING (5 min)

**Test #1: Public Site**
- [ ] Visit: https://dorcyvogue.com
- [ ] Browse products → Should load
- [ ] Add to cart → Should work
- [ ] No console errors

**Test #2: Admin Login**
- [ ] Visit: https://dorcyvogue.com/admin/login
- [ ] Enter credentials
- [ ] Login → Should succeed
- [ ] Dashboard loads

**Test #3: File Upload**
- [ ] Create test order (or use existing)
- [ ] Upload receipt
- [ ] Upload → Should succeed
- [ ] Receipt visible in admin

**Test #4: Database Access**
- [ ] Admin → Orders → Should load
- [ ] Admin → Products → Should load
- [ ] No "Invalid API key" errors

**All Tests:**
- ✅ Public site works
- ✅ Admin login works
- ✅ File uploads work
- ✅ Database access works

---

## STEP 8: VERIFY OLD KEYS REVOKED (3 min)

**Test old Supabase key fails:**
```javascript
// Open browser console on any page and run:
fetch('https://fqtdhlbfsapkpgnxocpi.supabase.co/rest/v1/orders', {
  headers: {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxdGRobGJmc2Fwa3BnbnhvY3BpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzE3ODI1NCwiZXhwIjoyMDk4NzU0MjU0fQ.s0JEDmQAaSFB3VUowJaauL1bXbJ_A69rcM7aZc0xT8Q'
  }
}).then(r => console.log('Status:', r.status))
```

- [ ] Should get: Status: 401 or 403 (Unauthorized)
- [ ] ✅ Old key revoked

**Verification:**
- ✅ Old Supabase key no longer works
- ✅ Old Resend key deleted from dashboard

---

## STEP 9: SECURE NEW KEYS (5 min)

**Store in password manager:**
- [ ] Open: 1Password / Bitwarden / LastPass
- [ ] Create entry: "Dorcy Vogue - Production Keys - 2026-08-15"
- [ ] Add field: `NEXT_PUBLIC_SUPABASE_URL` → Value
- [ ] Add field: `NEXT_PUBLIC_SUPABASE_ANON_KEY` → Value
- [ ] Add field: `SUPABASE_SERVICE_ROLE_KEY` → Value (mark as password)
- [ ] Add field: `RESEND_API_KEY` → Value (mark as password)
- [ ] Add field: `ADMIN_RESET_SECRET` → Value (mark as password)
- [ ] Add field: `ADMIN_EMAIL` → dorcyben001@gmail.com
- [ ] Add note: "Rotated: 2026-08-15 | Next: 2026-11-15"
- [ ] Save entry

**Password Manager:**
- ✅ All keys stored securely
- ✅ Next rotation date noted

---

## STEP 10: NOTIFY TEAM (2 min)

**If other developers exist:**
- [ ] Send secure message to team
- [ ] Share new `.env.local` via password manager or encrypted channel
- [ ] Set deadline for team to update

**If solo developer:**
- [ ] Skip this step

---

## ✅ ROTATION COMPLETE!

**Final Verification:**
- ✅ All 3 platforms updated (Supabase, Resend, Vercel)
- ✅ Local .env.local updated
- ✅ Application redeployed successfully
- ✅ All functionality tested and working
- ✅ Old keys revoked and no longer work
- ✅ New keys stored in password manager
- ✅ Team notified (if applicable)

**Next Steps:**
- 📅 Set calendar reminder: **November 15, 2026** (90 days) for next rotation
- 📋 Update team documentation with new rotation date
- 🔒 Delete this checklist or store securely (contains sensitive info)

---

## 🆘 TROUBLESHOOTING

**Site not working after rotation:**
1. Check Vercel deployment logs
2. Verify all environment variables are correct (no typos)
3. Ensure deployment completed successfully
4. Try clearing browser cache
5. Redeploy if needed

**Need to rollback:**
1. Vercel Dashboard → Deployments
2. Find previous working deployment
3. Click "..." → "Redeploy"

**Still having issues:**
- See full troubleshooting guide in `SECRET_ROTATION_GUIDE.md`
- Check Vercel logs: Vercel Dashboard → Deployments → Logs
- Check Supabase logs: Supabase Dashboard → Logs

---

**Rotation Started:** ___________  
**Rotation Completed:** ___________  
**Total Time:** ___________ minutes  
**Performed By:** ___________  
**Next Rotation Due:** November 15, 2026
