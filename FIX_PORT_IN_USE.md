# 🔧 Fix "Port Already in Use" Error

## 🎯 The Problem

You're seeing:
```
Error: listen EADDRINUSE: address already in use :::5000
```

This means another instance of the backend is already running on port 5000.

---

## ✅ Quick Fix (Easiest)

### Option 1: Use Restart Script
```cmd
restart-app.bat
```

This will:
1. Kill any processes on ports 5000, 5173, and 3000
2. Wait 2 seconds
3. Start backend and frontend fresh
4. Done! ✅

### Option 2: Kill Port 5000 Only
```cmd
kill-port-5000.bat
```

Then run:
```cmd
start-app.bat
```

---

## 🔍 Manual Fix

### Step 1: Find the Process

**Windows Command:**
```cmd
netstat -ano | findstr :5000
```

**You'll see something like:**
```
TCP    0.0.0.0:5000    0.0.0.0:0    LISTENING    12345
```

The last number (12345) is the Process ID (PID).

### Step 2: Kill the Process

```cmd
taskkill /F /PID 12345
```

Replace `12345` with your actual PID.

### Step 3: Start the App

```cmd
start-app.bat
```

---

## 🔍 Find All Node Processes

To see all running Node.js processes:

```cmd
tasklist | findstr node
```

To kill all Node.js processes:

```cmd
taskkill /F /IM node.exe
```

**Warning:** This kills ALL Node.js processes, including other apps!

---

## 🆘 Still Not Working?

### Check Multiple Ports

Sometimes frontend also has port conflicts:

**Port 5173 (Vite):**
```cmd
netstat -ano | findstr :5173
taskkill /F /PID <PID>
```

**Port 3000 (Alternative):**
```cmd
netstat -ano | findstr :3000
taskkill /F /PID <PID>
```

### Restart Your Computer

If nothing works, restart your computer to clear all ports.

---

## 💡 Why This Happens

Common causes:
1. **Previous instance didn't close** - You closed the terminal but the process kept running
2. **Crash without cleanup** - App crashed but process remained
3. **Multiple starts** - Accidentally started the app twice
4. **IDE terminal** - VS Code or other IDE has a terminal running the app

---

## 🎯 Prevention Tips

### Always Stop Properly

**Don't:** Just close the terminal window
**Do:** Press `Ctrl + C` in the terminal first, then close

### Check Before Starting

Before running `start-app.bat`, check if ports are free:

```cmd
netstat -ano | findstr :5000
netstat -ano | findstr :5173
```

If nothing shows up, ports are free! ✅

### Use Restart Script

Instead of `start-app.bat`, use:
```cmd
restart-app.bat
```

This automatically cleans up old processes first.

---

## 🚀 Quick Commands Reference

```cmd
# Restart everything (recommended)
restart-app.bat

# Kill port 5000 only
kill-port-5000.bat

# Manual kill
netstat -ano | findstr :5000
taskkill /F /PID <PID>

# Kill all Node processes (nuclear option)
taskkill /F /IM node.exe

# Check what's running
netstat -ano | findstr :5000
netstat -ano | findstr :5173
tasklist | findstr node
```

---

## ✅ After Fixing

1. Run `restart-app.bat`
2. Wait for both terminals to open
3. Check backend terminal shows: "Server running on port 5000"
4. Check frontend terminal shows: "Local: http://localhost:5173"
5. Open browser: http://localhost:5173
6. Login and use your app! ✅

---

**Ready to fix?** Run: `restart-app.bat`
