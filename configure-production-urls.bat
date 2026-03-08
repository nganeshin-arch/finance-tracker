@echo off
echo ========================================
echo Configure Production URLs
echo ========================================
echo.
echo This script will help you configure your app for production.
echo.
echo You need:
echo 1. Your Railway backend URL (e.g., my-app.railway.app)
echo 2. Your Netlify site URL (e.g., my-site.netlify.app)
echo.
pause
echo.

REM Get Railway URL
set /p RAILWAY_URL="Enter your Railway backend URL (without https://): "
if "%RAILWAY_URL%"=="" (
    echo ERROR: Railway URL is required!
    pause
    exit /b 1
)

REM Get Netlify URL
set /p NETLIFY_URL="Enter your Netlify site URL (without https://): "
if "%NETLIFY_URL%"=="" (
    echo ERROR: Netlify URL is required!
    pause
    exit /b 1
)

echo.
echo ========================================
echo Configuration Summary
echo ========================================
echo Railway Backend: https://%RAILWAY_URL%
echo Netlify Frontend: https://%NETLIFY_URL%
echo.
echo This will:
echo 1. Update backend CORS to allow Netlify domain
echo 2. Create production environment file
echo 3. Show you how to configure Netlify environment variables
echo.
set /p CONFIRM="Continue? (Y/N): "
if /i not "%CONFIRM%"=="Y" (
    echo Cancelled.
    pause
    exit /b 0
)

echo.
echo ========================================
echo Step 1: Updating Backend CORS
echo ========================================
echo.
echo Please manually update backend/src/index.ts:
echo.
echo Add this to your CORS configuration:
echo   origin: [
echo     'http://localhost:3000',
echo     'http://localhost:5173',
echo     'https://%NETLIFY_URL%',  // Add this line
echo   ],
echo.
pause

echo.
echo ========================================
echo Step 2: Netlify Environment Variables
echo ========================================
echo.
echo Go to Netlify Dashboard and add this environment variable:
echo.
echo Key:   VITE_API_BASE_URL
echo Value: https://%RAILWAY_URL%/api
echo.
echo Steps:
echo 1. Go to https://app.netlify.com
echo 2. Select your site
echo 3. Go to Site Settings ^> Environment Variables
echo 4. Click "Add a variable"
echo 5. Add the key and value above
echo 6. Click "Save"
echo.
pause

echo.
echo ========================================
echo Step 3: Create Production .env
echo ========================================
echo.

REM Create production .env file
(
echo # Production API Configuration
echo VITE_API_BASE_URL=https://%RAILWAY_URL%/api
) > frontend\.env.production

echo Created frontend\.env.production
echo.

echo.
echo ========================================
echo Step 4: Deploy Backend to Railway
echo ========================================
echo.
echo Make sure your backend is deployed to Railway with the CORS changes.
echo.
echo If using Git:
echo   git add .
echo   git commit -m "Update CORS for Netlify"
echo   git push
echo.
echo Railway will auto-deploy.
echo.
pause

echo.
echo ========================================
echo Step 5: Deploy Frontend to Netlify
echo ========================================
echo.
echo Ready to deploy frontend with new configuration?
echo.
set /p DEPLOY="Deploy now? (Y/N): "
if /i not "%DEPLOY%"=="Y" (
    echo.
    echo To deploy later, run: deploy-cache-fix.bat
    pause
    exit /b 0
)

echo.
echo Building and deploying...
cd frontend
call npm run build
if errorlevel 1 (
    echo ERROR: Build failed!
    cd ..
    pause
    exit /b 1
)

echo.
echo Deploying to Netlify...
netlify deploy --prod --dir=dist

cd ..

echo.
echo ========================================
echo Configuration Complete!
echo ========================================
echo.
echo Your app should now work on iPhone!
echo.
echo Next steps:
echo 1. Clear iPhone Safari cache
echo 2. Open https://%NETLIFY_URL%
echo 3. Should show login screen (no SSL error!)
echo.
echo If you still see SSL error:
echo - Verify Railway backend is running
echo - Check Netlify environment variables
echo - Check browser console for errors
echo.
pause
