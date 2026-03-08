@echo off
echo Running Typography Weight Consistency Property Test...
echo.
cd /d "%~dp0"
call npx playwright test typography-weight-consistency.spec.ts --reporter=list
pause
