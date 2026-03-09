@echo off
echo ========================================
echo  UPDATE NETLIFY WITH BACKEND URL
echo ========================================
echo.

echo This script will connect your deployed backend to Netlify frontend.
echo.

REM Get backend URL
set /p BACKEND_URL="Enter your deployed backend URL (without https://): "
if "%BACKEND_URL%"=="" (
    echo ERROR: Backend URL is required!
    echo.
    echo Examples:
    echo - your-app.vercel.app
    echo - your-app.onrender.com
    pause
    exit /b 1
)

echo.
echo ========================================
echo Configuration Summary
echo ========================================
echo Backend URL: https://%BACKEND_URL%
echo Frontend URL: https://keen-strudel-fc96aa.netlify.app
echo.

set /p CONFIRM="Continue? (Y/N): "
if /i not "%CONFIRM%"=="Y" (
    echo Cancelled.
    pause
    exit /b 0
)

echo.
echo [1/3] Updating frontend configuration...

REM Update the api.ts file to use the production URL
powershell -Command "(Get-Content 'frontend/src/services/api.ts') -replace 'baseURL: import.meta.env.VITE_API_BASE_URL \|\| ''http://192.168.29.109:5000/api''', 'baseURL: import.meta.env.VITE_API_BASE_URL || ''https://%BACKEND_URL%/api''' | Set-Content 'frontend/src/services/api.ts'"

echo ✅ Updated API service configuration

echo.
echo [2/3] Building frontend with new backend URL...

cd frontend
call npm run build
if errorlevel 1 (
    echo ERROR: Build failed!
    cd ..
    pause
    exit /b 1
)
cd ..

echo ✅ Frontend built successfully

echo.
echo [3/3] Instructions to update Netlify...
echo.
echo Now update your Netlify site:
echo.
echo 1. Go to: https://app.netlify.com/sites/keen-strudel-fc96aa
echo 2. Click "Deploys" tab
echo 3. Drag and drop the entire 'frontend/dist' folder
echo 4. Wait for deployment (1-2 minutes)
echo.

echo ========================================
echo Test Your Deployment
echo ========================================
echo.
echo 1. Test backend health: https://%BACKEND_URL%/api/health
echo 2. After Netlify update, test frontend: https://keen-strudel-fc96aa.netlify.app
echo.

echo Opening required sites...
start https://app.netlify.com/sites/keen-strudel-fc96aa
start https://%BACKEND_URL%/api/health
echo.

echo ========================================
echo Deployment Complete!
echo ========================================
echo.
echo Your iOS testing app is ready with:
echo ✅ Key Financial Metrics and Trends
echo ✅ Premium UI styling with gradients
echo ✅ Dashboard layout fixes
echo ✅ All accessibility features
echo ✅ Performance optimizations
echo.
echo Test URL: https://keen-strudel-fc96aa.netlify.app
echo.
pause