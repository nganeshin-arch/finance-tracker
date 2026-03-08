# 🚀 Start Application Now - Simple Guide

## ⚡ Quick Start (One Command)

Double-click this file:
```
start-app.bat
```

This will:
1. ✅ Start backend server (Port 5000)
2. ✅ Start frontend server (Port 5173)
3. ✅ Open two terminal windows

**Then open browser:** http://localhost:5173

---

## 🔍 What You'll See

### Terminal 1 (Backend):
```
Server running on port 5000
Database connected successfully
✓ Ready to accept connections
```

### Terminal 2 (Frontend):
```
VITE v5.x.x ready in XXX ms
➜ Local:   http://localhost:5173/
➜ Network: http://192.168.x.x:5173/
```

### Browser:
- Login screen appears
- Enter credentials:
  - Email: `admin@financetracker.com`
  - Password: `Admin@123456`
- Dashboard loads! ✅

---

## 🆘 If It Doesn't Work

### Problem 1: PowerShell Execution Policy Error

**You'll see:**
```
running scripts is disabled on this system
```

**Fix:**
Run this in PowerShell as Administrator:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then try `start-app.bat` again.

### Problem 2: Port Already in Use

**You'll see:**
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Fix:**
```cmd
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F
```

Then try again.

### Problem 3: Database Connection Error

**You'll see:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Fix:**
Start PostgreSQL:
```cmd
start-postgres.bat
```

Or manually:
1. Press `Win + R`
2. Type `services.msc`
3. Find "PostgreSQL"
4. Right-click → Start

### Problem 4: Module Not Found

**You'll see:**
```
Error: Cannot find module 'express'
```

**Fix:**
Install dependencies:
```cmd
cd backend
npm install

cd ../frontend
npm install
```

Then try `start-app.bat` again.

---

## 📱 Access from iPhone (Same WiFi)

### Step 1: Find Your Computer's IP
```cmd
ipconfig
```
Look for IPv4 Address (e.g., 192.168.1.100)

### Step 2: On iPhone Safari
Go to: `http://YOUR-IP:5173`

Example: `http://192.168.1.100:5173`

**Note:** Make sure:
- iPhone and computer on same WiFi
- Windows Firewall allows the connection
- Backend CORS configured (see `RUN_LOCALLY.md`)

---

## 🛑 Stop the Application

**Option 1:** Close both terminal windows

**Option 2:** In each terminal, press `Ctrl + C`

---

## ✅ Checklist

Before starting:
- [ ] Node.js installed (`node --version`)
- [ ] PostgreSQL installed and running
- [ ] Dependencies installed (`npm install` in both folders)

After starting:
- [ ] Backend terminal shows "Server running"
- [ ] Frontend terminal shows "Local: http://localhost:5173"
- [ ] Browser opens to login screen
- [ ] Can log in successfully

---

## 🎯 URLs

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000/api
- **Health Check:** http://localhost:5000/api/health

---

## 💡 Pro Tips

1. **Keep terminals open** - Closing them stops the servers
2. **Check terminal output** - Errors appear there
3. **Hot reload works** - Save files to see changes instantly
4. **Use browser DevTools** - F12 to see console errors

---

## 🚀 Ready to Start?

Run this command:
```cmd
start-app.bat
```

Or double-click the `start-app.bat` file!

---

**Need more help?** Check `RUN_LOCALLY.md` for detailed troubleshooting!
