@echo off
echo ========================================
echo PostgreSQL Service Status Check
echo ========================================
echo.

echo Checking if PostgreSQL service is running...
echo.

sc query postgresql* | findstr "STATE"

echo.
echo ========================================
echo.
echo If you see "RUNNING" above, PostgreSQL is active.
echo If not, you need to start the service.
echo.
pause
