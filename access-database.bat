@echo off
echo ========================================
echo PostgreSQL Database Access
echo Personal Finance Tracker
echo ========================================
echo.
echo Connecting to database: finance_tracker
echo User: postgres
echo.
echo Useful commands:
echo   \dt              - List all tables
echo   \d table_name    - Describe table structure
echo   SELECT * FROM table_name;  - View all data
echo   \q               - Exit
echo.
pause

psql -U postgres -d finance_tracker
