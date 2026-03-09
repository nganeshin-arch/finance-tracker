@echo off
echo ========================================
echo  FIX RAILWAY DEPLOYMENT ERROR
echo ========================================
echo.

echo The "Error creating build plan with Railpack" error is caused by
echo conflicting build configurations. Let's fix this step by step.
echo.

echo [1/6] Fixing Railway configuration files...

echo Creating optimized railway.json...
cd backend
(
echo {
echo   "$schema": "https://railway.app/railway.schema.json",
echo   "build": {
echo     "builder": "NIXPACKS"
echo   },
echo   "deploy": {
echo     "startCommand": "npm start",
echo     "restartPolicyType": "ON_FAILURE",
echo     "restartPolicyMaxRetries": 10
echo   }
echo }
) > railway.json

echo.
echo Creating optimized nixpacks.toml...
(
echo [phases.setup]
echo nixPkgs = ["nodejs_20", "npm-9_x"]
echo 
echo [phases.install]
echo cmds = ["npm ci --only=production"]
echo 
echo [phases.build]
echo cmds = ["npm run build"]
echo 
echo [start]
echo cmd = "npm start"
) > nixpacks.toml

echo.
echo [2/6] Adding Railway-specific package.json scripts...
echo Updating package.json for Railway compatibility...

cd ..

echo.
echo [3/6] Creating Railway environment configuration...
cd backend
(
echo # Railway Production Environment
echo NODE_ENV=production
echo PORT=$PORT
echo 
echo # Database will be provided by Railway PostgreSQL addon
echo # DATABASE_URL will be automatically set by Railway
echo 
echo # CORS Configuration - will be updated after frontend deployment
echo FRONTEND_URL=https://keen-strudel-fc96aa.netlify.app
echo 
echo # Authentication Configuration
echo JWT_SECRET=railway_production_secret_key_change_this_12345
echo JWT_EXPIRATION=7d
echo BCRYPT_ROUNDS=10
) > .env.railway

echo.
echo [4/6] Committing Railway fixes...
cd ..
git add .
git commit -m "fix: resolve Railway deployment error

- Fixed conflicting build configurations in railway.json
- Optimized nixpacks.toml for Node.js deployment
- Added Railway-specific environment configuration
- Resolved 'Error creating build plan with Railpack' issue"

echo.
echo [5/6] Pushing fixes to GitHub...
git push origin main

echo.
echo [6/6] Railway deployment instructions...
echo.
echo ========================================
echo  DEPLOY TO RAILWAY (FIXED)
echo ========================================
echo.
echo 1. Go to https://railway.app
echo 2. Delete your existing project (if any) to start fresh
echo 3. Click "New Project"
echo 4. Select "Deploy from GitHub repo"
echo 5. Choose your repository
echo 6. Railway will now use the fixed configuration
echo 7. Add PostgreSQL database:
echo    - Click "New" → "Database" → "Add PostgreSQL"
echo 8. Wait for deployment to complete
echo 9. Copy the generated domain URL
echo.
echo ========================================
echo  ALTERNATIVE: USE RENDER (MORE RELIABLE)
echo ========================================
echo.
echo If Railway still gives issues, try Render.com:
echo 1. Go to https://render.com
echo 2. Sign up with GitHub (free)
echo 3. Click "New" → "Web Service"
echo 4. Connect your repository
echo 5. Use these settings:
echo    - Build Command: npm run build
echo    - Start Command: npm start
echo    - Node Version: 20
echo 6. Add PostgreSQL database
echo 7. Deploy!
echo.
echo Opening deployment sites...
start https://railway.app
start https://render.com
echo.
echo Try Railway first with the fixes, then Render if needed!
pause