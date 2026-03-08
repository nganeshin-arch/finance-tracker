@echo off
echo Running WCAG Contrast Compliance Property Test...
echo.
cd /d "%~dp0"
call npx playwright test wcag-contrast-compliance.spec.ts --reporter=list
pause
