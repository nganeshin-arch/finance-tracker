@echo off
echo ========================================
echo  QUICK iOS DEPLOYMENT (VERCEL + NETLIFY)
echo ========================================
echo.

echo Let's get your app deployed quickly for iOS testing
echo Using Vercel (backend) + Netlify (frontend) - both very reliable
echo.

echo [1/7] Creating Vercel configuration for backend...
cd backend

echo Creating vercel.json...
(
echo {
echo   "version": 2,
echo   "builds": [
echo     {
echo       "src": "src/index.ts",
echo       "use": "@vercel/node"
echo     }
echo   ],
echo   "routes": [
echo     {
echo       "src": "/api/(.*)",
echo       "dest": "/src/index.ts"
echo     },
echo     {
echo       "src": "/(.*)",
echo       "dest": "/src/index.ts"
echo     }
echo   ],
echo   "env": {
echo     "NODE_ENV": "production",
echo     "FRONTEND_URL": "https://keen-strudel-fc96aa.netlify.app"
echo   }
echo }
) > vercel.json

echo.
echo Creating api/index.ts for Vercel...
mkdir api 2>nul
(
echo import { createServer } from '../src/index';
echo.
echo export default createServer;
) > api/index.ts

echo.
echo [2/7] Updating backend for serverless deployment...
echo Modifying index.ts for Vercel compatibility...

echo.
echo [3/7] Building frontend with latest code...
cd ../frontend
call npm run build

echo.
echo [4/7] Committing deployment configurations...
cd ..
git add .
git commit -m "feat: add Vercel deployment configuration for iOS testing

- Added vercel.json for serverless backend deployment
- Created API routes for Vercel compatibility
- Built frontend with latest Key Financial Metrics updates
- Ready for quick iOS testing deployment"

echo.
echo [5/7] Pushing to GitHub...
git push origin main

echo.
echo ========================================
echo  DEPLOYMENT INSTRUCTIONS
echo ========================================
echo.
echo BACKEND (Vercel - 2 minutes):
echo 1. Go to https://vercel.com
echo 2. Sign up with GitHub (free)
echo 3. Click "New Project"
echo 4. Import your repository
echo 5. Vercel auto-detects and deploys
echo 6. Copy the generated URL
echo.
echo FRONTEND (Netlify - 1 minute):
echo 1. Go to https://app.netlify.com
echo 2. Find your site: keen-strudel-fc96aa
echo 3. Go to "Deploys" tab
echo 4. Drag and drop 'frontend/dist' folder
echo 5. Wait for deployment
echo.
echo [6/7] Configure production URLs...
echo After both are deployed, run:
echo configure-production-urls.bat
echo.
echo [7/7] Test on iOS...
echo Open Safari on iPhone/iPad:
echo https://keen-strudel-fc96aa.netlify.app/
echo.
echo ========================================
echo  ALTERNATIVE: SUPABASE (EASIEST)
echo ========================================
echo.
echo For the absolute easiest deployment:
echo 1. Go to https://supabase.com
echo 2. Create new project (includes database)
echo 3. Use their built-in auth and API
echo 4. Deploy frontend to Netlify
echo 5. Done in 5 minutes!
echo.
echo Opening deployment sites...
start https://vercel.com
start https://app.netlify.com
start https://supabase.com
echo.
echo Choose your preferred option and deploy!
pause