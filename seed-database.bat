@echo off
echo ========================================
echo Seeding Database with Initial Data
echo ========================================
echo.
echo This will populate your database with:
echo - Transaction Types (Income, Expense, Transfer)
echo - Categories (22 expense categories, 8 income categories, 5 transfer categories)
echo - Sub-Categories (for various categories)
echo - Payment Modes (Cash, Credit Card, UPI, etc.)
echo - Sample Accounts
echo.
pause

cd backend
call npm run seed

if errorlevel 1 (
    echo.
    echo ========================================
    echo ERROR: Seeding failed!
    echo ========================================
    echo.
    echo Possible causes:
    echo 1. Database is not running
    echo 2. Database connection error
    echo 3. Migration not run yet
    echo.
    echo Try these fixes:
    echo 1. Start PostgreSQL: start-postgres.bat
    echo 2. Run migrations: npm run migrate
    echo 3. Check database connection in backend/.env
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo Database Seeded Successfully!
echo ========================================
echo.
echo Your database now has:
echo ✅ Transaction Types
echo ✅ Categories
echo ✅ Sub-Categories
echo ✅ Payment Modes
echo ✅ Sample Accounts
echo.
echo You can now:
echo 1. Refresh your admin page
echo 2. See all the categories and transaction types
echo 3. Start adding transactions!
echo.
pause
