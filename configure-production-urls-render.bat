@echo off
echo ========================================
echo Configure Production URLs (Render + Netlify)
echo ========================================
echo.
echo This script will help you configure your app for iOS testing.
echo.
echo You need:
echo 1. Your Render backend URL (e.g., your-app.onrender.com)
echo 2. Your Netlify site URL: keen-strudel-fc96aa.netlify.app
echo.
pause
echo.

REM Get Render URL
set /p RENDER_URL="Enter your Render backend URL (without https://): "
if "%RENDER_URL%"=="" (
    echo ERROR: Render URL is required!
    echo.
    echo Example: finance-tracker-backend-abc123.onrender.com
    pause
    exit /b 1
)

REM Set Netlify URL (we know this one)
set NETLIFY_URL=keen-strudel-fc96aa.netlify.app

echo.
echo ========================================
echo Configuration Summary
echo ========================================
echo Render Backend: https://%RENDER_URL%
echo Netlify Frontend: https://%NETLIFY_URL%
echo.
echo This will:
echo 1. Update frontend to use Render backend
echo 2. Create production environment file
echo 3. Rebuild frontend with new configuration
echo 4. Show you how to update Netlify
echo.
set /p CONFIRM="Continue? (Y/N): "
if /i not "%CONFIRM%"=="Y" (
    echo Cancelled.
    pause
    exit /b 0
)

echo.
echo ========================================
echo Step 1: Creating Production Configuration
echo ========================================
echo.

REM Create production .env file
(
echo # Production API Configuration for iOS Testing
echo VITE_API_BASE_URL=https://%RENDER_URL%/api
) > frontend\.env.production

echo Created frontend\.env.production with Render backend URL
echo.

echo ========================================
echo Step 2: Updating API Service Configuration
echo ========================================
echo.

REM Update the api.ts file to use the production URL
echo Updating frontend/src/services/api.ts...

REM Create a temporary file with the updated baseURL
powershell -Command "(Get-Content 'frontend/src/services/api.ts') -replace 'baseURL: import.meta.env.VITE_API_BASE_URL \|\| ''http://192.168.29.109:5000/api''', 'baseURL: import.meta.env.VITE_API_BASE_URL || ''https://%RENDER_URL%/api''' | Set-Content 'frontend/src/services/api.ts'"

echo Updated API service to use Render backend
echo.

echo ========================================
echo Step 3: Building Frontend with New Configuration
echo ========================================
echo.

cd frontend
echo Building frontend with production configuration...
call npm run build
if errorlevel 1 (
    echo ERROR: Build failed!
    cd ..
    pause
    exit /b 1
)
cd ..

echo ✅ Frontend built successfully with Render backend configuration
echo.

echo ========================================
echo Step 4: Update Netlify Site
echo ========================================
echo.
echo Now you need to update your Netlify site:
echo.
echo 1. Go to https://app.netlify.com/sites/keen-strudel-fc96aa
echo 2. Click on "Deploys" tab
echo 3. Drag and drop the entire 'frontend/dist' folder
echo 4. Wait for deployment (1-2 minutes)
echo.
echo OR use Netlify CLI if you have it installed:
echo   cd frontend
echo   netlify deploy --prod --dir=dist
echo.

echo ========================================
echo Step 5: Test Your Backend
echo ========================================
echo.
echo First, test that your Render backend is working:
echo.
echo Open in browser: https://%RENDER_URL%/api/health
echo.
echo You should see a health check response.
echo If not, check your Render deployment logs.
echo.

echo ========================================
echo Step 6: Test on iOS
echo ========================================
echo.
echo After updating Netlify:
echo.
echo 1. Clear Safari cache on iPhone/iPad
echo 2. Open: https://%NETLIFY_URL%
echo 3. Should show login screen without SSL errors
echo 4. Try logging in and using the app
echo.

echo ========================================
echo Configuration Complete!
echo ========================================
echo.
echo Summary of what was done:
echo ✅ Created production environment configuration
echo ✅ Updated API service to use Render backend
echo ✅ Built frontend with new configuration
echo ⏳ Waiting for you to update Netlify
echo.
echo Your iOS testing URL: https://%NETLIFY_URL%
echo.

echo Opening required sites...
start https://app.netlify.com/sites/keen-strudel-fc96aa
start https://%RENDER_URL%/api/health
echo.

echo Follow the steps above to complete iOS deployment!
pause