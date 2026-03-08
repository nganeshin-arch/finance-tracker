@echo off
echo ========================================
echo   Push Railway Configuration Fix
echo ========================================
echo.

echo Adding Railway config files...
git add backend/railway.json backend/nixpacks.toml
echo.

echo Committing changes...
git commit -m "Fix Railway deployment configuration"
echo.

echo Pushing to GitHub...
git push
echo.

if %ERRORLEVEL% EQU 0 (
    echo ========================================
    echo   ✓ Changes Pushed!
    echo ========================================
    echo.
    echo Railway will automatically redeploy.
    echo Wait ~2-3 minutes and check Railway dashboard.
    echo.
) else (
    echo.
    echo ========================================
    echo   ✗ Push Failed
    echo ========================================
    echo.
    echo Railway config files are ready, but couldn't push to GitHub.
    echo.
    echo Manual steps:
    echo 1. In Railway dashboard, go to your service
    echo 2. Click "Settings"
    echo 3. Find "Start Command"
    echo 4. Set it to: npm run build ^&^& npm start
    echo 5. Click "Save"
    echo 6. Redeploy
    echo.
)

pause
