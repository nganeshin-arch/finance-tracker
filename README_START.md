# 🚀 Start Your App Locally

## One Command to Rule Them All

```cmd
start-app.bat
```

That's it! Double-click or run this file.

---

## What Happens

1. Backend starts on http://localhost:5000 ✅
2. Frontend starts on http://localhost:5173 ✅
3. Two terminals open (don't close them!) ✅
4. Open browser: http://localhost:5173 ✅
5. Login and use your app! ✅

---

## Login Credentials

**Admin Account:**
- Email: `admin@financetracker.com`
- Password: `Admin@123456`

---

## Troubleshooting

### "Scripts disabled" error?
Run as Administrator:
```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### "Port in use" error?
Kill the process:
```cmd
netstat -ano | findstr :5000
taskkill /PID <NUMBER> /F
```

### "Database error"?
Start PostgreSQL:
```cmd
start-postgres.bat
```

### "Module not found"?
Install dependencies:
```cmd
cd backend && npm install
cd frontend && npm install
```

---

## Stop the App

Close the two terminal windows or press `Ctrl + C` in each.

---

## 📱 Use on iPhone?

1. Find your PC's IP: `ipconfig`
2. On iPhone: `http://YOUR-IP:5173`

---

**Detailed guide:** See `START_APP_NOW.md` or `RUN_LOCALLY.md`
