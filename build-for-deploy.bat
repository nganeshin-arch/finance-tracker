@echo off
echo ========================================
echo   Building App for Deployment
echo ========================================
echo.

echo Step 1: Going to frontend folder...
cd frontend
echo   ✓ In frontend folder
echo.

echo Step 2: Building production version...
echo   (This may take 1-2 minutes)
echo.
call npm run build
echo.

if %ERRORLEVEL% EQU 0 (
    echo ========================================
    echo   ✓ Build Successful!
    echo ========================================
    echo.
    echo The 'dist' folder has been created at:
    echo   frontend\dist
    echo.
    echo Next steps:
    echo.
    echo Option 1 - Netlify Drop (Easiest):
    echo   1. Go to https://app.netlify.com/drop
    echo   2. Drag the 'frontend\dist' folder onto the page
    echo   3. Done! You get a URL instantly
    echo.
    echo Option 2 - Open dist folder:
    echo   1. Press any key to open the dist folder
    echo   2. You can then drag it to Netlify
    echo.
    pause
    
    echo Opening dist folder...
    start ..\frontend\dist
    
) else (
    echo.
    echo ========================================
    echo   ✗ Build Failed
    echo ========================================
    echo.
    echo Please check the error messages above.
    echo Common issues:
    echo   - Missing dependencies (run: npm install)
    echo   - Syntax errors in code
    echo   - Out of memory
    echo.
)

cd ..
pause
