import { test, expect } from '@playwright/test';

/**
 * Test Suite: Dashboard Premium Card Styling
 * 
 * **Validates: Requirements 9.1**
 * 
 * This test suite verifies that premium card components are properly applied
 * to all dashboard sections with consistent spacing and hover effects.
 */

test.describe('Dashboard Premium Card Styling', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the dashboard
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
  });

  test('should apply premium card styling to View Mode Selector section', async ({ page }) => {
    const viewModeCard = page.locator('[data-testid="view-mode-selector"]').or(
      page.locator('main > div').first()
    );
    
    // Check if the card has premium variant classes
    const cardClasses = await viewModeCard.getAttribute('class');
    expect(cardClasses).toContain('shadow-lg');
    expect(cardClasses).toContain('hover:shadow-xl');
    expect(cardClasses).toContain('transition-all');
    expect(cardClasses).toContain('duration-300');
  });

  test('should apply premium card styling to Dashboard section', async ({ page }) => {
    const dashboardCard = page.locator('h1:has-text("Dashboard")').locator('..').locator('..');
    
    // Check if the dashboard section is wrapped in a premium card
    const cardClasses = await dashboardCard.getAttribute('class');
    expect(cardClasses).toContain('shadow-lg');
    expect(cardClasses).toContain('hover:shadow-xl');
    expect(cardClasses).toContain('transition-all');
  });

  test('should apply premium card styling to Transaction Form section', async ({ page }) => {
    const transactionFormCard = page.locator('h2:has-text("Add Transaction")').locator('..').locator('..');
    
    // Check if the transaction form section is wrapped in a premium card
    const cardClasses = await transactionFormCard.getAttribute('class');
    expect(cardClasses).toContain('shadow-lg');
    expect(cardClasses).toContain('hover:shadow-xl');
    expect(cardClasses).toContain('transition-all');
  });

  test('should apply premium card styling to Transactions section', async ({ page }) => {
    const transactionsCard = page.locator('h2:has-text("Transactions")').locator('..').locator('..');
    
    // Check if the transactions section is wrapped in a premium card
    const cardClasses = await transactionsCard.getAttribute('class');
    expect(cardClasses).toContain('shadow-lg');
    expect(cardClasses).toContain('hover:shadow-xl');
    expect(cardClasses).toContain('transition-all');
  });

  test('should have consistent spacing between dashboard sections', async ({ page }) => {
    const mainContainer = page.locator('main');
    
    // Check if main container has proper spacing classes
    const containerClasses = await mainContainer.getAttribute('class');
    expect(containerClasses).toContain('space-y-6');
    expect(containerClasses).toContain('sm:space-y-8');
  });

  test('should display enhanced typography with gradients in section headers', async ({ page }) => {
    // Check Dashboard header
    const dashboardHeader = page.locator('h1:has-text("Dashboard")');
    const dashboardClasses = await dashboardHeader.getAttribute('class');
    expect(dashboardClasses).toContain('font-bold');
    expect(dashboardClasses).toContain('bg-gradient-to-r');
    expect(dashboardClasses).toContain('bg-clip-text');
    expect(dashboardClasses).toContain('text-transparent');

    // Check Add Transaction header
    const transactionHeader = page.locator('h2:has-text("Add Transaction")');
    const transactionClasses = await transactionHeader.getAttribute('class');
    expect(transactionClasses).toContain('font-bold');
    expect(transactionClasses).toContain('bg-gradient-to-r');

    // Check Transactions header
    const transactionsHeader = page.locator('h2:has-text("Transactions")');
    const transactionsClasses = await transactionsHeader.getAttribute('class');
    expect(transactionsClasses).toContain('font-bold');
    expect(transactionsClasses).toContain('bg-gradient-to-r');
  });

  test('should display gradient accent bars in section headers', async ({ page }) => {
    // Check for gradient accent bars in headers
    const accentBars = page.locator('.bg-gradient-to-b.from-primary.to-primary\\/70');
    const accentBarCount = await accentBars.count();
    
    // Should have accent bars for Dashboard, Add Transaction, and Transactions sections
    expect(accentBarCount).toBeGreaterThanOrEqual(3);
  });

  test('should have proper card hover effects on interactive elements', async ({ page }) => {
    const premiumCards = page.locator('[class*="hover:shadow-xl"]');
    const cardCount = await premiumCards.count();
    
    // Should have multiple premium cards with hover effects
    expect(cardCount).toBeGreaterThanOrEqual(4);
    
    // Test hover effect on first card
    const firstCard = premiumCards.first();
    await firstCard.hover();
    
    // Verify the card is visible and interactive
    await expect(firstCard).toBeVisible();
  });

  test('should maintain responsive design with proper padding', async ({ page }) => {
    // Check that cards have responsive padding
    const cardContents = page.locator('[class*="p-6"][class*="sm:p-8"]');
    const responsiveCardCount = await cardContents.count();
    
    // Should have multiple cards with responsive padding
    expect(responsiveCardCount).toBeGreaterThanOrEqual(2);
  });

  test('should display section subheadings with proper styling', async ({ page }) => {
    // Check for Financial Overview subheading
    const financialOverview = page.locator('h2:has-text("Financial Overview")');
    if (await financialOverview.count() > 0) {
      const classes = await financialOverview.getAttribute('class');
      expect(classes).toContain('font-semibold');
      expect(classes).toContain('text-muted-foreground');
    }

    // Check for Category Breakdown subheading
    const categoryBreakdown = page.locator('h2:has-text("Category Breakdown")');
    if (await categoryBreakdown.count() > 0) {
      const classes = await categoryBreakdown.getAttribute('class');
      expect(classes).toContain('font-semibold');
      expect(classes).toContain('text-muted-foreground');
    }
  });
});