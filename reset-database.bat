@echo off
echo ========================================
echo Reset Database - Personal Finance Tracker
echo ========================================
echo.
echo WARNING: This will DELETE all data in the database!
echo.
pause

echo.
echo Dropping database...
psql -U postgres -c "DROP DATABASE IF EXISTS finance_tracker;"

echo Creating database...
psql -U postgres -c "CREATE DATABASE finance_tracker;"

echo.
echo Database reset complete!
echo.
echo Now run setup-database.bat to create tables and load data.
echo.
pause
