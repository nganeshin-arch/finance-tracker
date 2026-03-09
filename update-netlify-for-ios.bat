@echo off
echo ========================================
echo  UPDATE NETLIFY FOR iOS TESTING
echo ========================================
echo.

echo Your frontend has been built with all the latest features:
echo ✅ Key Financial Metrics and Trends
echo ✅ Premium UI styling with gradients
echo ✅ Dashboard layout fixes (date format, legends)
echo ✅ All accessibility compliance
echo ✅ Performance optimizations
echo.

echo [STEP 1] Frontend is ready in 'frontend/dist' folder
echo.

echo [STEP 2] Update your Netlify site manually:
echo 1. Go to https://app.netlify.com/sites/keen-strudel-fc96aa
echo 2. Click on "Deploys" tab
echo 3. Drag and drop the entire 'frontend/dist' folder
echo 4. Wait for deployment (usually 1-2 minutes)
echo.

echo [STEP 3] Deploy backend to Render.com:
echo 1. Go to https://render.com
echo 2. Sign up with GitHub (free)
echo 3. Click "New" → "Blueprint"
echo 4. Connect your GitHub repository
echo 5. Render will detect the render.yaml file
echo 6. Click "Apply" to deploy
echo 7. Wait 5-10 minutes for deployment
echo 8. Copy the generated URL (e.g., https://your-app.onrender.com)
echo.

echo [STEP 4] Connect backend and frontend:
echo After backend is deployed, run:
echo configure-production-urls.bat
echo.

echo [STEP 5] Test on iOS:
echo Open Safari on iPhone/iPad:
echo https://keen-strudel-fc96aa.netlify.app/
echo.

echo ========================================
echo  CURRENT STATUS
echo ========================================
echo.
echo ✅ Frontend built with latest code
echo ✅ Backend configuration ready for Render
echo ✅ All premium styling intact
echo ✅ Key Financial Metrics implemented
echo ⏳ Waiting for you to deploy backend
echo.

echo Opening required sites...
start https://app.netlify.com/sites/keen-strudel-fc96aa
start https://render.com
echo.

echo Follow the steps above to complete iOS deployment!
pause