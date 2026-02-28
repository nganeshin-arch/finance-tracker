@echo off
echo ========================================
echo Starting PostgreSQL Service
echo ========================================
echo.
echo This requires Administrator privileges.
echo.
pause

net start postgresql-x64-14

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo PostgreSQL started successfully!
    echo ========================================
) else (
    echo.
    echo ========================================
    echo Failed to start PostgreSQL.
    echo ========================================
    echo.
    echo Try these alternatives:
    echo 1. Right-click this file and "Run as administrator"
    echo 2. Open Services (services.msc) and start PostgreSQL manually
    echo 3. Check the exact service name in Services
    echo.
)

echo.
pause
