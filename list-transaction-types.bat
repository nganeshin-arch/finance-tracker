@echo off
cd backend
call npx ts-node src/scripts/listTransactionTypes.ts
pause
