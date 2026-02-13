# 🚀 Vercel Deployment Guide

## Step-by-Step Deployment to Production

---

## Prerequisites

Before deploying, make sure you have:
- ✅ Supabase project set up
- ✅ Database tables created
- ✅ Storage bucket configured
- ✅ Code committed to GitHub
- ✅ Environment variables ready

---

## Part 1: Prepare Your Code for Deployment

### **1.1 Create `.env.local` File**

Create a file called `.env.local` in your project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

⚠️ **Replace with your actual values from Supabase Settings → API**

### **1.2 Update `.gitignore`**

Make sure these lines are in your `.gitignore`:

```
# Environment variables
.env
.env.local
.env.production

# Build output
dist
.vercel

# Dependencies
node_modules
```

### **1.3 Verify Build Works Locally**

Test your production build locally:

```bash
npm run build
```

You should see:
```
✓ built in 1234ms
✓ index.html           x KB
✓ assets/index.js      x KB
```

---

## Part 2: Push Code to GitHub

### **2.1 Initialize Git Repository (if not already done)**

```bash
git init
git add .
git commit -m "Initial commit - Rebuild Profit Tracker"
```

### **2.2 Create GitHub Repository**

1. Go to [github.com](https://github.com)
2. Click **"New Repository"**
3. Name it: `rebuild-profit-tracker`
4. Make it **Private** (recommended)
5. Click **"Create repository"**

### **2.3 Push to GitHub**

```bash
git remote add origin https://github.com/YOUR_USERNAME/rebuild-profit-tracker.git
git branch -M main
git push -u origin main
```

---

## Part 3: Deploy to Vercel

### **3.1 Sign Up for Vercel**

1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"**
3. Choose **"Continue with GitHub"**
4. Authorize Vercel to access your repositories

### **3.2 Import Your Project**

1. Click **"Add New..."** → **"Project"**
2. Select your repository: `rebuild-profit-tracker`
3. Click **"Import"**

### **3.3 Configure Project**

**Framework Preset:** Vite
**Root Directory:** ./ (leave as is)
**Build Command:** `npm run build`
**Output Directory:** `dist`

### **3.4 Add Environment Variables**

⚠️ **CRITICAL STEP**

In the "Environment Variables" section, add:

```
VITE_SUPABASE_URL = https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY = your-anon-key-here
```

**Make sure to:**
- ✅ Select all environments (Production, Preview, Development)
- ✅ Copy values from your Supabase dashboard
- ✅ No quotes around values
- ✅ No spaces in variable names

### **3.5 Deploy**

1. Click **"Deploy"**
2. Wait 1-2 minutes ⏳
3. See **"Congratulations!"** 🎉

---

## Part 4: Configure Custom Domain (Optional)

### **4.1 Buy a Domain**

Recommended registrars:
- [Namecheap](https://www.namecheap.com) - $10-15/year
- [Google Domains](https://domains.google) - $12/year
- [Cloudflare](https://www.cloudflare.com) - $10/year

**Suggested names:**
- `rebuildprofittracker.com`
- `carfliptracker.com`
- `repairprofits.com`

### **4.2 Add Domain to Vercel**

1. In your Vercel project, go to **Settings** → **Domains**
2. Enter your domain: `yourdomain.com`
3. Click **"Add"**

### **4.3 Configure DNS**

Vercel will show you DNS records to add:

**Option A: Using Vercel Nameservers (Easiest)**
1. Copy Vercel's nameservers
2. Go to your domain registrar
3. Replace existing nameservers with Vercel's

**Option B: Using A Records**
1. Add an A record:
   - **Type:** A
   - **Name:** @
   - **Value:** `76.76.21.21`
   - **TTL:** 300

2. Add CNAME for www:
   - **Type:** CNAME
   - **Name:** www
   - **Value:** `cname.vercel-dns.com.`
   - **TTL:** 300

### **4.4 Wait for DNS Propagation**

- Usually takes 5-30 minutes
- Can take up to 48 hours in rare cases
- Check status at: [dnschecker.org](https://dnschecker.org)

---

## Part 5: Configure Supabase for Production

### **5.1 Update Supabase Auth Settings**

1. Go to **Authentication** → **URL Configuration**
2. Add your Vercel URL to:
   - **Site URL:** `https://your-app.vercel.app`
   - **Redirect URLs:** 
     - `https://your-app.vercel.app/**`
     - `https://yourdomain.com/**` (if using custom domain)

### **5.2 Update CORS Settings**

If using Storage, update CORS in Supabase:
1. Go to **Storage** → **Policies**
2. Ensure policies allow your Vercel domain

---

## Part 6: Post-Deployment Checklist

### **6.1 Test Everything**

Visit your deployed app and test:

- [ ] **Authentication**
  - [ ] Sign up works
  - [ ] Sign in works
  - [ ] Sign out works
  - [ ] Session persists on refresh

- [ ] **Vehicles**
  - [ ] Add new vehicle
  - [ ] Edit vehicle
  - [ ] Delete vehicle
  - [ ] Upload images

- [ ] **Costs**
  - [ ] Add cost
  - [ ] Edit cost
  - [ ] Delete cost

- [ ] **Reports**
  - [ ] Dashboard loads
  - [ ] Charts display
  - [ ] PDF export works

- [ ] **Migration**
  - [ ] Migration UI appears (if local data exists)
  - [ ] Migration completes successfully

### **6.2 Monitor Performance**

1. Run Lighthouse audit:
   - Open Chrome DevTools
   - Go to "Lighthouse" tab
   - Run audit
   - Target: >90 score

2. Check Vercel Analytics:
   - Go to your project → **Analytics**
   - Monitor page load times
   - Check error rates

### **6.3 Set Up Alerts**

**Vercel:**
1. Go to **Settings** → **Integrations**
2. Add Slack/Discord webhook
3. Get notified of deployments and errors

**Supabase:**
1. Go to **Settings** → **Billing**
2. Set up usage alerts
3. Monitor database size

---

## Part 7: Continuous Deployment

### **7.1 Automatic Deployments**

Now, every time you push to GitHub:
- **main branch** → Deploys to production
- **feature branches** → Creates preview deployments

### **7.2 Preview Deployments**

When you create a Pull Request:
1. Vercel automatically creates a preview
2. Share preview URL with testers
3. Test changes before merging

### **7.3 Rollback if Needed**

If something breaks:
1. Go to **Deployments** in Vercel
2. Find last working deployment
3. Click **"..."** → **"Promote to Production"**

---

## Part 8: Environment-Specific Settings

### **8.1 Development vs Production**

Create different Supabase projects for:
- **Development:** Test locally without affecting prod data
- **Production:** Live user data

Update `.env.local` for development:
```env
VITE_SUPABASE_URL=https://dev-project.supabase.co
VITE_SUPABASE_ANON_KEY=dev-anon-key
```

Add production variables in Vercel dashboard.

---

## Part 9: Security Best Practices

### **9.1 Environment Variables**

- ✅ Never commit `.env` files to Git
- ✅ Use different keys for dev/prod
- ✅ Rotate keys if exposed
- ✅ Only use `anon` key in frontend (never `service_role`)

### **9.2 Supabase Security**

- ✅ Enable RLS on all tables
- ✅ Review security policies
- ✅ Enable email confirmation
- ✅ Set up rate limiting

### **9.3 Vercel Security**

- ✅ Enable "Preview Deployment Protection"
- ✅ Add password to preview deployments
- ✅ Use Vercel Firewall (Pro plan)

---

## Part 10: Monitoring & Maintenance

### **10.1 What to Monitor**

**Daily:**
- Error logs in Vercel
- Supabase database usage
- User signups/activity

**Weekly:**
- Performance metrics
- API response times
- User feedback

**Monthly:**
- Security updates
- Dependency updates
- Backup verification

### **10.2 Update Dependencies**

```bash
# Check for updates
npm outdated

# Update packages
npm update

# Audit security
npm audit

# Fix vulnerabilities
npm audit fix
```

### **10.3 Database Backups**

**Supabase Pro Plan:**
- Automatic daily backups
- Point-in-time recovery
- Download backups manually

**Free Plan:**
- Manually export data weekly
- Store backups in Google Drive/Dropbox

---

## Part 11: Scaling Considerations

### **11.1 Current Free Tier Limits**

**Vercel Free:**
- 100GB bandwidth/month
- Unlimited deployments
- 100 builds/day

**Supabase Free:**
- 500MB database
- 1GB file storage
- 50,000 monthly active users

### **11.2 When to Upgrade**

**Vercel Pro ($20/mo):**
- Need more bandwidth (1TB)
- Want password protection
- Need Web Analytics

**Supabase Pro ($25/mo):**
- Database > 500MB
- Need automatic backups
- > 50K users

---

## Part 12: Troubleshooting

### **Issue: "Build Failed"**

**Solution:**
```bash
# Test build locally first
npm run build

# Check for TypeScript errors
npx tsc --noEmit

# Clear cache
rm -rf node_modules
npm install
```

### **Issue: "Environment Variables Not Working"**

**Solution:**
1. Check variable names match exactly (with `VITE_` prefix)
2. Redeploy after adding variables
3. Check variable is set for "Production" environment
4. No quotes or spaces in values

### **Issue: "Authentication Not Working"**

**Solution:**
1. Check Supabase URL configuration
2. Add Vercel domain to Supabase Auth settings
3. Clear browser cache
4. Check browser console for errors

### **Issue: "Images Not Loading"**

**Solution:**
1. Check Supabase Storage policies
2. Verify bucket is public or policies allow access
3. Check CORS settings in Supabase

---

## Part 13: Going Live Checklist

### **Before Launch:**

- [ ] All features tested on production
- [ ] No console errors
- [ ] Lighthouse score > 90
- [ ] Mobile responsive tested
- [ ] Privacy policy added
- [ ] Terms of service added
- [ ] Support email set up
- [ ] Analytics configured
- [ ] Error monitoring active
- [ ] Database backups enabled
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active
- [ ] Beta testers approved

### **Launch Day:**

- [ ] Monitor error logs
- [ ] Watch server performance
- [ ] Check user signups
- [ ] Respond to support requests
- [ ] Share on social media
- [ ] Send to beta users

### **Post-Launch:**

- [ ] Collect user feedback
- [ ] Fix critical bugs ASAP
- [ ] Plan feature updates
- [ ] Write documentation
- [ ] Create tutorials

---

## 🎉 Congratulations!

Your app is now live and production-ready!

**Your Live URL:**
- Vercel: `https://rebuild-profit-tracker.vercel.app`
- Custom Domain: `https://yourdomain.com` (if configured)

---

## Quick Commands Reference

```bash
# Local development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to Vercel (if using Vercel CLI)
vercel deploy --prod

# Check for updates
npm outdated

# Update dependencies
npm update

# Run security audit
npm audit
```

---

## Support & Resources

- **Vercel Docs:** [vercel.com/docs](https://vercel.com/docs)
- **Supabase Docs:** [supabase.com/docs](https://supabase.com/docs)
- **Vite Docs:** [vitejs.dev](https://vitejs.dev)

---

**Need Help?**

Check the troubleshooting guide or create an issue on GitHub.

Good luck with your launch! 🚀
