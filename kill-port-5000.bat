@echo off
echo ========================================
echo Killing Process on Port 5000
echo ========================================
echo.

REM Find process using port 5000
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do (
    echo Found process: %%a
    taskkill /F /PID %%a
)

echo.
echo ========================================
echo Port 5000 is now free!
echo ========================================
echo.
echo You can now run: start-app.bat
echo.
pause
