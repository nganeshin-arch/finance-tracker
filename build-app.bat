@echo off
echo ========================================
echo Building Application for Production
echo Personal Finance Tracker
echo ========================================
echo.

echo [1/2] Building Backend...
cd backend
call npm run build
cd ..

echo.
echo [2/2] Building Frontend...
cd frontend
call npm run build
cd ..

echo.
echo ========================================
echo Build Complete!
echo ========================================
echo.
echo Backend build: backend/dist/
echo Frontend build: frontend/dist/
echo.
pause
