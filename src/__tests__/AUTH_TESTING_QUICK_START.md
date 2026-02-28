# Authentication Testing - Quick Start Guide

## 🚀 Quick Start (3 Steps)

### Step 1: Start Services
```bash
# Terminal 1: Start PostgreSQL
start-postgres.bat

# Terminal 2: Start Backend
cd backend
npm start

# Terminal 3: Start Frontend (optional, for manual testing)
cd frontend
npm run dev
```

### Step 2: Run Quick Verification
```bash
cd frontend
npx ts-node src/__tests__/auth-quick-verification.ts
```

### Step 3: Run E2E Tests
```bash
cd frontend
npm run test:auth
```

---

## 📋 Test Commands Cheat Sheet

### Automated Tests

```bash
# Run all auth tests
npm run test:auth

# Run with interactive UI
npm run test:e2e:ui

# Run specific test
npx playwright test auth-flow-e2e.spec.ts --grep "register"

# Run on specific browser
npx playwright test auth-flow-e2e.spec.ts --project=chromium
npx playwright test auth-flow-e2e.spec.ts --project=firefox

# Run in headed mode (see browser)
npx playwright test auth-flow-e2e.spec.ts --headed

# Debug mode
npx playwright test auth-flow-e2e.spec.ts --debug

# View test report
npx playwright show-report
```

### Manual Testing

1. Open browser to `http://localhost:5173`
2. Follow guide in `AUTH_E2E_TEST_GUIDE.md`
3. Test each scenario manually

---

## ✅ What Gets Tested

### Registration
- ✅ Valid registration
- ✅ Duplicate email rejection
- ✅ Email format validation
- ✅ Password length validation
- ✅ Password confirmation match

### Login
- ✅ Correct credentials
- ✅ Incorrect password
- ✅ Non-existent email

### Session
- ✅ Persists across refresh
- ✅ Persists across navigation

### Logout
- ✅ Redirects to login
- ✅ Clears auth state

### Protected Routes
- ✅ Blocks unauthenticated access
- ✅ Allows authenticated access

### Admin Routes
- ✅ Blocks regular users
- ✅ Allows admin users

### Responsive
- ✅ Mobile (375px)
- ✅ Tablet (768px)
- ✅ Desktop (1280px)

---

## 🔧 Troubleshooting

### Backend not running?
```bash
cd backend
npm start
```

### Database not running?
```bash
start-postgres.bat
```

### Admin user missing?
```bash
seed-admin.bat
```

### Port conflicts?
- Frontend: Change port in `vite.config.ts`
- Backend: Change port in `backend/.env`

### Tests failing?
1. Check all services are running
2. Run quick verification first
3. Check console for errors
4. Clear browser storage
5. Restart services

---

## 📊 Test Results

After running tests, check:
- Console output for pass/fail
- `playwright-report/` folder for HTML report
- Screenshots in `test-results/` for failures

---

## 📚 Full Documentation

- **Automated Tests:** `frontend/tests/auth-flow-e2e.spec.ts`
- **Manual Guide:** `frontend/src/__tests__/AUTH_E2E_TEST_GUIDE.md`
- **Quick Verification:** `frontend/src/__tests__/auth-quick-verification.ts`
- **Completion Summary:** `.kiro/specs/user-authentication/TASK_20_COMPLETION_SUMMARY.md`

---

## 🎯 Success Criteria

All tests should:
- ✅ Pass without failures
- ✅ Complete in under 5 minutes
- ✅ Show no console errors
- ✅ Generate clean test report

---

## 💡 Pro Tips

1. **Run quick verification first** - Catches basic issues fast
2. **Use UI mode for debugging** - `npm run test:e2e:ui`
3. **Test one browser first** - Faster feedback
4. **Check test report** - Visual results with screenshots
5. **Run in headed mode** - See what's happening

---

## 🚨 Before Running Tests

Make sure:
- [ ] PostgreSQL is running
- [ ] Backend is running (port 3000)
- [ ] Database is seeded (admin user exists)
- [ ] No port conflicts
- [ ] Node modules installed

---

## 📞 Need Help?

1. Check `AUTH_E2E_TEST_GUIDE.md` for detailed instructions
2. Run quick verification to diagnose issues
3. Check service logs for errors
4. Review test output for specific failures

---

**Happy Testing! 🎉**
