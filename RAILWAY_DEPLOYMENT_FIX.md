# Fix Railway Deployment

## Issue: Build Failed in 2 Seconds

This happens because Railway is looking in the wrong directory.

## ✅ Quick Fix

### Step 1: Configure Railway Settings

1. **Go to** your Railway project dashboard
2. **Click** on your service (the one that failed)
3. **Go to** "Settings" tab
4. **Find** "Root Directory"
5. **Set it to**: `backend`
6. **Click** "Save"

### Step 2: Add Environment Variables

Still in Settings, go to "Variables" tab and add:

```
NODE_ENV=production
PORT=5000
JWT_SECRET=change-this-to-a-random-secret-key-12345
JWT_EXPIRATION=7d
BCRYPT_ROUNDS=10
```

### Step 3: Redeploy

1. **Go to** "Deployments" tab
2. **Click** "Deploy" button (top right)
3. **Or** click the three dots on failed deployment → "Redeploy"
4. **Wait** ~2-3 minutes

---

## 🔍 Check Build Logs

If it still fails:

1. **Click** on the failed deployment
2. **View** the build logs
3. **Look for** the specific error message
4. **Common issues**:
   - Missing `package.json` → Check Root Directory is set to `backend`
   - Missing dependencies → Railway will install them
   - Build errors → Check your code compiles locally

---

## 📋 Required Files (Already Created)

I've created these files to help Railway:

- ✅ `backend/railway.json` - Railway configuration
- ✅ `backend/nixpacks.toml` - Build configuration

These tell Railway how to build your backend.

---

## 🎯 Complete Railway Setup Checklist

### In Railway Dashboard:

- [ ] Root Directory set to `backend`
- [ ] Environment variables added
- [ ] PostgreSQL database added
- [ ] Database variables auto-connected
- [ ] Deployment triggered

### Environment Variables Needed:

```
NODE_ENV=production
PORT=5000
JWT_SECRET=your-random-secret-here
JWT_EXPIRATION=7d
BCRYPT_ROUNDS=10
FRONTEND_URL=https://your-netlify-site.netlify.app
```

Database variables (auto-added by Railway):
- DATABASE_URL
- PGHOST
- PGPORT
- PGUSER
- PGPASSWORD
- PGDATABASE

---

## 🚀 After Successful Deployment

### Step 1: Get Your Backend URL

1. **Go to** your Railway service
2. **Click** "Settings"
3. **Find** "Domains"
4. **Copy** the Railway URL (e.g., `https://your-app.up.railway.app`)

### Step 2: Run Database Migrations

1. **Go to** "Deployments" tab
2. **Click** on successful deployment
3. **Click** "View Logs"
4. **Look for** a terminal/shell option
5. **Run**:
   ```bash
   npm run migrate
   npm run seed
   npm run seed:admin
   ```

Or use Railway CLI:
```bash
railway login
railway link
railway run npm run migrate
railway run npm run seed
railway run npm run seed:admin
```

### Step 3: Update Frontend

1. **Edit** `frontend/src/services/api.ts`
2. **Change** API_BASE_URL:
   ```typescript
   const API_BASE_URL = 'https://your-app.up.railway.app/api';
   ```
3. **Run** `update-netlify.bat`
4. **Upload** new dist folder to Netlify

---

## 🆘 Still Having Issues?

### Error: "Cannot find module"

**Solution**: Make sure Root Directory is set to `backend`

### Error: "Port already in use"

**Solution**: Railway handles ports automatically, just use `process.env.PORT`

### Error: "Database connection failed"

**Solution**: 
1. Make sure PostgreSQL is added
2. Check DATABASE_URL is in environment variables
3. Railway auto-connects the database

### Error: "Build timeout"

**Solution**: 
1. Check your `package.json` has a `build` script
2. Make sure dependencies are in `dependencies`, not `devDependencies`

---

## 💡 Alternative: Use Render Instead

If Railway keeps failing, try Render (also free):

1. **Go to** https://render.com
2. **Sign up** with GitHub
3. **New** → "Web Service"
4. **Connect** your repository
5. **Settings**:
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
6. **Add** PostgreSQL database
7. **Deploy**

---

## ✅ Success Indicators

Your backend is working when:

- ✅ Deployment shows "Active"
- ✅ Logs show "Server is running on port 5000"
- ✅ You can access `https://your-backend-url.railway.app/health`
- ✅ Health check returns `{"status":"ok"}`

---

## 🎉 Next Steps

Once backend is deployed:

1. Update frontend API URL
2. Rebuild frontend
3. Upload to Netlify
4. Test on iPhone
5. Enjoy your app!

---

**Need help?** Check the Railway logs for specific error messages and we can troubleshoot from there!
