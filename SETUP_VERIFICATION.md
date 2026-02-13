# ⚡ Quick Setup Verification Script

## Run This After Setup

This checklist helps verify your Supabase integration is working correctly.

---

## ✅ Pre-Deployment Checklist

### **1. Environment Variables**
```bash
# Check if .env.local exists
[ -f .env.local ] && echo "✅ .env.local found" || echo "❌ .env.local missing"

# Check if variables are set (run in your app)
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL ? '✅ Set' : '❌ Missing')
console.log('Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing')
```

**Expected:** Both should show ✅

---

### **2. Dependencies**
```bash
# Check if Supabase is installed
npm list @supabase/supabase-js
```

**Expected:** Should show version number (e.g., `2.95.3`)

---

### **3. File Structure**
```bash
# Check all required files exist
ls -la src/utils/supabase/client.ts
ls -la src/utils/supabase/auth.ts
ls -la src/utils/supabase/database.ts
ls -la src/contexts/AuthContext.tsx
ls -la src/app/components/SupabaseLogin.tsx
ls -la src/app/components/MigrationUI.tsx
```

**Expected:** All files should exist

---

### **4. Build Test**
```bash
# Test production build
npm run build
```

**Expected:** 
```
✓ built in XXXXms
✓ index.html
✓ assets/...
```

**If build fails:**
- Check for TypeScript errors
- Check for missing imports
- Run: `npx tsc --noEmit`

---

### **5. Supabase Connection Test**

Create a test file: `test-supabase.js`

```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('Testing Supabase connection...');
  
  // Test 1: Check connection
  const { data, error } = await supabase.from('vehicles').select('count');
  
  if (error) {
    console.error('❌ Connection failed:', error.message);
  } else {
    console.log('✅ Connected to Supabase!');
  }
  
  // Test 2: Check auth
  const { data: session } = await supabase.auth.getSession();
  console.log('Auth status:', session ? '✅ Working' : '⚠️ No session (expected)');
}

testConnection();
```

Run: `node test-supabase.js`

**Expected:** Connection successful

---

## 🧪 Manual Testing Checklist

### **Test 1: Authentication**

1. **Sign Up**
   ```
   Email: test@example.com
   Password: test123
   ```
   - [ ] Account created
   - [ ] Redirected to dashboard
   - [ ] No console errors

2. **Sign Out**
   - [ ] Redirected to login
   - [ ] Session cleared
   - [ ] Can't access protected routes

3. **Sign In**
   - [ ] Can sign in with same credentials
   - [ ] Session restored
   - [ ] Dashboard loads

---

### **Test 2: Database Operations**

1. **Create Vehicle**
   - [ ] Fill form completely
   - [ ] Click save
   - [ ] Vehicle appears in list
   - [ ] Check Supabase table editor - vehicle exists

2. **Update Vehicle**
   - [ ] Edit vehicle details
   - [ ] Save changes
   - [ ] Changes reflected immediately
   - [ ] Check Supabase - data updated

3. **Delete Vehicle**
   - [ ] Delete a vehicle
   - [ ] Vehicle removed from list
   - [ ] Check Supabase - vehicle deleted

---

### **Test 3: Image Upload**

1. **Upload Vehicle Image**
   - [ ] Select image file (< 5MB)
   - [ ] Image uploads successfully
   - [ ] Image displays in app
   - [ ] Check Supabase Storage - file exists

2. **Delete Image**
   - [ ] Remove image from vehicle
   - [ ] Image removed from display
   - [ ] Check Supabase Storage - file deleted

---

### **Test 4: Migration**

1. **Prepare Local Data**
   - Add vehicles to localStorage (use old version)
   - Sign up for new account
   - [ ] Migration UI appears

2. **Run Migration**
   - [ ] Click "Migrate to Cloud"
   - [ ] Progress shown
   - [ ] Success message displayed
   - [ ] Vehicles loaded from database
   - [ ] localStorage cleared

3. **Verify Migration**
   - [ ] All vehicles present
   - [ ] All costs present
   - [ ] Images migrated correctly

---

### **Test 5: Multi-Device Sync**

1. **Device 1:**
   - Add a vehicle
   - Note vehicle ID

2. **Device 2:**
   - Sign in with same account
   - [ ] Vehicle from Device 1 appears
   - [ ] Add cost to vehicle
   - [ ] Sign out

3. **Device 1:**
   - Refresh page
   - [ ] Cost from Device 2 appears
   - [ ] Data synced correctly

---

### **Test 6: Error Handling**

1. **Network Error**
   - Turn off wifi
   - Try to add vehicle
   - [ ] Error message shown
   - [ ] No app crash

2. **Invalid Credentials**
   - Try to sign in with wrong password
   - [ ] Error message shown
   - [ ] Can try again

3. **Database Error**
   - (Temporarily break Supabase URL)
   - [ ] Graceful error handling
   - [ ] User can still navigate

---

## 🚀 Deployment Verification

### **After Deploying to Vercel:**

1. **Visit Deployed URL**
   - Open: `https://your-app.vercel.app`
   - [ ] App loads
   - [ ] No 404 errors
   - [ ] No console errors

2. **Test Core Features**
   - [ ] Sign up works
   - [ ] Sign in works
   - [ ] Add vehicle works
   - [ ] Images upload
   - [ ] PDF export works

3. **Test on Multiple Devices**
   - [ ] Desktop Chrome
   - [ ] Mobile Safari (iOS)
   - [ ] Mobile Chrome (Android)
   - [ ] Desktop Safari
   - [ ] Desktop Firefox

4. **Performance Check**
   - Open Chrome DevTools
   - Lighthouse audit
   - [ ] Performance > 90
   - [ ] Accessibility > 90
   - [ ] Best Practices > 90
   - [ ] SEO > 90

---

## 🐛 Debug Checklist

### **If login doesn't work:**
- [ ] Check Supabase URL in environment variables
- [ ] Check Supabase key is `anon` key (not service_role)
- [ ] Check Auth is enabled in Supabase dashboard
- [ ] Check console for errors
- [ ] Try incognito mode (clear cookies)

### **If vehicles don't save:**
- [ ] Check RLS policies are created
- [ ] Check user is authenticated (console.log)
- [ ] Check Supabase logs for errors
- [ ] Check network tab for failed requests

### **If images don't upload:**
- [ ] Check storage bucket exists
- [ ] Check storage bucket is public
- [ ] Check storage policies are set
- [ ] Check file size < 5MB
- [ ] Check file type is image/*

### **If migration fails:**
- [ ] Check localStorage has data
- [ ] Check console for specific error
- [ ] Try manually adding one vehicle
- [ ] Check Supabase connection

---

## 📊 Monitoring Setup

### **Vercel Analytics**
1. Go to your project on Vercel
2. Click "Analytics" tab
3. [ ] Analytics enabled
4. [ ] Data being collected

### **Supabase Logs**
1. Go to Supabase dashboard
2. Click "Logs" in sidebar
3. Filter by: "Error" or "Warning"
4. [ ] No unexpected errors

### **Error Monitoring (Optional)**
1. Sign up for Sentry: [sentry.io](https://sentry.io)
2. Add Sentry DSN to environment variables
3. Install: `npm install @sentry/react`
4. Configure in App.tsx

---

## ✅ Final Verification

Run through this complete user flow:

1. [ ] Open app
2. [ ] See splash screen
3. [ ] See login screen
4. [ ] Sign up with new account
5. [ ] See welcome screen
6. [ ] Add first vehicle
7. [ ] Upload vehicle image
8. [ ] Add cost to vehicle
9. [ ] View dashboard (shows correct stats)
10. [ ] View reports (charts display)
11. [ ] Export PDF (downloads correctly)
12. [ ] Edit vehicle
13. [ ] Delete vehicle
14. [ ] Sign out
15. [ ] Sign back in
16. [ ] All data still present

**If all ✅:** You're ready to launch! 🚀

**If any ❌:** Check troubleshooting section in guides

---

## 🎉 Success Criteria

Your app is production-ready when:

✅ All authentication flows work
✅ All CRUD operations work
✅ Images upload successfully
✅ Migration completes without errors
✅ No console errors
✅ Mobile responsive
✅ Lighthouse score > 90
✅ Works on multiple browsers
✅ Data syncs across devices
✅ Error messages are user-friendly

---

## 📞 Support

If you're stuck:

1. **Check documentation:**
   - `/COMPLETE_INTEGRATION_GUIDE.md`
   - `/SUPABASE_INTEGRATION_GUIDE.md`
   - `/VERCEL_DEPLOYMENT_GUIDE.md`

2. **Check Supabase docs:**
   - [supabase.com/docs](https://supabase.com/docs)

3. **Check Vercel docs:**
   - [vercel.com/docs](https://vercel.com/docs)

4. **Ask for help:**
   - Supabase Discord
   - Vercel Discord
   - Stack Overflow

---

**Good luck!** 🍀

*If all checks pass, you're ready to change the world of car flipping!* 🚗💰✨
