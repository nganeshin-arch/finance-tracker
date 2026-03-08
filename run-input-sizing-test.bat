@echo off
echo Running Input Sizing Consistency Property Test...
echo.

node_modules\.bin\playwright test input-sizing-consistency.spec.ts

echo.
echo Test execution completed!
pause
