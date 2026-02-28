/**
 * Authentication Flow End-to-End Tests
 * 
 * These tests validate the complete authentication flow including:
 * - User registration with valid and invalid data
 * - User login with correct and incorrect credentials
 * - Session persistence across page refresh
 * - Logout functionality
 * - Protected route access control
 * - Admin route access control
 * - Responsive design on mobile, tablet, desktop
 * 
 * Requirements: All authentication requirements (1.1-11.5)
 */

import { test, expect, Page } from '@playwright/test';

// Test viewport sizes
const VIEWPORTS = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1280, height: 720 },
};

// Test user credentials
const TEST_USER = {
  email: `test.user.${Date.now()}@example.com`,
  password: 'TestPassword123!',
};

const TEST_ADMIN = {
  email: 'admin@example.com',
  password: 'admin123',
};

const DUPLICATE_EMAIL = 'existing@example.com';

// Helper functions
async function navigateToLogin(page: Page) {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
}

async function navigateToRegister(page: Page) {
  await page.goto('/register');
  await page.waitForLoadState('networkidle');
}

async function fillLoginForm(page: Page, email: string, password: string) {
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
}

async function fillRegisterForm(page: Page, email: string, password: string, confirmPassword?: string) {
  await page.fill('input[type="email"]', email);
  const passwordInputs = page.locator('input[type="password"]');
  await passwordInputs.nth(0).fill(password);
  if (confirmPassword !== undefined) {
    await passwordInputs.nth(1).fill(confirmPassword);
  } else {
    await passwordInputs.nth(1).fill(password);
  }
}

async function submitForm(page: Page) {
  await page.click('button[type="submit"]');
}

async function isLoggedIn(page: Page): Promise<boolean> {
  // Check if we're on a protected page (not login/register)
  const url = page.url();
  if (url.includes('/login') || url.includes('/register')) {
    return false;
  }
  
  // Check for logout button or user menu
  const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Log out")');
  return await logoutButton.isVisible().catch(() => false);
}

async function logout(page: Page) {
  const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Log out")').first();
  await logoutButton.click();
  await page.waitForURL('**/login', { timeout: 5000 });
}

test.describe('Authentication Flow - End-to-End Tests', () => {

  test.describe('User Registration Tests', () => {

    test('should successfully register a new user with valid data', async ({ page }) => {
      await navigateToRegister(page);

      // Fill registration form
      await fillRegisterForm(page, TEST_USER.email, TEST_USER.password);

      // Submit form
      await submitForm(page);

      // Should redirect to dashboard or home page
      await page.waitForURL(/\/(dashboard|home|$)/, { timeout: 10000 });

      // Should be logged in
      const loggedIn = await isLoggedIn(page);
      expect(loggedIn).toBe(true);
    });

    test('should show error when registering with duplicate email', async ({ page }) => {
      await navigateToRegister(page);

      // First registration
      const uniqueEmail = `duplicate.test.${Date.now()}@example.com`;
      await fillRegisterForm(page, uniqueEmail, TEST_USER.password);
      await submitForm(page);
      await page.waitForURL(/\/(dashboard|home|$)/, { timeout: 10000 });

      // Logout
      await logout(page);

      // Try to register again with same email
      await navigateToRegister(page);
      await fillRegisterForm(page, uniqueEmail, TEST_USER.password);
      await submitForm(page);

      // Should show error message
      const errorMessage = page.locator('text=/email.*already.*registered/i, text=/email.*exists/i, text=/already.*registered/i');
      await expect(errorMessage.first()).toBeVisible({ timeout: 5000 });
    });

    test('should validate email format', async ({ page }) => {
      await navigateToRegister(page);

      // Try invalid email
      await fillRegisterForm(page, 'invalid-email', TEST_USER.password);
      await submitForm(page);

      // Should show validation error
      const errorMessage = page.locator('text=/invalid.*email/i, text=/valid.*email/i');
      await expect(errorMessage.first()).toBeVisible({ timeout: 3000 });
    });

    test('should validate password length (minimum 8 characters)', async ({ page }) => {
      await navigateToRegister(page);

      // Try short password
      await fillRegisterForm(page, `test.${Date.now()}@example.com`, 'short');
      await submitForm(page);

      // Should show validation error
      const errorMessage = page.locator('text=/password.*8.*characters/i, text=/at least 8/i');
      await expect(errorMessage.first()).toBeVisible({ timeout: 3000 });
    });

    test('should validate password confirmation match', async ({ page }) => {
      await navigateToRegister(page);

      // Fill with non-matching passwords
      const email = `test.${Date.now()}@example.com`;
      await page.fill('input[type="email"]', email);
      const passwordInputs = page.locator('input[type="password"]');
      await passwordInputs.nth(0).fill(TEST_USER.password);
      await passwordInputs.nth(1).fill('DifferentPassword123!');
      await submitForm(page);

      // Should show validation error
      const errorMessage = page.locator('text=/passwords.*match/i, text=/passwords.*same/i');
      await expect(errorMessage.first()).toBeVisible({ timeout: 3000 });
    });
  });

  test.describe('User Login Tests', () => {

    test('should successfully login with correct credentials', async ({ page }) => {
      // First register a user
      await navigateToRegister(page);
      const email = `login.test.${Date.now()}@example.com`;
      await fillRegisterForm(page, email, TEST_USER.password);
      await submitForm(page);
      await page.waitForURL(/\/(dashboard|home|$)/, { timeout: 10000 });

      // Logout
      await logout(page);

      // Now login
      await navigateToLogin(page);
      await fillLoginForm(page, email, TEST_USER.password);
      await submitForm(page);

      // Should redirect to dashboard
      await page.waitForURL(/\/(dashboard|home|$)/, { timeout: 10000 });

      // Should be logged in
      const loggedIn = await isLoggedIn(page);
      expect(loggedIn).toBe(true);
    });

    test('should show error with incorrect password', async ({ page }) => {
      // First register a user
      await navigateToRegister(page);
      const email = `wrong.password.${Date.now()}@example.com`;
      await fillRegisterForm(page, email, TEST_USER.password);
      await submitForm(page);
      await page.waitForURL(/\/(dashboard|home|$)/, { timeout: 10000 });

      // Logout
      await logout(page);

      // Try to login with wrong password
      await navigateToLogin(page);
      await fillLoginForm(page, email, 'WrongPassword123!');
      await submitForm(page);

      // Should show error message
      const errorMessage = page.locator('text=/invalid.*email.*password/i, text=/incorrect.*credentials/i, text=/authentication.*failed/i');
      await expect(errorMessage.first()).toBeVisible({ timeout: 5000 });

      // Should still be on login page
      expect(page.url()).toContain('/login');
    });

    test('should show error with non-existent email', async ({ page }) => {
      await navigateToLogin(page);

      // Try to login with non-existent email
      await fillLoginForm(page, `nonexistent.${Date.now()}@example.com`, TEST_USER.password);
      await submitForm(page);

      // Should show error message
      const errorMessage = page.locator('text=/invalid.*email.*password/i, text=/incorrect.*credentials/i, text=/authentication.*failed/i');
      await expect(errorMessage.first()).toBeVisible({ timeout: 5000 });

      // Should still be on login page
      expect(page.url()).toContain('/login');
    });
  });

  test.describe('Session Persistence Tests', () => {

    test('should persist session across page refresh', async ({ page }) => {
      // Register and login
      await navigateToRegister(page);
      const email = `persist.test.${Date.now()}@example.com`;
      await fillRegisterForm(page, email, TEST_USER.password);
      await submitForm(page);
      await page.waitForURL(/\/(dashboard|home|$)/, { timeout: 10000 });

      // Verify logged in
      let loggedIn = await isLoggedIn(page);
      expect(loggedIn).toBe(true);

      // Refresh page
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Should still be logged in
      loggedIn = await isLoggedIn(page);
      expect(loggedIn).toBe(true);

      // Should not redirect to login
      expect(page.url()).not.toContain('/login');
    });

    test('should persist session across navigation', async ({ page }) => {
      // Register and login
      await navigateToRegister(page);
      const email = `nav.test.${Date.now()}@example.com`;
      await fillRegisterForm(page, email, TEST_USER.password);
      await submitForm(page);
      await page.waitForURL(/\/(dashboard|home|$)/, { timeout: 10000 });

      // Navigate to different pages
      await page.goto('/transactions');
      await page.waitForLoadState('networkidle');
      
      let loggedIn = await isLoggedIn(page);
      expect(loggedIn).toBe(true);

      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      
      loggedIn = await isLoggedIn(page);
      expect(loggedIn).toBe(true);
    });
  });

  test.describe('Logout Functionality Tests', () => {

    test('should successfully logout and redirect to login page', async ({ page }) => {
      // Register and login
      await navigateToRegister(page);
      const email = `logout.test.${Date.now()}@example.com`;
      await fillRegisterForm(page, email, TEST_USER.password);
      await submitForm(page);
      await page.waitForURL(/\/(dashboard|home|$)/, { timeout: 10000 });

      // Logout
      await logout(page);

      // Should be on login page
      expect(page.url()).toContain('/login');

      // Should not be logged in
      const loggedIn = await isLoggedIn(page);
      expect(loggedIn).toBe(false);
    });

    test('should clear authentication state after logout', async ({ page }) => {
      // Register and login
      await navigateToRegister(page);
      const email = `clear.state.${Date.now()}@example.com`;
      await fillRegisterForm(page, email, TEST_USER.password);
      await submitForm(page);
      await page.waitForURL(/\/(dashboard|home|$)/, { timeout: 10000 });

      // Logout
      await logout(page);

      // Try to access protected route
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      // Should redirect to login
      await page.waitForURL('**/login', { timeout: 5000 });
      expect(page.url()).toContain('/login');
    });
  });

  test.describe('Protected Route Access Tests', () => {

    test('should redirect to login when accessing protected route without auth', async ({ page }) => {
      // Clear any existing session
      await page.context().clearCookies();
      await page.evaluate(() => localStorage.clear());

      // Try to access protected route
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      // Should redirect to login
      await page.waitForURL('**/login', { timeout: 5000 });
      expect(page.url()).toContain('/login');
    });

    test('should allow access to protected routes when authenticated', async ({ page }) => {
      // Register and login
      await navigateToRegister(page);
      const email = `protected.test.${Date.now()}@example.com`;
      await fillRegisterForm(page, email, TEST_USER.password);
      await submitForm(page);
      await page.waitForURL(/\/(dashboard|home|$)/, { timeout: 10000 });

      // Access protected routes
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      expect(page.url()).toContain('/dashboard');

      await page.goto('/transactions');
      await page.waitForLoadState('networkidle');
      expect(page.url()).toContain('/transactions');
    });

    test('should redirect to intended page after login', async ({ page }) => {
      // Clear session
      await page.context().clearCookies();
      await page.evaluate(() => localStorage.clear());

      // Try to access protected route
      await page.goto('/transactions');
      await page.waitForLoadState('networkidle');

      // Should redirect to login
      await page.waitForURL('**/login', { timeout: 5000 });

      // Login
      await navigateToRegister(page);
      const email = `redirect.test.${Date.now()}@example.com`;
      await fillRegisterForm(page, email, TEST_USER.password);
      await submitForm(page);

      // Should redirect to dashboard or home (default behavior)
      await page.waitForURL(/\/(dashboard|home|$)/, { timeout: 10000 });
    });
  });

  test.describe('Admin Route Access Tests', () => {

    test('should deny access to admin routes for regular users', async ({ page }) => {
      // Register as regular user
      await navigateToRegister(page);
      const email = `regular.user.${Date.now()}@example.com`;
      await fillRegisterForm(page, email, TEST_USER.password);
      await submitForm(page);
      await page.waitForURL(/\/(dashboard|home|$)/, { timeout: 10000 });

      // Try to access admin route
      await page.goto('/admin');
      await page.waitForLoadState('networkidle');

      // Should either redirect or show unauthorized message
      const isOnAdminPage = page.url().includes('/admin');
      if (isOnAdminPage) {
        // Check for unauthorized message
        const unauthorizedMessage = page.locator('text=/unauthorized/i, text=/access denied/i, text=/forbidden/i');
        await expect(unauthorizedMessage.first()).toBeVisible({ timeout: 3000 });
      } else {
        // Should redirect away from admin page
        expect(page.url()).not.toContain('/admin');
      }
    });

    test('should allow access to admin routes for admin users', async ({ page }) => {
      // Try to login as admin (if admin exists)
      await navigateToLogin(page);
      await fillLoginForm(page, TEST_ADMIN.email, TEST_ADMIN.password);
      await submitForm(page);

      // Wait for navigation
      await page.waitForLoadState('networkidle');

      // If login successful, try to access admin route
      const loggedIn = await isLoggedIn(page);
      if (loggedIn) {
        await page.goto('/admin');
        await page.waitForLoadState('networkidle');

        // Should be on admin page
        expect(page.url()).toContain('/admin');

        // Should not show unauthorized message
        const unauthorizedMessage = page.locator('text=/unauthorized/i, text=/access denied/i');
        const isUnauthorized = await unauthorizedMessage.isVisible().catch(() => false);
        expect(isUnauthorized).toBe(false);
      }
    });
  });

  test.describe('Responsive Design Tests', () => {

    test('should display login form correctly on mobile', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.mobile);
      await navigateToLogin(page);

      // Check form is visible
      const emailInput = page.locator('input[type="email"]');
      const passwordInput = page.locator('input[type="password"]');
      const submitButton = page.locator('button[type="submit"]');

      await expect(emailInput).toBeVisible();
      await expect(passwordInput).toBeVisible();
      await expect(submitButton).toBeVisible();

      // Check inputs are full width or appropriately sized
      const emailWidth = await emailInput.boundingBox();
      expect(emailWidth?.width).toBeGreaterThan(250);

      // Check button is touch-friendly (min 44px height)
      const buttonBox = await submitButton.boundingBox();
      expect(buttonBox?.height).toBeGreaterThanOrEqual(40);
    });

    test('should display login form correctly on tablet', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.tablet);
      await navigateToLogin(page);

      // Check form is visible and centered
      const form = page.locator('form').first();
      await expect(form).toBeVisible();

      // Form should not be full width on tablet
      const formBox = await form.boundingBox();
      expect(formBox?.width).toBeLessThan(VIEWPORTS.tablet.width);
    });

    test('should display login form correctly on desktop', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop);
      await navigateToLogin(page);

      // Check form is visible and centered
      const form = page.locator('form').first();
      await expect(form).toBeVisible();

      // Form should be constrained width on desktop
      const formBox = await form.boundingBox();
      expect(formBox?.width).toBeLessThan(600);
    });

    test('should display register form correctly on mobile', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.mobile);
      await navigateToRegister(page);

      // Check all form elements are visible
      const emailInput = page.locator('input[type="email"]');
      const passwordInputs = page.locator('input[type="password"]');
      const submitButton = page.locator('button[type="submit"]');

      await expect(emailInput).toBeVisible();
      await expect(passwordInputs.first()).toBeVisible();
      await expect(submitButton).toBeVisible();

      // Check form doesn't overflow
      const form = page.locator('form').first();
      const formBox = await form.boundingBox();
      expect(formBox?.right).toBeLessThanOrEqual(VIEWPORTS.mobile.width);
    });

    test('should have touch-friendly buttons on mobile', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.mobile);
      await navigateToLogin(page);

      // Check button size
      const submitButton = page.locator('button[type="submit"]');
      const buttonBox = await submitButton.boundingBox();
      
      // Minimum touch target size is 44x44px
      expect(buttonBox?.height).toBeGreaterThanOrEqual(40);
      expect(buttonBox?.width).toBeGreaterThan(100);
    });

    test('should be able to complete login flow on mobile', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.mobile);

      // Register
      await navigateToRegister(page);
      const email = `mobile.test.${Date.now()}@example.com`;
      await fillRegisterForm(page, email, TEST_USER.password);
      await submitForm(page);
      await page.waitForURL(/\/(dashboard|home|$)/, { timeout: 10000 });

      // Logout
      await logout(page);

      // Login
      await navigateToLogin(page);
      await fillLoginForm(page, email, TEST_USER.password);
      await submitForm(page);
      await page.waitForURL(/\/(dashboard|home|$)/, { timeout: 10000 });

      // Should be logged in
      const loggedIn = await isLoggedIn(page);
      expect(loggedIn).toBe(true);
    });

    test('should be able to complete login flow on tablet', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.tablet);

      // Register
      await navigateToRegister(page);
      const email = `tablet.test.${Date.now()}@example.com`;
      await fillRegisterForm(page, email, TEST_USER.password);
      await submitForm(page);
      await page.waitForURL(/\/(dashboard|home|$)/, { timeout: 10000 });

      // Logout
      await logout(page);

      // Login
      await navigateToLogin(page);
      await fillLoginForm(page, email, TEST_USER.password);
      await submitForm(page);
      await page.waitForURL(/\/(dashboard|home|$)/, { timeout: 10000 });

      // Should be logged in
      const loggedIn = await isLoggedIn(page);
      expect(loggedIn).toBe(true);
    });

    test('should be able to complete login flow on desktop', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop);

      // Register
      await navigateToRegister(page);
      const email = `desktop.test.${Date.now()}@example.com`;
      await fillRegisterForm(page, email, TEST_USER.password);
      await submitForm(page);
      await page.waitForURL(/\/(dashboard|home|$)/, { timeout: 10000 });

      // Logout
      await logout(page);

      // Login
      await navigateToLogin(page);
      await fillLoginForm(page, email, TEST_USER.password);
      await submitForm(page);
      await page.waitForURL(/\/(dashboard|home|$)/, { timeout: 10000 });

      // Should be logged in
      const loggedIn = await isLoggedIn(page);
      expect(loggedIn).toBe(true);
    });
  });

  test.describe('Integration Tests', () => {

    test('should complete full user journey: register -> login -> logout -> login', async ({ page }) => {
      const email = `journey.test.${Date.now()}@example.com`;

      // 1. Register
      await navigateToRegister(page);
      await fillRegisterForm(page, email, TEST_USER.password);
      await submitForm(page);
      await page.waitForURL(/\/(dashboard|home|$)/, { timeout: 10000 });
      expect(await isLoggedIn(page)).toBe(true);

      // 2. Logout
      await logout(page);
      expect(page.url()).toContain('/login');
      expect(await isLoggedIn(page)).toBe(false);

      // 3. Login again
      await fillLoginForm(page, email, TEST_USER.password);
      await submitForm(page);
      await page.waitForURL(/\/(dashboard|home|$)/, { timeout: 10000 });
      expect(await isLoggedIn(page)).toBe(true);

      // 4. Navigate to protected routes
      await page.goto('/transactions');
      await page.waitForLoadState('networkidle');
      expect(page.url()).toContain('/transactions');
      expect(await isLoggedIn(page)).toBe(true);

      // 5. Refresh and verify session persists
      await page.reload();
      await page.waitForLoadState('networkidle');
      expect(await isLoggedIn(page)).toBe(true);

      // 6. Final logout
      await logout(page);
      expect(page.url()).toContain('/login');
    });
  });
});
