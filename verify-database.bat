@echo off
echo ========================================
echo Database Data Verification
echo Personal Finance Tracker
echo ========================================
echo.
echo This will show all data currently in the database.
echo.
pause

cd backend
npm run verify

echo.
pause
