@echo off
echo ========================================
echo  QUICK iOS TESTING (LOCAL TUNNEL)
echo ========================================
echo.

echo This creates a temporary HTTPS URL for immediate iOS testing
echo.

echo [1/3] Installing ngrok (if not installed)...
where ngrok >nul 2>nul
if %errorlevel% neq 0 (
    echo Installing ngrok...
    winget install ngrok
    echo Please restart this script after ngrok installation
    pause
    exit
)

echo.
echo [2/3] Make sure your app is running...
echo - Backend should be on http://localhost:5000
echo - Frontend should be on http://localhost:3000
echo.
echo Press any key when both servers are running...
pause

echo.
echo [3/3] Creating secure tunnel for iOS testing...
echo.
echo Starting ngrok tunnel for frontend...
echo This will create an HTTPS URL you can use on iOS
echo.
echo ========================================
echo  iOS TESTING INSTRUCTIONS
echo ========================================
echo.
echo 1. Copy the HTTPS URL from ngrok (e.g., https://abc123.ngrok.io)
echo 2. Open Safari on your iPhone/iPad
echo 3. Paste the URL and test your app
echo.
echo Note: This is temporary - URL expires when you close ngrok
echo For permanent testing, use: clean-deploy-for-ios.bat
echo.
echo Starting ngrok...
ngrok http 3000