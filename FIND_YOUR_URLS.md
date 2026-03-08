# 🔍 Quick Guide: Find Your URLs

## 🚂 Railway Backend URL

### Steps:
1. Go to https://railway.app
2. Click on your backend project
3. Click on your service
4. Go to **Settings** tab
5. Scroll to **"Networking"** section
6. Look for **"Public Networking"**
7. Copy the domain (e.g., `my-app.railway.app`)

### What to Enter:
```
Enter your Railway backend URL (without https://): my-app.railway.app
```

**Don't include:**
- ❌ `https://`
- ❌ `/api`

---

## 🌐 Netlify Frontend URL

### Steps:
1. Go to https://app.netlify.com
2. Find your site
3. Look at the site name (shown at top)
4. Your URL is: `SITE-NAME.netlify.app`

### What to Enter:
```
Enter your Netlify site URL (without https://): my-site.netlify.app
```

**Don't include:**
- ❌ `https://`

---

## 🆘 Don't Have These Yet?

### No Railway Backend?
You need to deploy your backend first:
1. Go to https://railway.app
2. Create new project
3. Deploy from GitHub
4. Get the generated URL

### No Netlify Site?
You need to deploy your frontend first:
1. Go to https://app.netlify.com
2. Drag and drop `frontend/dist` folder
3. Get the generated URL

---

## ✅ Quick Test

After you find your URLs, test them:

**Backend:**
```
https://YOUR-RAILWAY-URL/api/health
```
Should show: `{"status":"ok"}`

**Frontend:**
```
https://YOUR-NETLIFY-URL
```
Should load your app

---

## 🎯 Example

```
Railway URL: personal-finance-backend-production.up.railway.app
Netlify URL: my-finance-tracker.netlify.app
```

---

**Need help?** Check `HOW_TO_FIND_RAILWAY_URL.md` for detailed instructions!
