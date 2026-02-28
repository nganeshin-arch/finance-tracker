@echo off
echo ========================================
echo Installing Dependencies
echo Personal Finance Tracker
echo ========================================
echo.

echo [1/2] Installing Backend Dependencies...
cd backend
call npm install
cd ..

echo.
echo [2/2] Installing Frontend Dependencies...
cd frontend
call npm install
cd ..

echo.
echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Make sure PostgreSQL is running
echo 2. Run setup-database.bat to initialize the database
echo 3. Run start-app.bat to start the application
echo.
pause
