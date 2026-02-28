@echo off
echo Running migration to add user_id to transactions table...
echo.
cd backend
call npx ts-node src/migrations/010_add_user_id_to_transactions.ts
echo.
echo Migration complete!
pause
