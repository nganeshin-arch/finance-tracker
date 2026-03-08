@echo off
echo ========================================
echo Restarting Application
echo ========================================
echo.

echo Step 1: Killing processes on ports 5000 and 5173...
echo.

REM Kill process on port 5000 (backend)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do (
    echo Killing backend process: %%a
    taskkill /F /PID %%a 2>nul
)

REM Kill process on port 5173 (frontend)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173') do (
    echo Killing frontend process: %%a
    taskkill /F /PID %%a 2>nul
)

REM Kill process on port 3000 (alternative frontend port)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    echo Killing frontend process: %%a
    taskkill /F /PID %%a 2>nul
)

echo.
echo Step 2: Waiting 2 seconds...
timeout /t 2 /nobreak >nul

echo.
echo Step 3: Starting application...
echo.

REM Start Backend Server
echo Starting Backend Server...
start "Finance Tracker - Backend" cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak >nul

REM Start Frontend Server
echo Starting Frontend Server...
start "Finance Tracker - Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo Application Restarted!
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Two terminal windows have opened.
echo Close them to stop the servers.
echo.
echo Press any key to exit this window...
pause >nul
