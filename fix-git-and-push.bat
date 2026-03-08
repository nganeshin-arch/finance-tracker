@echo off
echo ========================================
echo   Fix Git Remote and Push
echo ========================================
echo.

echo Step 1: Removing incorrect remote...
git remote remove origin
echo   ✓ Old remote removed
echo.

echo Step 2: Adding correct remote...
git remote add origin https://github.com/nganeshin-arch/finance-tracker.git
echo   ✓ Correct remote added
echo.

echo Step 3: Verifying remote...
git remote -v
echo.

echo Step 4: Attempting to push...
echo.
echo If this fails, the repository might not exist on GitHub yet.
echo Please create it first at: https://github.com/new
echo.
pause

git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   ✓ Successfully pushed to GitHub!
    echo ========================================
    echo.
    echo Your code is now on GitHub!
    echo URL: https://github.com/nganeshin-arch/finance-tracker
    echo.
    echo Next: Deploy to Vercel
    echo 1. Go to https://vercel.com
    echo 2. Sign in with GitHub
    echo 3. Import your repository
    echo 4. Deploy!
    echo.
) else (
    echo.
    echo ========================================
    echo   ✗ Push failed - Repository not found
    echo ========================================
    echo.
    echo The repository doesn't exist on GitHub yet.
    echo.
    echo Please do this:
    echo 1. Go to https://github.com/new
    echo 2. Repository name: finance-tracker
    echo 3. Owner: nganeshin-arch
    echo 4. Visibility: Private (recommended)
    echo 5. DO NOT check "Initialize with README"
    echo 6. Click "Create repository"
    echo 7. Run this script again
    echo.
)

pause
