# 🚂 How to Find Your Railway Backend URL

## 📍 Step-by-Step Guide

### Method 1: Railway Dashboard (Easiest)

1. **Go to Railway**
   - Open https://railway.app in your browser
   - Log in to your account

2. **Find Your Project**
   - Look for your backend project (e.g., "PersonalFinanceMgmtApp" or "finance-backend")
   - Click on it

3. **Open Your Service**
   - You should see your backend service
   - Click on it

4. **Find the Public Domain**
   - Look for **"Settings"** tab
   - Scroll down to **"Networking"** section
   - Find **"Public Networking"**
   - You'll see a URL like:
     - `personal-finance-backend-production.up.railway.app`
     - OR `your-app-abc123.railway.app`
   - **Copy this URL** (without https://)

5. **Test It**
   - Open in browser: `https://YOUR-URL/api/health`
   - Should show: `{"status":"ok"}` or similar

---

## 🔍 What If I Don't See a Public Domain?

### Option A: Generate a Domain

1. In Railway dashboard → Your service
2. Go to **Settings** tab
3. Scroll to **Networking** section
4. Click **"Generate Domain"**
5. Railway will create a public URL for you
6. Copy the generated URL

### Option B: Check Deployments

1. In Railway dashboard → Your service
2. Go to **Deployments** tab
3. Click on the latest deployment
4. Look for **"Deployment URL"** or **"Public URL"**
5. Copy it

---

## 📋 What to Enter in the Script

When the script asks:
```
Enter your Railway backend URL (without https://):
```

**Enter ONLY the domain**, for example:
- ✅ `personal-finance-backend-production.up.railway.app`
- ✅ `my-app-abc123.railway.app`
- ❌ `https://my-app.railway.app` (don't include https://)
- ❌ `https://my-app.railway.app/api` (don't include /api)

---

## 🌐 What About Netlify URL?

When the script asks for Netlify URL:
```
Enter your Netlify site URL (without https://):
```

**Enter ONLY the domain**, for example:
- ✅ `my-finance-tracker.netlify.app`
- ✅ `personal-finance-app.netlify.app`
- ❌ `https://my-app.netlify.app` (don't include https://)

### How to Find Netlify URL:

1. Go to https://app.netlify.com
2. Find your site
3. Look at the site name at the top
4. Or check **Site Settings** → **General** → **Site information** → **Site name**
5. Your URL is: `YOUR-SITE-NAME.netlify.app`

---

## 🆘 I Don't Have Railway Backend Yet!

If you haven't deployed your backend to Railway:

### Quick Railway Deployment:

1. **Go to Railway**
   - https://railway.app
   - Sign up/Login (can use GitHub)

2. **Create New Project**
   - Click **"New Project"**
   - Select **"Deploy from GitHub repo"**
   - Connect your GitHub account
   - Select your backend repository

3. **Configure**
   - Railway will auto-detect Node.js
   - Add environment variables if needed
   - Click **"Deploy"**

4. **Get URL**
   - After deployment, go to Settings → Networking
   - Generate domain
   - Copy the URL

---

## 🎯 Example Configuration

Here's what you'll enter in the script:

```
Enter your Railway backend URL (without https://): personal-finance-backend-production.up.railway.app
Enter your Netlify site URL (without https://): my-finance-tracker.netlify.app
```

The script will then:
1. Configure backend CORS: `https://my-finance-tracker.netlify.app`
2. Configure frontend API: `https://personal-finance-backend-production.up.railway.app/api`
3. Deploy everything

---

## ✅ Verification

After entering the URLs, verify they work:

### Test Backend:
```
https://YOUR-RAILWAY-URL/api/health
```
Should return: `{"status":"ok"}`

### Test Frontend:
```
https://YOUR-NETLIFY-URL
```
Should load your app (no SSL error!)

---

## 💡 Pro Tip

If you're not sure about your URLs, you can:

1. **Check your browser history** - you might have visited them before
2. **Check your email** - Railway/Netlify send deployment emails with URLs
3. **Check Git commits** - might have URLs in commit messages
4. **Ask me!** - Share your Railway/Netlify project names and I can help

---

## 🚀 Ready?

Once you have both URLs:
1. Run `configure-production-urls.bat` again
2. Enter Railway URL (without https://)
3. Enter Netlify URL (without https://)
4. Follow the prompts
5. Done! ✅

---

Need help finding your URLs? Let me know your Railway/Netlify project names!
