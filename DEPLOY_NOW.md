# 🚀 Deploy to Vercel - Step by Step

## Your Supabase Credentials (You'll need these!)

**Project URL:** `https://ftcewkqrtmfcnlwcbhjt.supabase.co`
**Anon Key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0Y2V3a3FydG1mY25sd2NiaGp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5ODgyNDYsImV4cCI6MjA4NjU2NDI0Nn0.7VZ6mw35wDLM4r_LUcZBxjf4MAOuu1eI16431HKE_VI`

---

## STEP 1: Push to GitHub (If not already done)

### Option A: If you don't have a GitHub repo yet

1. **Go to GitHub.com**
2. Click the **"+"** icon → **"New repository"**
3. Name it: `rebuild-profit-tracker`
4. Make it **Private** (recommended)
5. **DO NOT** initialize with README
6. Click **"Create repository"**

7. **In your terminal, run these commands:**

```bash
# Initialize git (if not done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Rebuild Profit Tracker with Supabase"

# Add your GitHub repo (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/rebuild-profit-tracker.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Option B: If you already have a GitHub repo

```bash
# Just commit and push
git add .
git commit -m "Add Supabase integration and deployment config"
git push
```

---

## STEP 2: Deploy to Vercel

### 2.1 Sign Up for Vercel

1. Go to **https://vercel.com**
2. Click **"Sign Up"**
3. Choose **"Continue with GitHub"**
4. Authorize Vercel to access your repositories

### 2.2 Import Your Project

1. Click **"Add New..."** → **"Project"**
2. Find `rebuild-profit-tracker` in the list
3. Click **"Import"**

### 2.3 Configure Build Settings

Vercel should auto-detect everything, but verify:

- **Framework Preset:** Vite
- **Root Directory:** `./`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### 2.4 Add Environment Variables ⚠️ CRITICAL!

Click **"Environment Variables"** and add these **EXACTLY**:

**Variable 1:**
```
Name:  VITE_SUPABASE_URL
Value: https://ftcewkqrtmfcnlwcbhjt.supabase.co
```

**Variable 2:**
```
Name:  VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0Y2V3a3FydG1mY25sd2NiaGp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5ODgyNDYsImV4cCI6MjA4NjU2NDI0Nn0.7VZ6mw35wDLM4r_LUcZBxjf4MAOuu1eI16431HKE_VI
```

**Important:**
- ✅ Select **all environments** (Production, Preview, Development)
- ✅ No quotes around values
- ✅ Exact names (with VITE_ prefix)

### 2.5 Deploy!

1. Click **"Deploy"**
2. Wait 1-2 minutes ⏳
3. See **"Congratulations!"** 🎉

---

## STEP 3: Configure Supabase for Production

### 3.1 Add Vercel URL to Supabase

1. After deployment, Vercel will show you a URL like:
   - `https://rebuild-profit-tracker.vercel.app`

2. Go to **Supabase Dashboard**
3. Click **Authentication** → **URL Configuration**
4. Add these URLs:

**Site URL:**
```
https://rebuild-profit-tracker.vercel.app
```

**Redirect URLs:**
```
https://rebuild-profit-tracker.vercel.app/**
```

5. Click **"Save"**

---

## STEP 4: Test Your Deployed App

1. **Visit your Vercel URL**
2. **Sign in** with your account (ossyokis@gmail.com)
3. **Test features:**
   - ✅ Add a vehicle
   - ✅ Upload an image
   - ✅ Add costs
   - ✅ View dashboard
   - ✅ Export PDF

4. **Check Supabase:**
   - Go to Table Editor → vehicles
   - You should see the vehicle you just added!

---

## 🎉 Success!

Your app is now live at:
- **Your URL:** `https://rebuild-profit-tracker.vercel.app`
- **Custom domain:** (optional, configure later)

---

## 🔄 Automatic Deployments

From now on, every time you push to GitHub:
- **main branch** → Deploys to production automatically
- **Other branches** → Creates preview deployments

---

## 🌐 Optional: Add Custom Domain

### If you want a custom domain like `yourapp.com`:

1. **Buy a domain** (Namecheap, Google Domains, etc.)
2. **In Vercel:**
   - Go to your project → **Settings** → **Domains**
   - Add your domain
   - Follow DNS instructions
3. **Wait for DNS propagation** (5-30 minutes)
4. **Update Supabase** redirect URLs with new domain

---

## 📊 Monitor Your App

### Vercel Dashboard:
- **Analytics:** View visitor stats
- **Deployments:** See deployment history
- **Logs:** Check for errors

### Supabase Dashboard:
- **Database:** View stored data
- **Storage:** Check uploaded images
- **Auth:** Monitor user signups

---

## 🐛 Troubleshooting

### "Build failed"
- Check Vercel logs for errors
- Make sure environment variables are set
- Test build locally: `npm run build`

### "App loads but can't sign in"
- Check environment variables in Vercel
- Make sure Supabase URL configuration is updated
- Clear browser cache

### "Vehicles not loading"
- Check browser console for errors
- Verify Supabase connection
- Check RLS policies are enabled

---

## 🎯 Quick Commands Reference

```bash
# Local development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Push updates
git add .
git commit -m "Your changes"
git push
```

---

## 📞 Support

If something doesn't work:
1. Check Vercel deployment logs
2. Check browser console
3. Check Supabase logs
4. Review error messages

---

**Ready to deploy? Follow the steps above!** 🚀
