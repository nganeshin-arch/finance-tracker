@echo off
echo Running Button Variants Unit Tests...
echo.
cd /d "%~dp0"
call npx playwright test button-variants.spec.ts --reporter=list
echo.
pause
