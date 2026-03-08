@echo off
echo ========================================
echo   Applying All Latest Changes
echo ========================================
echo.

echo Step 1: Applying updated TransactionForm...
copy /Y frontend\src\components\TransactionForm.updated.tsx frontend\src\components\TransactionForm.tsx
echo   ✓ TransactionForm updated with Indian currency support
echo.

echo Step 2: Clearing browser cache...
echo   Please do this manually:
echo   1. Open browser (Chrome/Edge)
echo   2. Press Ctrl+Shift+Delete
echo   3. Select "Cached images and files"
echo   4. Click "Clear data"
echo.
pause

echo Step 3: Restarting frontend server...
echo   (If frontend is running, stop it first with Ctrl+C)
echo.
echo   Then run: cd frontend
echo   Then run: npm run dev
echo.

echo ========================================
echo   Changes Applied!
echo ========================================
echo.
echo Next steps:
echo 1. Stop frontend server (Ctrl+C in the terminal)
echo 2. Restart: cd frontend then npm run dev
echo 3. Hard refresh browser: Ctrl+Shift+R
echo 4. Test the changes
echo.
pause
