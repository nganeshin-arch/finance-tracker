# Authentication End-to-End Testing Guide

This document provides comprehensive guidance for testing the authentication flow end-to-end, covering all requirements from the user-authentication spec.

## Test Overview

The authentication E2E tests validate:
- ✅ User registration with valid data
- ✅ User registration with duplicate email
- ✅ User login with correct credentials
- ✅ User login with incorrect credentials
- ✅ Session persistence across page refresh
- ✅ Logout functionality
- ✅ Protected route access without auth
- ✅ Admin route access with user role
- ✅ Admin route access with admin role
- ✅ Responsive design on mobile, tablet, desktop

## Running the Tests

### Automated E2E Tests (Playwright)

The automated tests are located in `frontend/tests/auth-flow-e2e.spec.ts`.

**Prerequisites:**
1. Ensure backend is running: `npm start` (from backend directory)
2. Ensure database is running: `start-postgres.bat`
3. Ensure frontend dev server is running: `npm run dev` (from frontend directory)

**Run all auth tests:**
```bash
cd frontend
npm run test:auth
```

**Run with UI mode (interactive):**
```bash
cd frontend
npm run test:e2e:ui
```

**Run specific test:**
```bash
cd frontend
npx playwright test auth-flow-e2e.spec.ts --grep "should successfully register"
```

**Run on specific browser:**
```bash
cd frontend
npx playwright test auth-flow-e2e.spec.ts --project=chromium
npx playwright test auth-flow-e2e.spec.ts --project=firefox
npx playwright test auth-flow-e2e.spec.ts --project=webkit
```

## Manual Testing Checklist

### 1. User Registration Tests

#### Test 1.1: Register with Valid Data
**Steps:**
1. Navigate to `/register`
2. Enter email: `test@example.com`
3. Enter password: `TestPassword123!`
4. Enter confirm password: `TestPassword123!`
5. Click "Register" button

**Expected Result:**
- ✅ User is registered successfully
- ✅ Redirected to dashboard/home page
- ✅ User is logged in (logout button visible)
- ✅ No error messages displayed

**Requirements Tested:** 1.1, 1.3, 1.4

---

#### Test 1.2: Register with Duplicate Email
**Steps:**
1. Register a user with email `duplicate@example.com`
2. Logout
3. Navigate to `/register`
4. Try to register again with `duplicate@example.com`
5. Click "Register" button

**Expected Result:**
- ✅ Error message displayed: "Email already registered" or similar
- ✅ User remains on registration page
- ✅ Form is not cleared

**Requirements Tested:** 1.2

---

#### Test 1.3: Register with Invalid Email Format
**Steps:**
1. Navigate to `/register`
2. Enter email: `invalid-email`
3. Enter password: `TestPassword123!`
4. Enter confirm password: `TestPassword123!`
5. Click "Register" button

**Expected Result:**
- ✅ Validation error displayed: "Invalid email format" or similar
- ✅ Form submission prevented
- ✅ User remains on registration page

**Requirements Tested:** 1.5, 7.2

---

#### Test 1.4: Register with Short Password
**Steps:**
1. Navigate to `/register`
2. Enter email: `test@example.com`
3. Enter password: `short`
4. Enter confirm password: `short`
5. Click "Register" button

**Expected Result:**
- ✅ Validation error displayed: "Password must be at least 8 characters"
- ✅ Form submission prevented
- ✅ User remains on registration page

**Requirements Tested:** 6.5, 7.2

---

#### Test 1.5: Register with Non-Matching Passwords
**Steps:**
1. Navigate to `/register`
2. Enter email: `test@example.com`
3. Enter password: `TestPassword123!`
4. Enter confirm password: `DifferentPassword123!`
5. Click "Register" button

**Expected Result:**
- ✅ Validation error displayed: "Passwords do not match"
- ✅ Form submission prevented
- ✅ User remains on registration page

**Requirements Tested:** 7.2

---

### 2. User Login Tests

#### Test 2.1: Login with Correct Credentials
**Steps:**
1. Register a user with email `login@example.com` and password `TestPassword123!`
2. Logout
3. Navigate to `/login`
4. Enter email: `login@example.com`
5. Enter password: `TestPassword123!`
6. Click "Login" button

**Expected Result:**
- ✅ User is logged in successfully
- ✅ Redirected to dashboard/home page
- ✅ Logout button visible
- ✅ No error messages displayed

**Requirements Tested:** 2.1, 2.4, 2.5

---

#### Test 2.2: Login with Incorrect Password
**Steps:**
1. Register a user with email `wrong@example.com` and password `TestPassword123!`
2. Logout
3. Navigate to `/login`
4. Enter email: `wrong@example.com`
5. Enter password: `WrongPassword123!`
6. Click "Login" button

**Expected Result:**
- ✅ Error message displayed: "Invalid email or password"
- ✅ User remains on login page
- ✅ Not logged in
- ✅ Error message does not reveal if email exists

**Requirements Tested:** 2.2, 7.3, 7.4

---

#### Test 2.3: Login with Non-Existent Email
**Steps:**
1. Navigate to `/login`
2. Enter email: `nonexistent@example.com`
3. Enter password: `TestPassword123!`
4. Click "Login" button

**Expected Result:**
- ✅ Error message displayed: "Invalid email or password"
- ✅ User remains on login page
- ✅ Not logged in
- ✅ Same error message as incorrect password

**Requirements Tested:** 2.3, 7.3, 7.4

---

### 3. Session Persistence Tests

#### Test 3.1: Session Persists Across Page Refresh
**Steps:**
1. Login with valid credentials
2. Verify you're on dashboard/home page
3. Press F5 or click browser refresh button
4. Wait for page to reload

**Expected Result:**
- ✅ User remains logged in
- ✅ Still on dashboard/home page (not redirected to login)
- ✅ Logout button still visible
- ✅ User data still accessible

**Requirements Tested:** 4.1, 4.2, 4.3

---

#### Test 3.2: Session Persists Across Navigation
**Steps:**
1. Login with valid credentials
2. Navigate to `/transactions`
3. Navigate to `/dashboard`
4. Navigate back to home page

**Expected Result:**
- ✅ User remains logged in throughout navigation
- ✅ No redirects to login page
- ✅ All protected pages accessible

**Requirements Tested:** 4.1, 4.2, 4.3

---

#### Test 3.3: Expired Token Redirects to Login
**Steps:**
1. Login with valid credentials
2. Manually expire the token (modify localStorage or wait 7 days)
3. Try to access a protected route

**Expected Result:**
- ✅ Redirected to login page
- ✅ Error message: "Session expired" or similar
- ✅ Must login again to access protected routes

**Requirements Tested:** 4.4, 7.5

---

### 4. Logout Functionality Tests

#### Test 4.1: Logout Redirects to Login
**Steps:**
1. Login with valid credentials
2. Click "Logout" button
3. Observe the page

**Expected Result:**
- ✅ Redirected to `/login` page
- ✅ Logout button no longer visible
- ✅ Login form displayed

**Requirements Tested:** 5.1, 5.2

---

#### Test 4.2: Logout Clears Authentication State
**Steps:**
1. Login with valid credentials
2. Click "Logout" button
3. Try to navigate to `/dashboard`

**Expected Result:**
- ✅ Redirected to `/login` page
- ✅ Cannot access protected routes
- ✅ Token removed from localStorage

**Requirements Tested:** 5.3, 5.4

---

#### Test 4.3: Cannot Access Protected Routes After Logout
**Steps:**
1. Login with valid credentials
2. Click "Logout" button
3. Manually navigate to `/dashboard` (type in URL bar)
4. Try to navigate to `/transactions`

**Expected Result:**
- ✅ Redirected to `/login` for all protected routes
- ✅ Must login again to access any protected page

**Requirements Tested:** 5.4, 5.5

---

### 5. Protected Route Access Tests

#### Test 5.1: Unauthenticated Access Redirects to Login
**Steps:**
1. Clear browser storage (localStorage)
2. Navigate to `/dashboard`
3. Navigate to `/transactions`

**Expected Result:**
- ✅ Redirected to `/login` page
- ✅ Cannot access protected routes without authentication

**Requirements Tested:** 10.1, 10.3

---

#### Test 5.2: Authenticated Access Allows Protected Routes
**Steps:**
1. Login with valid credentials
2. Navigate to `/dashboard`
3. Navigate to `/transactions`
4. Navigate to any other protected route

**Expected Result:**
- ✅ All protected routes accessible
- ✅ No redirects to login
- ✅ Content loads correctly

**Requirements Tested:** 10.2, 10.5

---

#### Test 5.3: Redirect to Intended Page After Login
**Steps:**
1. Clear browser storage
2. Navigate to `/transactions`
3. Should be redirected to login
4. Login with valid credentials

**Expected Result:**
- ✅ After login, redirected to dashboard or home (default behavior)
- ✅ Can then navigate to intended page

**Requirements Tested:** 10.5

---

### 6. Admin Route Access Tests

#### Test 6.1: Regular User Cannot Access Admin Routes
**Steps:**
1. Register as regular user
2. Login with regular user credentials
3. Navigate to `/admin`

**Expected Result:**
- ✅ Either redirected away from admin page OR
- ✅ Shown "Unauthorized" or "Access Denied" message
- ✅ Admin functionality not accessible

**Requirements Tested:** 3.4, 9.2, 9.4

---

#### Test 6.2: Admin User Can Access Admin Routes
**Steps:**
1. Login with admin credentials (email: `admin@example.com`, password: `admin123`)
2. Navigate to `/admin`

**Expected Result:**
- ✅ Admin page loads successfully
- ✅ Admin functionality visible and accessible
- ✅ No "Unauthorized" message

**Requirements Tested:** 3.1, 3.2, 9.1, 9.3

---

#### Test 6.3: Admin Role Verification
**Steps:**
1. Login with admin credentials
2. Check that admin-specific features are available
3. Logout and login as regular user
4. Verify admin features are not available

**Expected Result:**
- ✅ Admin sees admin-specific UI elements
- ✅ Regular user does not see admin-specific UI elements
- ✅ Role-based access control working correctly

**Requirements Tested:** 3.3, 3.5, 9.5

---

### 7. Responsive Design Tests

#### Test 7.1: Mobile Layout (375px width)
**Steps:**
1. Open browser DevTools
2. Set viewport to 375px x 667px (iPhone SE)
3. Navigate to `/login`
4. Navigate to `/register`

**Expected Result:**
- ✅ Forms display in single-column layout
- ✅ All inputs are full-width or appropriately sized
- ✅ Buttons are touch-friendly (min 44px height)
- ✅ No horizontal scrolling
- ✅ Text is readable (min 12px font size)
- ✅ Form fits within viewport

**Requirements Tested:** 11.1, 11.2, 11.5

---

#### Test 7.2: Tablet Layout (768px width)
**Steps:**
1. Open browser DevTools
2. Set viewport to 768px x 1024px (iPad)
3. Navigate to `/login`
4. Navigate to `/register`

**Expected Result:**
- ✅ Forms are centered with max-width constraint
- ✅ Comfortable spacing around elements
- ✅ Medium-sized inputs and buttons
- ✅ Layout optimized for tablet

**Requirements Tested:** 11.1, 11.3

---

#### Test 7.3: Desktop Layout (1280px width)
**Steps:**
1. Open browser DevTools
2. Set viewport to 1280px x 720px
3. Navigate to `/login`
4. Navigate to `/register`

**Expected Result:**
- ✅ Forms are centered with max-width (around 400px)
- ✅ Optimal spacing and padding
- ✅ Hover states work on interactive elements
- ✅ Professional desktop appearance

**Requirements Tested:** 11.1, 11.4

---

#### Test 7.4: Complete Flow on Mobile
**Steps:**
1. Set viewport to mobile (375px)
2. Register a new user
3. Logout
4. Login again
5. Navigate to protected routes

**Expected Result:**
- ✅ All steps work correctly on mobile
- ✅ Touch interactions work properly
- ✅ No layout issues
- ✅ Complete flow is usable on mobile

**Requirements Tested:** 11.1, 11.2, 11.5

---

#### Test 7.5: Complete Flow on Tablet
**Steps:**
1. Set viewport to tablet (768px)
2. Register a new user
3. Logout
4. Login again
5. Navigate to protected routes

**Expected Result:**
- ✅ All steps work correctly on tablet
- ✅ Layout is optimized for tablet
- ✅ Complete flow is usable on tablet

**Requirements Tested:** 11.1, 11.3

---

#### Test 7.6: Complete Flow on Desktop
**Steps:**
1. Set viewport to desktop (1280px)
2. Register a new user
3. Logout
4. Login again
5. Navigate to protected routes

**Expected Result:**
- ✅ All steps work correctly on desktop
- ✅ Layout is optimized for desktop
- ✅ Complete flow is usable on desktop

**Requirements Tested:** 11.1, 11.4

---

## Security Tests

### Test 8.1: Password Hashing
**Steps:**
1. Register a user
2. Check database directly
3. Verify password_hash column

**Expected Result:**
- ✅ Password is hashed (not plain text)
- ✅ Hash starts with `$2b$` (bcrypt)
- ✅ Password never returned in API responses

**Requirements Tested:** 6.1, 6.2, 6.3

---

### Test 8.2: JWT Token Security
**Steps:**
1. Login and capture JWT token from localStorage
2. Decode token (use jwt.io)
3. Verify token structure

**Expected Result:**
- ✅ Token contains userId and role
- ✅ Token has expiration (7 days)
- ✅ Token is signed with secret

**Requirements Tested:** 2.5, 8.1, 8.5

---

### Test 8.3: Protected Endpoint Security
**Steps:**
1. Use browser DevTools Network tab
2. Make API request without token
3. Make API request with invalid token
4. Make API request with valid token

**Expected Result:**
- ✅ No token: 401 Unauthorized
- ✅ Invalid token: 401 Unauthorized
- ✅ Valid token: 200 OK with data

**Requirements Tested:** 8.1, 8.2, 8.3, 8.4

---

## Integration Test

### Test 9.1: Complete User Journey
**Steps:**
1. Register new user
2. Verify logged in
3. Navigate to protected routes
4. Refresh page
5. Verify still logged in
6. Logout
7. Verify logged out
8. Login again
9. Verify logged in
10. Navigate to protected routes
11. Logout

**Expected Result:**
- ✅ All steps complete successfully
- ✅ No errors or unexpected behavior
- ✅ Authentication flow works end-to-end

**Requirements Tested:** All requirements

---

## Test Results Template

Use this template to document your test results:

```
Test Date: [DATE]
Tester: [NAME]
Environment: [Development/Staging/Production]
Browser: [Chrome/Firefox/Safari/Edge]
Device: [Desktop/Tablet/Mobile]

| Test ID | Test Name | Status | Notes |
|---------|-----------|--------|-------|
| 1.1 | Register with Valid Data | ✅ PASS | |
| 1.2 | Register with Duplicate Email | ✅ PASS | |
| 1.3 | Register with Invalid Email | ✅ PASS | |
| ... | ... | ... | ... |

Issues Found:
1. [Issue description]
2. [Issue description]

Overall Status: ✅ PASS / ⚠️ PARTIAL / ❌ FAIL
```

## Troubleshooting

### Tests Failing?

1. **Backend not running**: Start backend with `npm start` from backend directory
2. **Database not running**: Run `start-postgres.bat`
3. **Frontend not running**: Start frontend with `npm run dev` from frontend directory
4. **Port conflicts**: Check if ports 5173 (frontend) and 3000 (backend) are available
5. **Database not seeded**: Run `seed-admin.bat` to create admin user

### Common Issues

1. **"Cannot connect to database"**: Ensure PostgreSQL is running
2. **"Port already in use"**: Kill process using the port or change port in config
3. **"Admin user not found"**: Run seed script to create admin user
4. **"Token expired"**: Clear localStorage and login again

## Automated Test Execution

The Playwright tests can be run automatically in CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run E2E Tests
  run: |
    npm run test:e2e
```

## Test Coverage

This test suite covers:
- ✅ 100% of authentication requirements (1.1 - 11.5)
- ✅ All user flows (register, login, logout)
- ✅ All error scenarios
- ✅ All responsive breakpoints
- ✅ Security validations
- ✅ Session management
- ✅ Role-based access control

## Next Steps

After completing these tests:
1. Document any issues found
2. Create bug tickets for failures
3. Retest after fixes
4. Update test cases if requirements change
5. Add tests to CI/CD pipeline
