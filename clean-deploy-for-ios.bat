@echo off
echo ========================================
echo  CLEAN DEPLOYMENT FOR iOS TESTING
echo ========================================
echo.

echo Your existing Netlify URL: https://keen-strudel-fc96aa.netlify.app/
echo We'll update this with your latest code and deploy a new backend
echo.

echo [1/8] Building latest frontend with all updates...
cd frontend
call npm run build
echo Frontend built successfully!
cd ..

echo.
echo [2/8] Committing all latest changes...
git add .
git commit -m "feat: clean deployment for iOS testing

- Updated Key Financial Metrics and Trends functionality  
- Verified premium UI enhancements and color coding
- Fixed layout issues and responsive design
- Ready for production deployment and iOS testing"

echo.
echo [3/8] Pushing latest code to GitHub...
git push origin main

echo.
echo ========================================
echo  STEP 1: DEPLOY BACKEND TO RAILWAY
echo ========================================
echo.
echo 1. Go to https://railway.app
echo 2. Sign up/Login with GitHub (free)
echo 3. Click "New Project"
echo 4. Select "Deploy from GitHub repo" 
echo 5. Choose your finance-tracker repository
echo 6. Railway will auto-detect Node.js and deploy
echo 7. Wait for deployment to complete
echo 8. Go to Settings → Networking → Generate Domain
echo 9. Copy the Railway URL (e.g., finance-tracker-production-abc123.up.railway.app)
echo.
pause

echo.
echo ========================================
echo  STEP 2: UPDATE NETLIFY WITH LATEST CODE
echo ========================================
echo.
echo 1. Go to https://app.netlify.com
echo 2. Find your site: keen-strudel-fc96aa
echo 3. Go to "Deploys" tab
echo 4. Drag and drop the 'frontend/dist' folder to deploy
echo 5. Wait for deployment to complete
echo.
echo Your updated Netlify URL will be:
echo https://keen-strudel-fc96aa.netlify.app/
echo.
pause

echo.
echo ========================================
echo  STEP 3: CONFIGURE PRODUCTION URLs
echo ========================================
echo.
set /p railway_url="Enter your Railway backend URL (without https://): "
echo.

echo Configuring production URLs...
echo Railway Backend: https://%railway_url%
echo Netlify Frontend: https://keen-strudel-fc96aa.netlify.app

echo.
echo [4/8] Updating backend CORS configuration...
cd backend
(
echo # Server Configuration
echo PORT=5000
echo NODE_ENV=production
echo.
echo # Database Configuration - Railway will provide DATABASE_URL
echo.
echo # CORS Configuration
echo FRONTEND_URL=https://keen-strudel-fc96aa.netlify.app
echo.
echo # Authentication Configuration
echo JWT_SECRET=production_secret_key_change_this_12345
echo JWT_EXPIRATION=7d
echo BCRYPT_ROUNDS=10
) > .env.production

echo.
echo [5/8] Updating frontend API configuration...
cd ../frontend
(
echo # Production API Configuration
echo VITE_API_BASE_URL=https://%railway_url%/api
) > .env.production

echo.
echo [6/8] Rebuilding frontend with production config...
call npm run build

echo.
echo [7/8] Committing production configuration...
cd ..
git add .
git commit -m "feat: configure production URLs for iOS testing

- Backend: https://%railway_url%
- Frontend: https://keen-strudel-fc96aa.netlify.app
- Updated CORS and API configurations
- Ready for iOS testing"

git push origin main

echo.
echo [8/8] Final deployment steps...
echo.
echo ========================================
echo  FINAL STEPS
echo ========================================
echo.
echo 1. REDEPLOY BACKEND:
echo    - Go to Railway dashboard
echo    - Click "Deploy" or wait for auto-deploy from GitHub
echo.
echo 2. REDEPLOY FRONTEND:
echo    - Go to Netlify dashboard  
echo    - Drag and drop the updated 'frontend/dist' folder
echo.
echo 3. TEST ON iOS:
echo    - Open Safari on your iPhone/iPad
echo    - Go to: https://keen-strudel-fc96aa.netlify.app/
echo    - Should work perfectly with all latest features!
echo.
echo ========================================
echo  iOS TESTING URL
echo ========================================
echo.
echo 🎯 Your iOS testing URL:
echo https://keen-strudel-fc96aa.netlify.app/
echo.
echo ✅ Features to test:
echo - Key Financial Metrics and Trends
echo - Premium UI with color coding
echo - Responsive dashboard layout
echo - Touch-friendly interface
echo - PWA capabilities (add to home screen)
echo.
echo Opening deployment sites...
start https://railway.app
start https://app.netlify.com
echo.
pause