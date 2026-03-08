# 🔒 SSL Error - Quick Fix

## Problem
"This connection is not private" on iPhone Safari

## Cause
Frontend (HTTPS) trying to connect to local IP (HTTP)

## Fix (2 Minutes)

### 1. Add Netlify Environment Variable
- Go to Netlify Dashboard → Site Settings → Environment
- Add: `VITE_API_BASE_URL` = `https://YOUR-RAILWAY-URL/api`

### 2. Update Backend CORS
In `backend/src/index.ts`:
```typescript
origin: [
  'http://localhost:3000',
  'https://your-netlify-site.netlify.app', // Add this
],
```

### 3. Deploy Both
```cmd
git push  # Backend auto-deploys to Railway
deploy-cache-fix.bat  # Deploy frontend
```

### 4. Clear iPhone Cache
Settings → Safari → Clear History and Website Data

## Done! ✅

Open Netlify URL on iPhone → No SSL error → Login works!

---

**Need help?** See `FIX_SSL_ERROR_NOW.md` for detailed guide.

**Automated setup?** Run `configure-production-urls.bat`
