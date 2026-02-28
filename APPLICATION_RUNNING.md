# Application Running Guide

## ✅ Application Started Successfully!

The Personal Finance Tracker application is now running with two separate terminal windows:

### Services Running:

1. **Backend Server**: http://localhost:5000
   - API endpoints available
   - Authentication system active
   - Database connected

2. **Frontend Server**: http://localhost:3000
   - React application running
   - Vite dev server active
   - Hot module replacement enabled

---

## 🚀 Quick Access

### Main Application
Open your browser and navigate to:
```
http://localhost:3000
```

### Available Pages

1. **Login Page**: http://localhost:3000/login
2. **Register Page**: http://localhost:3000/register
3. **Dashboard**: http://localhost:3000/dashboard (requires login)
4. **Transactions**: http://localhost:3000/transactions (requires login)
5. **Admin Panel**: http://localhost:3000/admin (requires admin role)

---

## 👤 Test Accounts

### Admin Account
- **Email**: admin@financetracker.com
- **Password**: Admin@123456

### Create New User
1. Go to http://localhost:3000/register
2. Enter your email and password
3. Click "Register"

---

## 🧪 Testing the Authentication Flow

### Quick Test Steps:

1. **Register a New User**
   - Navigate to http://localhost:3000/register
   - Enter email: test@example.com
   - Enter password: TestPassword123!
   - Click "Register"
   - You should be logged in and redirected to dashboard

2. **Test Logout**
   - Click the "Logout" button
   - You should be redirected to login page

3. **Test Login**
   - Navigate to http://localhost:3000/login
   - Enter your credentials
   - Click "Login"
   - You should be logged in and redirected to dashboard

4. **Test Protected Routes**
   - Logout if logged in
   - Try to access http://localhost:3000/dashboard
   - You should be redirected to login page

5. **Test Admin Access**
   - Login as admin (admin@financetracker.com / Admin@123456)
   - Navigate to http://localhost:3000/admin
   - You should see the admin panel

6. **Test Regular User Admin Access**
   - Login as regular user
   - Try to access http://localhost:3000/admin
   - You should see "Unauthorized" or be redirected

---

## 🧪 Running E2E Tests

With the application running, you can now run the authentication E2E tests:

### Option 1: Run All Tests
```bash
cd frontend
npm run test:auth
```

### Option 2: Run with UI (Interactive)
```bash
cd frontend
npm run test:e2e:ui
```

### Option 3: Quick Verification
```bash
cd frontend
npx ts-node src/__tests__/auth-quick-verification.ts
```

---

## 📊 What to Test

### Registration Flow
- ✅ Register with valid data
- ✅ Try duplicate email (should fail)
- ✅ Try invalid email format (should fail)
- ✅ Try short password (should fail)
- ✅ Try non-matching passwords (should fail)

### Login Flow
- ✅ Login with correct credentials
- ✅ Login with wrong password (should fail)
- ✅ Login with non-existent email (should fail)

### Session Management
- ✅ Refresh page (should stay logged in)
- ✅ Navigate between pages (should stay logged in)
- ✅ Logout (should clear session)

### Protected Routes
- ✅ Access dashboard without login (should redirect)
- ✅ Access dashboard with login (should work)
- ✅ Access admin as user (should fail)
- ✅ Access admin as admin (should work)

### Responsive Design
- ✅ Test on mobile (375px width)
- ✅ Test on tablet (768px width)
- ✅ Test on desktop (1280px width)

---

## 🛠️ Troubleshooting

### Backend Not Responding?
Check the backend terminal window for errors. Common issues:
- Database not connected
- Port 5000 already in use
- Missing environment variables

### Frontend Not Loading?
Check the frontend terminal window for errors. Common issues:
- Port 3000 already in use
- Build errors
- Missing dependencies

### Database Issues?
Make sure PostgreSQL is running:
```bash
start-postgres.bat
```

Or check status:
```bash
check-postgres.bat
```

### Need to Restart?
Close both terminal windows and run:
```bash
start-app.bat
```

---

## 📝 Development Workflow

### Making Changes

1. **Backend Changes**
   - Edit files in `backend/src/`
   - Server will auto-restart (nodemon)
   - Check backend terminal for errors

2. **Frontend Changes**
   - Edit files in `frontend/src/`
   - Browser will auto-reload (HMR)
   - Check browser console for errors

### Viewing Logs

- **Backend Logs**: Check the "Finance Tracker - Backend" terminal window
- **Frontend Logs**: Check the "Finance Tracker - Frontend" terminal window
- **Browser Logs**: Open browser DevTools (F12) → Console tab

---

## 🎯 Next Steps

1. **Test the authentication flow manually** using the steps above
2. **Run the E2E tests** to verify everything works
3. **Check the test results** and fix any issues
4. **Explore the application** and test other features

---

## 📚 Documentation

- **E2E Test Guide**: `frontend/src/__tests__/AUTH_E2E_TEST_GUIDE.md`
- **Quick Start**: `frontend/src/__tests__/AUTH_TESTING_QUICK_START.md`
- **Completion Summary**: `.kiro/specs/user-authentication/TASK_20_COMPLETION_SUMMARY.md`

---

## 🛑 Stopping the Application

To stop the application:
1. Close the "Finance Tracker - Backend" terminal window
2. Close the "Finance Tracker - Frontend" terminal window

Or press `Ctrl+C` in each terminal window.

---

## ✨ Features to Test

### Authentication Features
- User registration with validation
- User login with error handling
- Session persistence
- Logout functionality
- Protected route guards
- Admin role-based access
- Responsive design

### Other Features
- Dashboard with summary cards
- Transaction management
- Category management
- Monthly tracking cycles
- Charts and visualizations
- Dark/light theme toggle

---

**Enjoy testing the application! 🎉**

If you encounter any issues, check the troubleshooting section or review the detailed documentation.
