import { test, expect } from '@playwright/test';

/**
 * Task 9.3: Smooth Scroll Animations Test
 * 
 * Tests smooth scroll behavior, fade-in animations for sections,
 * and stagger effects for dashboard cards.
 * 
 * Requirements: 9.3
 */

test.describe('Task 9.3: Smooth Scroll Animations', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the unified home page
    await page.goto('/');
    
    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');
    
    // Wait for animations to complete
    await page.waitForTimeout(1000);
  });

  test('should have smooth scroll behavior enabled globally', async ({ page }) => {
    // Check that html element has smooth scroll behavior
    const scrollBehavior = await page.evaluate(() => {
      return window.getComputedStyle(document.documentElement).scrollBehavior;
    });
    
    expect(scrollBehavior).toBe('smooth');
  });

  test('should respect prefers-reduced-motion for smooth scroll', async ({ page }) => {
    // Set prefers-reduced-motion to reduce
    await page.emulateMedia({ reducedMotion: 'reduce' });
    
    // Check that scroll behavior is auto when reduced motion is preferred
    const scrollBehavior = await page.evaluate(() => {
      return window.getComputedStyle(document.documentElement).scrollBehavior;
    });
    
    expect(scrollBehavior).toBe('auto');
  });

  test('should have navigation links that trigger smooth scrolling', async ({ page }) => {
    // Check that navigation links exist (on tablet+ screens)
    await page.setViewportSize({ width: 1024, height: 768 });
    
    const dashboardLink = page.locator('nav button:has-text("Dashboard")');
    const addTransactionLink = page.locator('nav button:has-text("Add Transaction")');
    const transactionsLink = page.locator('nav button:has-text("Transactions")');
    
    await expect(dashboardLink).toBeVisible();
    await expect(addTransactionLink).toBeVisible();
    await expect(transactionsLink).toBeVisible();
  });

  test('should have sections with proper IDs for navigation', async ({ page }) => {
    // Check that sections have the correct IDs
    const dashboardSection = page.locator('#dashboard-section');
    const addTransactionSection = page.locator('#add-transaction-section');
    const transactionsSection = page.locator('#transactions-section');
    
    await expect(dashboardSection).toBeVisible();
    await expect(addTransactionSection).toBeVisible();
    await expect(transactionsSection).toBeVisible();
  });

  test('should apply fade-in animations to main sections', async ({ page }) => {
    // Check that sections have fade-in animation classes
    const viewModeCard = page.locator('main > .shadow-lg').first();
    const dashboardCard = page.locator('#dashboard-section .shadow-lg');
    const transactionFormCard = page.locator('#add-transaction-section .shadow-lg');
    const transactionsCard = page.locator('#transactions-section .shadow-lg');
    
    // Check for animation classes
    await expect(viewModeCard).toHaveClass(/motion-safe:animate-fade-in/);
    await expect(dashboardCard).toHaveClass(/motion-safe:animate-fade-in/);
    await expect(transactionFormCard).toHaveClass(/motion-safe:animate-fade-in/);
    await expect(transactionsCard).toHaveClass(/motion-safe:animate-fade-in/);
  });

  test('should apply staggered animation delays to sections', async ({ page }) => {
    // Check that sections have different animation delays
    const viewModeCard = page.locator('main > .shadow-lg').first();
    const dashboardCard = page.locator('#dashboard-section .shadow-lg');
    const transactionFormCard = page.locator('#add-transaction-section .shadow-lg');
    const transactionsCard = page.locator('#transactions-section .shadow-lg');
    
    // Check animation delays
    const viewModeDelay = await viewModeCard.evaluate(el => el.style.animationDelay);
    const dashboardDelay = await dashboardCard.evaluate(el => el.style.animationDelay);
    const formDelay = await transactionFormCard.evaluate(el => el.style.animationDelay);
    const transactionsDelay = await transactionsCard.evaluate(el => el.style.animationDelay);
    
    expect(viewModeDelay).toBe('0ms');
    expect(dashboardDelay).toBe('100ms');
    expect(formDelay).toBe('400ms');
    expect(transactionsDelay).toBe('500ms');
  });

  test('should apply stagger effects to dashboard cards', async ({ page }) => {
    // Wait for dashboard cards to load
    await page.waitForSelector('[data-testid="stat-card"]', { timeout: 5000 });
    
    // Get all dashboard stat cards
    const statCards = page.locator('[data-testid="stat-card"]');
    const cardCount = await statCards.count();
    
    expect(cardCount).toBeGreaterThan(0);
    
    // Check that cards have stagger animation classes
    for (let i = 0; i < cardCount; i++) {
      const card = statCards.nth(i);
      await expect(card).toHaveClass(/motion-safe:animate-fade-in/);
      
      // Check that each card has a different animation delay
      const animationDelay = await card.evaluate(el => el.style.animationDelay);
      const expectedDelay = `${i * 150}ms`;
      expect(animationDelay).toBe(expectedDelay);
    }
  });

  test('should have smooth transitions on navigation button interactions', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    
    const dashboardLink = page.locator('nav button:has-text("Dashboard")');
    
    // Check hover effects
    await dashboardLink.hover();
    
    // Check that button has transition classes
    await expect(dashboardLink).toHaveClass(/transition-colors/);
    await expect(dashboardLink).toHaveClass(/duration-200/);
    await expect(dashboardLink).toHaveClass(/hover:scale-105/);
    await expect(dashboardLink).toHaveClass(/active:scale-95/);
  });

  test('should scroll smoothly when navigation links are clicked', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    
    // Click on Add Transaction link
    const addTransactionLink = page.locator('nav button:has-text("Add Transaction")');
    await addTransactionLink.click();
    
    // Wait for scroll to complete
    await page.waitForTimeout(1000);
    
    // Check that the Add Transaction section is in view
    const addTransactionSection = page.locator('#add-transaction-section');
    await expect(addTransactionSection).toBeInViewport();
  });

  test('should respect reduced motion preferences for animations', async ({ page }) => {
    // Set prefers-reduced-motion to reduce
    await page.emulateMedia({ reducedMotion: 'reduce' });
    
    // Reload page to apply reduced motion
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Check that animations are disabled or significantly reduced
    const animationDuration = await page.evaluate(() => {
      const element = document.querySelector('.motion-safe\\:animate-fade-in');
      if (element) {
        return window.getComputedStyle(element).animationDuration;
      }
      return null;
    });
    
    // With reduced motion, animations should be very short or disabled
    if (animationDuration) {
      const duration = parseFloat(animationDuration);
      expect(duration).toBeLessThan(0.1); // Less than 100ms
    }
  });

  test('should have proper ARIA labels and accessibility for navigation', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    
    // Check that navigation has proper structure
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
    
    // Check that buttons are keyboard accessible
    const dashboardLink = page.locator('nav button:has-text("Dashboard")');
    await dashboardLink.focus();
    await expect(dashboardLink).toBeFocused();
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    const addTransactionLink = page.locator('nav button:has-text("Add Transaction")');
    await expect(addTransactionLink).toBeFocused();
  });
});