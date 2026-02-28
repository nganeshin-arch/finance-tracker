@echo off
echo ========================================
echo   Push to GitHub Helper
echo ========================================
echo.

echo Step 1: Create GitHub Repository
echo.
echo Please do the following:
echo 1. Go to https://github.com/new
echo 2. Create a new repository (e.g., "finance-tracker")
echo 3. Choose Private or Public
echo 4. DO NOT initialize with README
echo 5. Click "Create repository"
echo 6. Copy the repository URL
echo.
echo Example URL: https://github.com/yourusername/finance-tracker.git
echo.
set /p REPO_URL=https://github.com/nganeshin-arch/
echo.

echo Step 2: Initializing Git...
git init
echo   ✓ Git initialized
echo.

echo Step 3: Adding files...
git add .
echo   ✓ Files added
echo.

echo Step 4: Creating commit...
git commit -m "Initial commit: Personal Finance Tracker PWA"
echo   ✓ Commit created
echo.

echo Step 5: Setting up remote...
git remote add origin %REPO_URL%
echo   ✓ Remote added
echo.

echo Step 6: Renaming branch to main...
git branch -M main
echo   ✓ Branch renamed
echo.

echo Step 7: Pushing to GitHub...
git push -u origin main
echo.

if %ERRORLEVEL% EQU 0 (
    echo ========================================
    echo   ✓ Successfully pushed to GitHub!
    echo ========================================
    echo.
    echo Next steps:
    echo 1. Go to https://vercel.com
    echo 2. Sign up with GitHub
    echo 3. Import your repository
    echo 4. Deploy!
    echo.
) else (
    echo ========================================
    echo   ✗ Push failed!
    echo ========================================
    echo.
    echo Common issues:
    echo 1. Wrong repository URL
    echo 2. Not authenticated with GitHub
    echo 3. Repository already has content
    echo.
    echo Solutions:
    echo 1. Verify the URL is correct
    echo 2. Run: git config --global user.name "Your Name"
    echo 3. Run: git config --global user.email "your@email.com"
    echo 4. If repo has content, use: git pull origin main --allow-unrelated-histories
    echo.
)

pause
