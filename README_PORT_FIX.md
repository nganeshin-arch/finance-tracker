# 🔧 Port 5000 Already in Use - Quick Fix

## Problem
```
Error: listen EADDRINUSE: address already in use :::5000
```

## Solution (One Command)

```cmd
restart-app.bat
```

This will:
1. ✅ Kill old processes on ports 5000, 5173, 3000
2. ✅ Start backend fresh
3. ✅ Start frontend fresh
4. ✅ Open in browser

---

## Alternative: Kill Port 5000 Only

```cmd
kill-port-5000.bat
```

Then:
```cmd
start-app.bat
```

---

## Manual Fix

```cmd
netstat -ano | findstr :5000
taskkill /F /PID <PID_NUMBER>
start-app.bat
```

---

**Recommended:** Always use `restart-app.bat` instead of `start-app.bat` to avoid this issue!
