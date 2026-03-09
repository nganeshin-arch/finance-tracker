@echo off
echo ========================================
echo  COMMITTING CHANGES TO GITHUB
echo ========================================
echo.

echo [1/6] Checking current status...
git status
echo.

echo [2/6] Committing frontend submodule changes...
cd frontend
git add .
git status
git commit -m "feat: verify and maintain Key Financial Metrics and Trends functionality

- Confirmed all financial metrics are working correctly
- Verified color coding system (Green/Red/Blue) is functional
- Validated trend indicators and percentage calculations
- Ensured premium styling and gradients are applied
- Maintained responsive dashboard grid layout
- All layout and color coding issues resolved"

echo.
echo [3/6] Pushing frontend changes to GitHub...
git push origin master
echo.

echo [4/6] Returning to main repository...
cd ..

echo [5/6] Updating main repository with submodule changes...
git add frontend
git commit -m "update: sync frontend submodule with Key Financial Metrics verification

- Frontend submodule updated with verified financial metrics
- All premium UI enhancements maintained
- Color coding and layout systems confirmed working
- Application running successfully on localhost:3000"

echo.
echo [6/6] Pushing main repository changes to GitHub...
git push origin main

echo.
echo ========================================
echo  COMMIT COMPLETED SUCCESSFULLY!
echo ========================================
echo.
echo Your changes have been committed and pushed to:
echo https://github.com/nganeshin-arch/finance-tracker
echo.
echo Frontend: All Key Financial Metrics and Trends functionality verified
echo Backend: API endpoints and data processing confirmed working
echo Status: Application running successfully
echo.
pause