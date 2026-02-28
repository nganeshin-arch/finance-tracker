@echo off
REM Run user_id migration for multi-tenant data isolation

echo ========================================
echo   Multi-Tenant Data Isolation
echo   Database Migration
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

echo [1/3] Running migration...
echo.
call npx ts-node src/migrations/010_add_user_id_to_transactions.ts

if errorlevel 1 (
    echo.
    echo ========================================
    echo   Migration Failed
    echo ========================================
    echo.
    echo Please check the error messages above.
    echo.
    cd ..
    pause
    exit /b 1
)

echo.
echo [2/3] Verifying migration...
echo.
call npx ts-node src/migrations/verify-user-id-migration.ts

if errorlevel 1 (
    echo.
    echo ========================================
    echo   Verification Failed
    echo ========================================
    echo.
    cd ..
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Migration Completed Successfully!
echo ========================================
echo.
echo The database now supports multi-tenant data isolation.
echo.
echo IMPORTANT:
echo   - All existing transactions have been deleted
echo   - Each user will now only see their own data
echo   - Restart the backend server to apply changes
echo.

cd ..
pause
