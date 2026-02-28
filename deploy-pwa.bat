@echo off
echo ========================================
echo   PWA Deployment Helper
echo ========================================
echo.

echo Step 1: Building frontend for production...
cd frontend
call npm run build
echo   ✓ Build complete
echo.

echo Step 2: Your app is ready to deploy!
echo.
echo Next steps:
echo.
echo Option A - Deploy to Vercel (Recommended):
echo   1. Install: npm install -g vercel
echo   2. Run: vercel
echo   3. Follow prompts
echo.
echo Option B - Deploy to Netlify:
echo   1. Install: npm install -g netlify-cli
echo   2. Run: netlify deploy --prod
echo   3. Select 'dist' folder
echo.
echo Option C - Test locally first:
echo   1. Run: npm run preview
echo   2. Open browser to test
echo.
echo ========================================
echo   See PWA_DEPLOYMENT_GUIDE.md for details
echo ========================================
echo.
pause
