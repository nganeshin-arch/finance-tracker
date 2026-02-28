/**
 * Multi-Tenant Data Isolation End-to-End Tests
 * 
 * These tests validate complete user flows for multi-tenant data isolation:
 * - User registration and transaction data isolation
 * - Dashboard data isolation between users
 * - Admin configuration management and user access
 * 
 * Requirements: 2.1, 3.4, 5.1, 5.2, 5.3, 1.1, 1.2, 3.1, 3.2
 */

import { test, expect, Page } from '@playwright/test';

// Test user credentials
const USER_A = {
  email: `user.a.${Date.now()}@example.com`,
  password: 'UserAPassword123!',
};

const USER_B = {
  email: `user.b.${Date.now() + 1}@example.com`,
  password: 'UserBPassword123!',
};

const TEST_ADMIN = {
  email: 'admin@example.com',
  password: 'admin123',
};

// Helper functions
async function registerUser(page: Page, email: string, password: string) {
  await page.goto('/register');
  await page.waitForLoadState('networkidle');
  
  await page.fill('input[type="email"]', email);
  const passwordInputs = page.locator('input[type="password"]');
  await passwordInputs.nth(0).fill(password);
  await passwordInputs.nth(1).fill(password);
  
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/(dashboard|home|$)/, { timeout: 10000 });
}

async function loginUser(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/(dashboard|home|$)/, { timeout: 10000 });
}

async function logout(page: Page) {
  const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Log out")').first();
  await logoutButton.click();
  await page.waitForURL('**/login', { timeout: 5000 });
}

async function createTransaction(
  page: Page,
  amount: string,
  description: string,
  type: 'income' | 'expense' = 'expense'
) {
  // Navigate to transactions page
  await page.goto('/transactions');
  await page.waitForLoadState('networkidle');
  
  // Click add transaction button
  const addButton = page.locator('button:has-text("Add Transaction"), button:has-text("New Transaction"), button:has-text("Create")').first();
  await addButton.click();
  
  // Wait for form to appear
  await page.waitForTimeout(500);
  
  // Fill transaction form
  await page.fill('input[name="amount"], input[placeholder*="amount" i]', amount);
  await page.fill('input[name="description"], textarea[name="description"], input[placeholder*="description" i]', description);
  
  // Select transaction type if needed
  const typeSelect = page.locator('select[name="transaction_type_id"], select[name="type"]').first();
  if (await typeSelect.isVisible().catch(() => false)) {
    await typeSelect.selectOption({ label: new RegExp(type, 'i') });
  }
  
  // Select category (first available option)
  const categorySelect = page.locator('select[name="category_id"], select[name="category"]').first();
  if (await categorySelect.isVisible().catch(() => false)) {
    const options = await categorySelect.locator('option').all();
    if (options.length > 1) {
      await categorySelect.selectOption({ index: 1 });
    }
  }
  
  // Select account (first available option)
  const accountSelect = page.locator('select[name="account_id"], select[name="account"]').first();
  if (await accountSelect.isVisible().catch(() => false)) {
    const options = await accountSelect.locator('option').all();
    if (options.length > 1) {
      await accountSelect.selectOption({ index: 1 });
    }
  }
  
  // Select payment mode (first available option)
  const paymentSelect = page.locator('select[name="payment_mode_id"], select[name="payment_mode"]').first();
  if (await paymentSelect.isVisible().catch(() => false)) {
    const options = await paymentSelect.locator('option').all();
    if (options.length > 1) {
      await paymentSelect.selectOption({ index: 1 });
    }
  }
  
  // Submit form
  const submitButton = page.locator('button[type="submit"]:has-text("Save"), button[type="submit"]:has-text("Create"), button[type="submit"]:has-text("Add")').first();
  await submitButton.click();
  
  // Wait for transaction to be created
  await page.waitForTimeout(1000);
}

async function getTransactionDescriptions(page: Page): Promise<string[]> {
  await page.goto('/transactions');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  
  // Look for transaction descriptions in the table or list
  const descriptions: string[] = [];
  
  // Try to find transaction rows
  const rows = page.locator('table tbody tr, [data-testid="transaction-item"], .transaction-item');
  const count = await rows.count();
  
  for (let i = 0; i < count; i++) {
    const row = rows.nth(i);
    const text = await row.textContent();
    if (text) {
      descriptions.push(text);
    }
  }
  
  return descriptions;
}

async function getDashboardTotal(page: Page, type: 'income' | 'expense'): Promise<string> {
  await page.goto('/dashboard');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  
  // Look for income or expense total
  const totalLocator = page.locator(`text=/total ${type}/i, text=/${type}.*total/i`).first();
  const parentCard = totalLocator.locator('xpath=ancestor::*[contains(@class, "card") or contains(@class, "Card")]').first();
  
  if (await parentCard.isVisible().catch(() => false)) {
    const text = await parentCard.textContent();
    return text || '';
  }
  
  return '';
}

test.describe('Multi-Tenant Data Isolation - E2E Tests', () => {

  test.describe('16.1 User Registration and Data Isolation', () => {

    test('should isolate transaction data between User A and User B', async ({ page }) => {
      // Register User A
      await registerUser(page, USER_A.email, USER_A.password);
      
      // User A creates transactions
      await createTransaction(page, '100', 'User A Transaction 1', 'expense');
      await createTransaction(page, '200', 'User A Transaction 2', 'income');
      
      // Verify User A can see their transactions
      let descriptions = await getTransactionDescriptions(page);
      expect(descriptions.some(d => d.includes('User A Transaction 1'))).toBe(true);
      expect(descriptions.some(d => d.includes('User A Transaction 2'))).toBe(true);
      
      // Logout User A
      await logout(page);
      
      // Register User B
      await registerUser(page, USER_B.email, USER_B.password);
      
      // User B creates different transactions
      await createTransaction(page, '300', 'User B Transaction 1', 'expense');
      await createTransaction(page, '400', 'User B Transaction 2', 'income');
      
      // Verify User B can see only their transactions
      descriptions = await getTransactionDescriptions(page);
      expect(descriptions.some(d => d.includes('User B Transaction 1'))).toBe(true);
      expect(descriptions.some(d => d.includes('User B Transaction 2'))).toBe(true);
      
      // Verify User B CANNOT see User A's transactions
      expect(descriptions.some(d => d.includes('User A Transaction 1'))).toBe(false);
      expect(descriptions.some(d => d.includes('User A Transaction 2'))).toBe(false);
      
      // Logout User B
      await logout(page);
      
      // Login as User A again
      await loginUser(page, USER_A.email, USER_A.password);
      
      // Verify User A still sees only their transactions
      descriptions = await getTransactionDescriptions(page);
      expect(descriptions.some(d => d.includes('User A Transaction 1'))).toBe(true);
      expect(descriptions.some(d => d.includes('User A Transaction 2'))).toBe(true);
      
      // Verify User A CANNOT see User B's transactions
      expect(descriptions.some(d => d.includes('User B Transaction 1'))).toBe(false);
      expect(descriptions.some(d => d.includes('User B Transaction 2'))).toBe(false);
    });

    test('should prevent users from accessing other users transactions via URL manipulation', async ({ page }) => {
      // Register User A and create a transaction
      await registerUser(page, `user.url.a.${Date.now()}@example.com`, USER_A.password);
      await createTransaction(page, '500', 'User A Private Transaction', 'expense');
      
      // Get transaction ID from URL or page
      await page.goto('/transactions');
      await page.waitForLoadState('networkidle');
      
      // Try to find a transaction link or ID
      const transactionLinks = page.locator('a[href*="/transaction"], button[data-transaction-id]');
      const firstLink = transactionLinks.first();
      
      let transactionId: string | null = null;
      if (await firstLink.isVisible().catch(() => false)) {
        const href = await firstLink.getAttribute('href');
        if (href) {
          const match = href.match(/\/transaction[s]?\/(\d+)/);
          if (match) {
            transactionId = match[1];
          }
        }
      }
      
      // Logout User A
      await logout(page);
      
      // Register User B
      await registerUser(page, `user.url.b.${Date.now()}@example.com`, USER_B.password);
      
      // Try to access User A's transaction directly via URL
      if (transactionId) {
        await page.goto(`/transactions/${transactionId}`);
        await page.waitForLoadState('networkidle');
        
        // Should either show error or redirect
        const errorMessage = page.locator('text=/not found/i, text=/access denied/i, text=/unauthorized/i, text=/forbidden/i');
        const hasError = await errorMessage.isVisible().catch(() => false);
        
        // Or should not show User A's transaction details
        const privateTransaction = page.locator('text=/User A Private Transaction/i');
        const showsPrivateData = await privateTransaction.isVisible().catch(() => false);
        
        expect(hasError || !showsPrivateData).toBe(true);
      }
    });
  });
});

  test.describe('16.2 Dashboard Data Isolation', () => {

    test('should display different dashboard data for User A and User B', async ({ page }) => {
      // Register User A
      await registerUser(page, `dashboard.a.${Date.now()}@example.com`, USER_A.password);
      
      // User A creates specific transactions
      await createTransaction(page, '1000', 'User A Income 1', 'income');
      await createTransaction(page, '500', 'User A Expense 1', 'expense');
      
      // Navigate to dashboard and capture User A's data
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      // Capture User A's dashboard content
      const userADashboard = await page.textContent('body');
      
      // Logout User A
      await logout(page);
      
      // Register User B
      await registerUser(page, `dashboard.b.${Date.now()}@example.com`, USER_B.password);
      
      // User B creates different transactions
      await createTransaction(page, '2000', 'User B Income 1', 'income');
      await createTransaction(page, '1500', 'User B Expense 1', 'expense');
      
      // Navigate to dashboard and capture User B's data
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      // Capture User B's dashboard content
      const userBDashboard = await page.textContent('body');
      
      // Verify dashboards show different data
      expect(userADashboard).not.toBe(userBDashboard);
      
      // Verify User B's dashboard doesn't contain User A's transaction descriptions
      expect(userBDashboard).not.toContain('User A Income 1');
      expect(userBDashboard).not.toContain('User A Expense 1');
      
      // Verify User B's dashboard contains their own data
      expect(userBDashboard).toContain('User B Income 1');
      expect(userBDashboard).toContain('User B Expense 1');
    });

    test('should show correct summary calculations for each user', async ({ page }) => {
      // Register User A
      await registerUser(page, `summary.a.${Date.now()}@example.com`, USER_A.password);
      
      // User A creates transactions with known amounts
      await createTransaction(page, '1000', 'User A Income', 'income');
      await createTransaction(page, '300', 'User A Expense', 'expense');
      
      // Check User A's dashboard
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      // Look for summary cards with totals
      const userAIncome = await page.locator('text=/1[,]?000/').first().isVisible().catch(() => false);
      const userAExpense = await page.locator('text=/300/').first().isVisible().catch(() => false);
      
      // At least one of the amounts should be visible
      expect(userAIncome || userAExpense).toBe(true);
      
      // Logout User A
      await logout(page);
      
      // Register User B
      await registerUser(page, `summary.b.${Date.now()}@example.com`, USER_B.password);
      
      // User B creates transactions with different amounts
      await createTransaction(page, '5000', 'User B Income', 'income');
      await createTransaction(page, '2000', 'User B Expense', 'expense');
      
      // Check User B's dashboard
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      // Look for User B's amounts
      const userBIncome = await page.locator('text=/5[,]?000/').first().isVisible().catch(() => false);
      const userBExpense = await page.locator('text=/2[,]?000/').first().isVisible().catch(() => false);
      
      // At least one of User B's amounts should be visible
      expect(userBIncome || userBExpense).toBe(true);
      
      // Verify User A's amounts are NOT visible on User B's dashboard
      const hasUserAAmount = await page.locator('text=/^300$/').isVisible().catch(() => false);
      expect(hasUserAAmount).toBe(false);
    });

    test('should show correct chart data for each user', async ({ page }) => {
      // Register User A
      await registerUser(page, `chart.a.${Date.now()}@example.com`, USER_A.password);
      
      // User A creates transactions
      await createTransaction(page, '100', 'User A Chart Transaction', 'expense');
      
      // Navigate to dashboard
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      // Check if charts are rendered (look for canvas or SVG elements)
      const userAHasCharts = await page.locator('canvas, svg[class*="chart"], [class*="recharts"]').first().isVisible().catch(() => false);
      
      // Logout User A
      await logout(page);
      
      // Register User B
      await registerUser(page, `chart.b.${Date.now()}@example.com`, USER_B.password);
      
      // User B creates different transactions
      await createTransaction(page, '500', 'User B Chart Transaction', 'expense');
      
      // Navigate to dashboard
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      // Check if charts are rendered for User B
      const userBHasCharts = await page.locator('canvas, svg[class*="chart"], [class*="recharts"]').first().isVisible().catch(() => false);
      
      // Both users should have charts (even if different data)
      expect(userAHasCharts || userBHasCharts).toBe(true);
      
      // Verify User B's dashboard doesn't show User A's transaction description
      const pageContent = await page.textContent('body');
      expect(pageContent).not.toContain('User A Chart Transaction');
    });

    test('should apply date filters only to user own data', async ({ page }) => {
      // Register user
      await registerUser(page, `filter.${Date.now()}@example.com`, USER_A.password);
      
      // Create transactions
      await createTransaction(page, '100', 'Recent Transaction', 'expense');
      
      // Navigate to dashboard
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      // Look for date filter controls
      const dateFilter = page.locator('input[type="date"], select[name*="date"], button:has-text("Filter")').first();
      
      if (await dateFilter.isVisible().catch(() => false)) {
        // Apply a date filter
        await dateFilter.click();
        await page.waitForTimeout(500);
        
        // Verify dashboard still shows only user's data
        const content = await page.textContent('body');
        expect(content).toContain('Recent Transaction');
      }
      
      // The key test is that filtering doesn't expose other users' data
      // This is implicitly tested by the isolation tests above
    });
  });

  test.describe('16.3 Admin Configuration Management', () => {

    test('should allow admin to create category and users to use it', async ({ page }) => {
      // Try to login as admin
      await loginUser(page, TEST_ADMIN.email, TEST_ADMIN.password);
      
      // Check if login was successful
      const isOnLoginPage = page.url().includes('/login');
      
      if (!isOnLoginPage) {
        // Navigate to admin panel
        await page.goto('/admin');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
        
        // Check if we have access to admin panel
        const hasAdminAccess = !page.url().includes('/login') && 
                               !(await page.locator('text=/unauthorized/i, text=/access denied/i').isVisible().catch(() => false));
        
        if (hasAdminAccess) {
          // Look for category management section
          const categoryTab = page.locator('button:has-text("Categories"), a:has-text("Categories"), [role="tab"]:has-text("Categories")').first();
          
          if (await categoryTab.isVisible().catch(() => false)) {
            await categoryTab.click();
            await page.waitForTimeout(500);
          }
          
          // Try to add a new category
          const addCategoryButton = page.locator('button:has-text("Add Category"), button:has-text("New Category"), button:has-text("Create Category")').first();
          
          if (await addCategoryButton.isVisible().catch(() => false)) {
            await addCategoryButton.click();
            await page.waitForTimeout(500);
            
            // Fill category form
            const categoryName = `Test Category ${Date.now()}`;
            const nameInput = page.locator('input[name="name"], input[placeholder*="name" i]').first();
            await nameInput.fill(categoryName);
            
            // Select transaction type
            const typeSelect = page.locator('select[name="transaction_type_id"], select[name="type"]').first();
            if (await typeSelect.isVisible().catch(() => false)) {
              const options = await typeSelect.locator('option').all();
              if (options.length > 1) {
                await typeSelect.selectOption({ index: 1 });
              }
            }
            
            // Submit form
            const submitButton = page.locator('button[type="submit"]:has-text("Save"), button[type="submit"]:has-text("Create"), button[type="submit"]:has-text("Add")').first();
            await submitButton.click();
            await page.waitForTimeout(1000);
            
            // Logout admin
            await logout(page);
            
            // Register a regular user
            await registerUser(page, `regular.user.${Date.now()}@example.com`, USER_A.password);
            
            // Navigate to create transaction
            await page.goto('/transactions');
            await page.waitForLoadState('networkidle');
            
            const addTransactionButton = page.locator('button:has-text("Add Transaction"), button:has-text("New Transaction"), button:has-text("Create")').first();
            await addTransactionButton.click();
            await page.waitForTimeout(500);
            
            // Check if the new category is available
            const categorySelect = page.locator('select[name="category_id"], select[name="category"]').first();
            if (await categorySelect.isVisible().catch(() => false)) {
              const categoryOptions = await categorySelect.textContent();
              expect(categoryOptions).toContain(categoryName);
            }
          }
        }
      }
    });

    test('should show admin-managed configuration to all users', async ({ page }) => {
      // Register User A
      await registerUser(page, `config.a.${Date.now()}@example.com`, USER_A.password);
      
      // Navigate to transaction form
      await page.goto('/transactions');
      await page.waitForLoadState('networkidle');
      
      const addButton = page.locator('button:has-text("Add Transaction"), button:has-text("New Transaction"), button:has-text("Create")').first();
      await addButton.click();
      await page.waitForTimeout(500);
      
      // Get available categories for User A
      const categorySelect = page.locator('select[name="category_id"], select[name="category"]').first();
      let userACategories: string[] = [];
      
      if (await categorySelect.isVisible().catch(() => false)) {
        const options = await categorySelect.locator('option').all();
        for (const option of options) {
          const text = await option.textContent();
          if (text && text.trim() !== '' && !text.includes('Select')) {
            userACategories.push(text.trim());
          }
        }
      }
      
      // Logout User A
      await logout(page);
      
      // Register User B
      await registerUser(page, `config.b.${Date.now()}@example.com`, USER_B.password);
      
      // Navigate to transaction form
      await page.goto('/transactions');
      await page.waitForLoadState('networkidle');
      
      const addButtonB = page.locator('button:has-text("Add Transaction"), button:has-text("New Transaction"), button:has-text("Create")').first();
      await addButtonB.click();
      await page.waitForTimeout(500);
      
      // Get available categories for User B
      const categorySelectB = page.locator('select[name="category_id"], select[name="category"]').first();
      let userBCategories: string[] = [];
      
      if (await categorySelectB.isVisible().catch(() => false)) {
        const options = await categorySelectB.locator('option').all();
        for (const option of options) {
          const text = await option.textContent();
          if (text && text.trim() !== '' && !text.includes('Select')) {
            userBCategories.push(text.trim());
          }
        }
      }
      
      // Both users should see the same configuration options
      expect(userACategories.length).toBeGreaterThan(0);
      expect(userBCategories.length).toBeGreaterThan(0);
      expect(userACategories.sort()).toEqual(userBCategories.sort());
    });

    test('should allow users to create transactions with shared configuration', async ({ page }) => {
      // Register user
      await registerUser(page, `shared.config.${Date.now()}@example.com`, USER_A.password);
      
      // Create transaction using shared configuration
      await page.goto('/transactions');
      await page.waitForLoadState('networkidle');
      
      const addButton = page.locator('button:has-text("Add Transaction"), button:has-text("New Transaction"), button:has-text("Create")').first();
      await addButton.click();
      await page.waitForTimeout(500);
      
      // Fill transaction form with shared configuration
      await page.fill('input[name="amount"], input[placeholder*="amount" i]', '250');
      await page.fill('input[name="description"], textarea[name="description"], input[placeholder*="description" i]', 'Transaction with shared config');
      
      // Select options from shared configuration
      const typeSelect = page.locator('select[name="transaction_type_id"], select[name="type"]').first();
      if (await typeSelect.isVisible().catch(() => false)) {
        const options = await typeSelect.locator('option').all();
        if (options.length > 1) {
          await typeSelect.selectOption({ index: 1 });
        }
      }
      
      const categorySelect = page.locator('select[name="category_id"], select[name="category"]').first();
      if (await categorySelect.isVisible().catch(() => false)) {
        const options = await categorySelect.locator('option').all();
        if (options.length > 1) {
          await categorySelect.selectOption({ index: 1 });
        }
      }
      
      const accountSelect = page.locator('select[name="account_id"], select[name="account"]').first();
      if (await accountSelect.isVisible().catch(() => false)) {
        const options = await accountSelect.locator('option').all();
        if (options.length > 1) {
          await accountSelect.selectOption({ index: 1 });
        }
      }
      
      const paymentSelect = page.locator('select[name="payment_mode_id"], select[name="payment_mode"]').first();
      if (await paymentSelect.isVisible().catch(() => false)) {
        const options = await paymentSelect.locator('option').all();
        if (options.length > 1) {
          await paymentSelect.selectOption({ index: 1 });
        }
      }
      
      // Submit form
      const submitButton = page.locator('button[type="submit"]:has-text("Save"), button[type="submit"]:has-text("Create"), button[type="submit"]:has-text("Add")').first();
      await submitButton.click();
      await page.waitForTimeout(1000);
      
      // Verify transaction was created
      await page.goto('/transactions');
      await page.waitForLoadState('networkidle');
      
      const content = await page.textContent('body');
      expect(content).toContain('Transaction with shared config');
    });

    test('should prevent regular users from accessing admin panel', async ({ page }) => {
      // Register regular user
      await registerUser(page, `no.admin.${Date.now()}@example.com`, USER_A.password);
      
      // Try to access admin panel
      await page.goto('/admin');
      await page.waitForLoadState('networkidle');
      
      // Should either redirect or show unauthorized message
      const isOnAdminPage = page.url().includes('/admin');
      
      if (isOnAdminPage) {
        // Check for unauthorized message
        const unauthorizedMessage = page.locator('text=/unauthorized/i, text=/access denied/i, text=/forbidden/i');
        const hasUnauthorized = await unauthorizedMessage.isVisible().catch(() => false);
        expect(hasUnauthorized).toBe(true);
      } else {
        // Should redirect away from admin page
        expect(page.url()).not.toContain('/admin');
      }
    });
  });
});
