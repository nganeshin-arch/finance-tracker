@echo off
echo ========================================
echo  DEPLOY FOR iOS TESTING
echo ========================================
echo.

echo This will deploy your app to production so you can test on iOS
echo.
echo You'll need:
echo 1. Railway account (free) - for backend
echo 2. Netlify account (free) - for frontend
echo.
echo Both provide HTTPS URLs that work on iOS devices
echo.
pause

echo [1/6] Building frontend for production...
cd frontend
call npm run build
cd ..

echo.
echo [2/6] Committing latest changes...
git add .
git commit -m "feat: prepare for iOS testing deployment

- Updated Key Financial Metrics and Trends functionality
- Verified premium UI enhancements and color coding
- Ready for production deployment and iOS testing"

echo.
echo [3/6] Pushing to GitHub...
git push origin main

echo.
echo ========================================
echo  DEPLOYMENT INSTRUCTIONS
echo ========================================
echo.
echo BACKEND (Railway):
echo 1. Go to https://railway.app
echo 2. Sign up with GitHub (free)
echo 3. Click "New Project" 
echo 4. Select "Deploy from GitHub repo"
echo 5. Choose your repository
echo 6. Railway will auto-deploy your backend
echo 7. Copy the generated URL (e.g., your-app-abc123.up.railway.app)
echo.
echo FRONTEND (Netlify):
echo 1. Go to https://app.netlify.com
echo 2. Sign up (free)
echo 3. Drag and drop the 'frontend/dist' folder
echo 4. Copy the generated URL (e.g., your-app-abc123.netlify.app)
echo.
echo ========================================
echo  CONFIGURE PRODUCTION URLs
echo ========================================
echo.
echo After deployment, run: configure-production-urls.bat
echo Enter your Railway and Netlify URLs to connect them
echo.
echo ========================================
echo  iOS TESTING URLs
echo ========================================
echo.
echo Once deployed, you'll get:
echo - Frontend: https://your-app.netlify.app
echo - Backend: https://your-app.railway.app
echo.
echo Use the Netlify URL to test on iOS Safari
echo.
pause

echo.
echo Opening deployment sites...
start https://railway.app
start https://app.netlify.com
echo.
echo Follow the instructions above to deploy!
echo.
pause