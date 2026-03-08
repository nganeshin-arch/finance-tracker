@echo off
echo ========================================
echo Verify Admin Changes Commit to Database
echo ========================================
echo.
echo This will test if admin changes persist to the database.
echo.
echo Tests performed:
echo 1. Read existing data
echo 2. Insert test data
echo 3. Update test data
echo 4. Verify changes persist
echo 5. Check database settings
echo.
pause

cd backend
call npx ts-node src/scripts/verifyAdminChanges.ts

echo.
pause
