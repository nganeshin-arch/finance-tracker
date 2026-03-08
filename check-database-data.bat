@echo off
echo ========================================
echo Checking Database Data
echo ========================================
echo.
echo This will show what data exists in your database.
echo.

cd backend
call npx ts-node src/scripts/checkConfigData.ts

echo.
pause
