# 🚀 Run Application Locally

## Quick Start (Easiest Way)

### Option 1: Run Everything at Once
```cmd
start-app.bat
```

This will:
1. Start the backend server (http://localhost:5000)
2. Start the frontend server (http://localhost:3000)
3. Open two terminal windows

**Then:**
- Open browser: http://localhost:3000
- Login with: `admin@financetracker.com` / `Admin@123456`

---

## Step-by-Step (If Quick Start Doesn't Work)

### Step 1: Start PostgreSQL Database

**Option A: Using Script**
```cmd
start-postgres.bat
```

**Option B: Manual Start**
1. Press `Win + R`
2. Type `services.msc` and press Enter
3. Find "PostgreSQL" service
4. Right-click → Start

**Option C: Check if Already Running**
```cmd
sc query postgresql-x64-14
```

### Step 2: Start Backend Server

**Open Terminal 1:**
```cmd
start-backend.bat
```

Or manually:
```cmd
cd backend
npm run dev
```

**Expected Output:**
```
Server running on port 5000
Database connected successfully
```

**Backend URL:** http://localhost:5000

### Step 3: Start Frontend Server

**Open Terminal 2:**
```cmd
start-frontend.bat
```

Or manually:
```cmd
cd frontend
npm run dev
```

**Expected Output:**
```
VITE ready in XXX ms
Local: http://localhost:5173
```

**Frontend URL:** http://localhost:5173 (or http://localhost:3000)

### Step 4: Open in Browser

1. Open browser
2. Go to: http://localhost:5173 (or http://localhost:3000)
3. Should see login screen
4. Login with:
   - Email: `admin@financetracker.com`
   - Password: `Admin@123456`

---

## 🆘 Troubleshooting

### Issue 1: "Port already in use"

**Backend (Port 5000):**
```cmd
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

**Frontend (Port 3000 or 5173):**
```cmd
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Issue 2: "Cannot connect to database"

**Check PostgreSQL is running:**
```cmd
sc query postgresql-x64-14
```

**If not running:**
```cmd
net start postgresql-x64-14
```

**Check database exists:**
```cmd
psql -U postgres -l
```

Should show `finance_tracker` database.

**If database doesn't exist:**
```cmd
cd backend
npm run migrate
```

### Issue 3: "Module not found" or "Cannot find package"

**Install dependencies:**

Backend:
```cmd
cd backend
npm install
```

Frontend:
```cmd
cd frontend
npm install
```

### Issue 4: Frontend shows "Network Error"

**Check backend is running:**
- Open http://localhost:5000/api/health
- Should show: `{"status":"ok"}`

**Check API URL in frontend:**
- File: `frontend/.env`
- Should have: `VITE_API_BASE_URL=http://localhost:5000/api`

### Issue 5: "npm: command not found"

**Install Node.js:**
1. Download from https://nodejs.org
2. Install LTS version
3. Restart terminal
4. Verify: `node --version` and `npm --version`

---

## 📱 Access from iPhone (Local Network)

### Step 1: Find Your Computer's IP

```cmd
ipconfig
```

Look for "IPv4 Address" (e.g., 192.168.1.100)

### Step 2: Update Frontend Config

**File: `frontend/.env`**
```env
VITE_API_BASE_URL=http://192.168.1.100:5000/api
```

### Step 3: Update Backend CORS

**File: `backend/src/index.ts`**

Add your IP to CORS:
```typescript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://192.168.1.100:3000',  // Add this
    'http://192.168.1.100:5173',  // Add this
  ],
  credentials: true,
}));
```

### Step 4: Restart Servers

Stop and restart both backend and frontend.

### Step 5: Access from iPhone

On iPhone Safari:
- Go to: `http://192.168.1.100:5173`
- Should see login screen!

---

## 🔧 Development Tips

### Hot Reload
Both frontend and backend support hot reload:
- Save a file → Changes appear automatically
- No need to restart servers

### View Logs
- **Backend logs:** Check Terminal 1
- **Frontend logs:** Check Terminal 2 or browser console (F12)

### Database Management

**View data:**
```cmd
psql -U postgres -d finance_tracker
```

**Run migrations:**
```cmd
cd backend
npm run migrate
```

**Seed data:**
```cmd
cd backend
npm run seed
```

### Stop Servers

**Option 1:** Close the terminal windows

**Option 2:** Press `Ctrl + C` in each terminal

---

## ✅ Verification Checklist

- [ ] PostgreSQL is running
- [ ] Backend started successfully (http://localhost:5000)
- [ ] Frontend started successfully (http://localhost:5173)
- [ ] Can access frontend in browser
- [ ] Can see login screen
- [ ] Can log in successfully
- [ ] Dashboard loads with data

---

## 🎯 Quick Commands Reference

```cmd
# Start everything
start-app.bat

# Start individual services
start-postgres.bat
start-backend.bat
start-frontend.bat

# Check what's running
netstat -ano | findstr :5000  # Backend
netstat -ano | findstr :5173  # Frontend

# Install dependencies
cd backend && npm install
cd frontend && npm install

# Database operations
cd backend
npm run migrate  # Run migrations
npm run seed     # Seed data
```

---

## 🌐 URLs

- **Frontend:** http://localhost:5173 (or http://localhost:3000)
- **Backend API:** http://localhost:5000/api
- **Health Check:** http://localhost:5000/api/health

---

## 📝 Default Credentials

**Admin:**
- Email: `admin@financetracker.com`
- Password: `Admin@123456`

**Or create a new account** on the register page!

---

Need help? Check the terminal output for error messages!
