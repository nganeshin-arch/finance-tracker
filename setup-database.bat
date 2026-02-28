@echo off
echo ========================================
echo Database Setup - Personal Finance Tracker
echo ========================================
echo.
echo This script will run database migrations and seed data.
echo.
echo Make sure PostgreSQL is running and the database 'finance_tracker' exists.
echo.
pause

cd backend
echo.
echo Running migrations...
npm run migrate

echo.
echo ========================================
echo Database setup complete!
echo ========================================
echo.
pause
