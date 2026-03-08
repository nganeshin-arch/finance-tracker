@echo off
echo ========================================
echo   Update Netlify with Latest Code
echo ========================================
echo.

echo Step 1: Building latest version...
cd frontend
call npm run build
echo.

if %ERRORLEVEL% EQU 0 (
    echo ========================================
    echo   ✓ Build Complete!
    echo ========================================
    echo.
    echo Your latest code is now in the dist folder.
    echo.
    echo Next steps to update Netlify:
    echo.
    echo Option 1 - Netlify Drop (Easiest):
    echo   1. Go to https://app.netlify.com/drop
    echo   2. Drag the NEW 'dist' folder onto the page
    echo   3. It will create a new deployment
    echo.
    echo Option 2 - Netlify Dashboard:
    echo   1. Go to https://app.netlify.com
    echo   2. Click on your site
    echo   3. Go to "Deploys" tab
    echo   4. Drag the 'dist' folder to "Drag and drop your site output folder here"
    echo.
    echo Opening dist folder for you...
    pause
    start ..\frontend\dist
    echo.
    echo ✓ Dist folder opened!
    echo   Just drag it to Netlify to update your site.
    echo.
) else (
    echo.
    echo ========================================
    echo   ✗ Build Failed
    echo ========================================
    echo.
    echo Please check the error messages above.
    echo.
)

cd ..
pause
