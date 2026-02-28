@echo off
REM Seed Admin User Script for Personal Finance Tracker
REM This script creates an initial admin user in the database

echo ========================================
echo   Personal Finance Tracker
echo   Admin User Seed Script
echo ========================================
echo.

REM Check if backend directory exists
if not exist "backend" (
    echo ERROR: backend directory not found!
    echo Please run this script from the project root directory.
    pause
    exit /b 1
)

REM Navigate to backend directory
cd backend

echo Checking if node_modules exists...
if not exist "node_modules" (
    echo node_modules not found. Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
    echo.
)

echo Running admin seed script...
echo.
call npm run seed:admin

if errorlevel 1 (
    echo.
    echo ========================================
    echo   Admin Seed Failed
    echo ========================================
    echo.
    echo Please check the error messages above.
    echo Common issues:
    echo   - PostgreSQL is not running
    echo   - Database does not exist
    echo   - Users table has not been created (run migrations first)
    echo   - Database credentials in .env are incorrect
    echo.
    cd ..
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Admin Seed Completed Successfully
echo ========================================
echo.
echo You can now log in with the admin credentials shown above.
echo.

cd ..
pause
