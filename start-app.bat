@echo off
echo ========================================
echo Personal Finance Tracker - Starting...
echo ========================================
echo.

REM Start Backend Server
echo [1/2] Starting Backend Server...
start "Finance Tracker - Backend" cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak >nul

REM Start Frontend Server
echo [2/2] Starting Frontend Server...
start "Finance Tracker - Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo Application is starting!
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Two terminal windows will open.
echo Close them to stop the servers.
echo.
echo Press any key to exit this window...
pause >nul
