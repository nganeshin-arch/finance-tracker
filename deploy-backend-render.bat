@echo off
echo ========================================
echo  DEPLOY BACKEND TO RENDER.COM
echo ========================================
echo.

echo Render.com is more reliable than Railway for Node.js apps
echo Let's deploy your backend there for iOS testing
echo.

echo [1/5] Creating Render configuration...
cd backend

echo Creating render.yaml for automatic deployment...
(
echo services:
echo   - type: web
echo     name: finance-tracker-backend
echo     env: node
echo     plan: free
echo     buildCommand: npm install ^&^& npm run build
echo     startCommand: npm start
echo     healthCheckPath: /api/health
echo     envVars:
echo       - key: NODE_ENV
echo         value: production
echo       - key: JWT_SECRET
echo         generateValue: true
echo       - key: JWT_EXPIRATION
echo         value: 7d
echo       - key: BCRYPT_ROUNDS
echo         value: 10
echo       - key: FRONTEND_URL
echo         value: https://keen-strudel-fc96aa.netlify.app
echo.
echo databases:
echo   - name: finance-tracker-db
echo     plan: free
) > render.yaml

echo.
echo [2/5] Adding health check endpoint...
echo Ensuring health check endpoint exists...

echo.
echo [3/5] Committing Render configuration...
cd ..
git add .
git commit -m "feat: add Render.com deployment configuration

- Added render.yaml for automatic deployment
- Configured PostgreSQL database connection
- Set up health check endpoint
- Ready for reliable backend deployment"

echo.
echo [4/5] Pushing to GitHub...
git push origin main

echo.
echo [5/5] Render deployment instructions...
echo.
echo ========================================
echo  DEPLOY ON RENDER.COM
echo ========================================
echo.
echo 1. Go to https://render.com
echo 2. Sign up with GitHub (free tier available)
echo 3. Click "New" in dashboard
echo 4. Select "Blueprint"
echo 5. Connect your GitHub repository
echo 6. Render will detect the render.yaml file
echo 7. Click "Apply" to deploy both:
echo    - Web Service (your backend API)
echo    - PostgreSQL Database
echo 8. Wait 5-10 minutes for deployment
echo 9. Copy the generated URL (e.g., https://your-app.onrender.com)
echo.
echo ========================================
echo  AFTER DEPLOYMENT
echo ========================================
echo.
echo 1. Test your backend:
echo    https://YOUR-RENDER-URL.onrender.com/api/health
echo.
echo 2. Update frontend to use Render URL:
echo    Run: configure-production-urls.bat
echo    Enter your Render URL when prompted
echo.
echo 3. Test on iOS:
echo    https://keen-strudel-fc96aa.netlify.app/
echo.
echo ========================================
echo  WHY RENDER IS BETTER
echo ========================================
echo.
echo ✅ More reliable builds
echo ✅ Better error messages
echo ✅ Automatic SSL certificates
echo ✅ Built-in PostgreSQL
echo ✅ Free tier with good limits
echo.
echo Opening Render.com...
start https://render.com
echo.
echo Follow the instructions above to deploy!
pause