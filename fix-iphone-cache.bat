@echo off
echo ========================================
echo iPhone Cache Fix - Deploy to Netlify
echo ========================================
echo.

echo Step 1: Building frontend with cache fixes...
cd frontend
call npm run build
if errorlevel 1 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)
cd ..

echo.
echo Step 2: Deploying to Netlify...
echo.
echo IMPORTANT: After deployment completes:
echo 1. Clear Safari cache on iPhone
echo 2. Close all Safari tabs
echo 3. Open app in new tab
echo 4. Should now ask for login!
echo.

REM Check if netlify CLI is available
where netlify >nul 2>nul
if errorlevel 1 (
    echo Netlify CLI not found. Please deploy manually:
    echo 1. Go to Netlify dashboard
    echo 2. Drag and drop the 'frontend/dist' folder
    echo 3. Or use: netlify deploy --prod --dir=frontend/dist
    pause
    exit /b 1
)

REM Deploy to production
netlify deploy --prod --dir=frontend/dist

echo.
echo ========================================
echo Deployment Complete!
echo ========================================
echo.
echo Next Steps on iPhone:
echo 1. Open Settings ^> Safari
echo 2. Tap "Clear History and Website Data"
echo 3. Confirm
echo 4. Open your app URL in Safari
echo 5. Should now show login screen!
echo.
pause
