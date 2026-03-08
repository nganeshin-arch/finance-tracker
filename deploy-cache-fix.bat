@echo off
echo ========================================
echo Deploying Cache Fix to Netlify
echo ========================================
echo.

echo Building frontend...
cd frontend
call npm run build
if errorlevel 1 (
    echo ERROR: Build failed!
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo Build successful! Deploying to Netlify...
echo.

REM Check if netlify CLI is available
where netlify >nul 2>nul
if errorlevel 1 (
    echo.
    echo Netlify CLI not found!
    echo.
    echo Please deploy manually:
    echo 1. Go to https://app.netlify.com
    echo 2. Find your site
    echo 3. Drag and drop the 'frontend\dist' folder
    echo.
    echo OR install Netlify CLI:
    echo npm install -g netlify-cli
    echo.
    pause
    exit /b 0
)

REM Deploy to production
netlify deploy --prod --dir=frontend/dist

echo.
echo ========================================
echo Deployment Complete!
echo ========================================
echo.
echo IMPORTANT: Clear iPhone Cache Now!
echo.
echo On your iPhone:
echo 1. Open Settings ^> Safari
echo 2. Tap "Clear History and Website Data"
echo 3. Confirm
echo 4. Close all Safari tabs
echo 5. Open your app URL in a new tab
echo 6. Should now show LOGIN screen!
echo.
echo If still not working:
echo - Try force refresh (pull down and hold)
echo - Check Settings ^> Safari ^> Advanced ^> Website Data
echo - Delete your site's data
echo.
pause
