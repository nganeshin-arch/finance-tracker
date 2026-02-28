# Batch Scripts Guide

This folder contains convenient batch scripts to run the Personal Finance Tracker application on Windows.

## Available Scripts

### 🚀 start-app.bat
**Main script to start the entire application**

Double-click this file to start both backend and frontend servers in separate terminal windows.

- Opens two command prompt windows
- Backend runs on http://localhost:5000
- Frontend runs on http://localhost:3000
- Close the terminal windows to stop the servers

### 🔧 install-dependencies.bat
**Install all required dependencies**

Run this first if you haven't installed dependencies yet.

- Installs backend npm packages
- Installs frontend npm packages
- Run this after cloning the repository

### 🗄️ setup-database.bat
**Initialize the database**

Run this to set up the database with tables and seed data.

**Prerequisites:**
- PostgreSQL must be installed and running
- Database 'finance_tracker' must exist
- Backend .env file must be configured

### 👤 seed-admin.bat
**Create admin user**

Run this to create an initial admin user for authentication.

**Default credentials:**
- Email: admin@financetracker.com
- Password: Admin@123456

⚠️ **Change password after first login!**

**Prerequisites:**
- Database must be set up (run setup-database.bat first)
- Backend dependencies must be installed

### 📦 start-backend.bat
**Start only the backend server**

Use this if you only want to run the backend API.

- Runs on http://localhost:5000
- Useful for API testing

### 🎨 start-frontend.bat
**Start only the frontend server**

Use this if you only want to run the frontend.

- Runs on http://localhost:3000
- Make sure backend is running separately

### 🏗️ build-app.bat
**Build the application for production**

Creates optimized production builds.

- Backend build → backend/dist/
- Frontend build → frontend/dist/

## Quick Start Guide

### First Time Setup

1. **Install Dependencies**
   ```
   Double-click: install-dependencies.bat
   ```

2. **Setup Database**
   - Make sure PostgreSQL is running
   - Create database: `finance_tracker`
   - Configure backend/.env file
   ```
   Double-click: setup-database.bat
   ```

3. **Create Admin User** (for authentication features)
   ```
   Double-click: seed-admin.bat
   ```
   - Save the displayed credentials
   - Change password after first login

4. **Start Application**
   ```
   Double-click: start-app.bat
   ```

5. **Open Browser**
   - Navigate to http://localhost:3000
   - Log in with admin credentials

### Daily Usage

Just double-click **start-app.bat** to start the application!

## Troubleshooting

### "npm is not recognized"

**Solution:** Add Node.js to your system PATH
1. Find Node.js installation folder (usually C:\Program Files\nodejs)
2. Add to System Environment Variables → Path
3. Restart command prompt

### "PostgreSQL connection failed"

**Solution:** Check database configuration
1. Verify PostgreSQL is running
2. Check backend/.env file has correct credentials
3. Ensure database 'finance_tracker' exists

### Port Already in Use

**Solution:** Kill the process using the port
```cmd
# Find process on port 5000
netstat -ano | findstr :5000

# Kill process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### Scripts Don't Run

**Solution:** Run as Administrator
- Right-click the .bat file
- Select "Run as administrator"

## Manual Commands

If batch scripts don't work, you can run commands manually:

### Backend
```cmd
cd backend
npm install
npm run dev
```

### Frontend
```cmd
cd frontend
npm install
npm run dev
```

### Database
```cmd
cd backend
npm run migrate
```

## Notes

- Keep terminal windows open while using the application
- Press Ctrl+C in terminal to stop servers
- Changes to code will auto-reload (hot reload enabled)
- Check terminal output for errors

## Need Help?

- Check the main README.md for detailed documentation
- See docs/QUICK_START.md for step-by-step guide
- See docs/TROUBLESHOOTING.md for common issues

---

**Tip:** Create desktop shortcuts to these .bat files for even quicker access!
