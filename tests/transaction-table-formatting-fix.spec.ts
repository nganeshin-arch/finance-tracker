/**
 * Transaction Table Formatting Fix Test
 * 
 * Tests the improved date formatting and action column visibility in the transaction table.
 * Addresses the issues highlighted by the user:
 * 1. Date formatting taking too much space
 * 2. Action column not being visible
 * 
 * Key improvements tested:
 * 1. Compact date format (dd MMM on first line, yyyy on second line)
 * 2. Always visible delete button in action column
 * 3. Better visual hierarchy and spacing
 * 4. Proper hover states and accessibility
 */

import { test, expect } from '@playwright/test';

test.describe('Transaction Table Formatting Fix', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the homepage where transaction table is displayed
    await page.goto('/');
    
    // Wait for the page to load and transactions to be visible
    await page.waitForSelector('[role="table"], table');
  });

  test('should display dates in compact format (dd MMM / yyyy)', async ({ page }) => {
    // Look for transaction table rows
    const transactionRows = page.locator('tbody tr');
    
    if (await transactionRows.count() > 0) {
      const firstRow = transactionRows.first();
      const dateCell = firstRow.locator('td').first();
      
      // Check that date cell contains the compact format
      await expect(dateCell).toBeVisible();
      
      // The date should be in format "dd MMM" on first line and "yyyy" on second line
      const dateText = await dateCell.textContent();
      
      // Should match pattern like "07 Mar" followed by year
      expect(dateText).toMatch(/\d{2}\s+\w{3}/); // dd MMM pattern
      expect(dateText).toMatch(/\d{4}/); // yyyy pattern
      
      // Should not contain comma (old format had "Mar 07, 2026")
      expect(dateText).not.toContain(',');
    }
  });

  test('should have proper date cell structure with two lines', async ({ page }) => {
    const transactionRows = page.locator('tbody tr');
    
    if (await transactionRows.count() > 0) {
      const firstRow = transactionRows.first();
      const dateCell = firstRow.locator('td').first();
      
      // Check for the two div structure
      const mainDateDiv = dateCell.locator('div').first();
      const yearDiv = dateCell.locator('div').nth(1);
      
      await expect(mainDateDiv).toBeVisible();
      await expect(yearDiv).toBeVisible();
      
      // Main date should have min-width class
      await expect(mainDateDiv).toHaveClass(/min-w-\[70px\]/);
      
      // Year div should have muted text styling
      await expect(yearDiv).toHaveClass(/text-xs/);
      await expect(yearDiv).toHaveClass(/text-muted-foreground/);
    }
  });

  test('should have always visible action buttons', async ({ page }) => {
    const transactionRows = page.locator('tbody tr');
    
    if (await transactionRows.count() > 0) {
      const firstRow = transactionRows.first();
      const actionCell = firstRow.locator('td').last();
      const deleteButton = actionCell.locator('button[aria-label="Delete transaction"]');
      
      // Delete button should be visible without hovering
      await expect(deleteButton).toBeVisible();
      
      // Button should not have opacity-0 class
      const buttonClasses = await deleteButton.getAttribute('class');
      expect(buttonClasses).not.toContain('opacity-0');
      
      // Button should have proper styling
      expect(buttonClasses).toContain('h-8');
      expect(buttonClasses).toContain('w-8');
      expect(buttonClasses).toContain('text-muted-foreground');
    }
  });

  test('should have proper action button hover states', async ({ page }) => {
    const transactionRows = page.locator('tbody tr');
    
    if (await transactionRows.count() > 0) {
      const firstRow = transactionRows.first();
      const actionCell = firstRow.locator('td').last();
      const deleteButton = actionCell.locator('button[aria-label="Delete transaction"]');
      
      // Check hover classes are present
      const buttonClasses = await deleteButton.getAttribute('class');
      expect(buttonClasses).toContain('hover:text-destructive');
      expect(buttonClasses).toContain('hover:bg-destructive/10');
      expect(buttonClasses).toContain('transition-colors');
      
      // Hover over the button
      await deleteButton.hover();
      
      // Button should still be visible and interactive
      await expect(deleteButton).toBeVisible();
    }
  });

  test('should maintain proper table column alignment', async ({ page }) => {
    // Check table headers
    const headers = page.locator('thead th');
    
    // Date column should be left-aligned
    const dateHeader = headers.first();
    await expect(dateHeader).toHaveClass(/text-left/);
    
    // Action column should be center-aligned
    const actionHeader = headers.last();
    await expect(actionHeader).toHaveClass(/text-center/);
    
    // Check corresponding data cells
    const transactionRows = page.locator('tbody tr');
    
    if (await transactionRows.count() > 0) {
      const firstRow = transactionRows.first();
      
      // Date cell alignment
      const dateCell = firstRow.locator('td').first();
      const dateCellClasses = await dateCell.getAttribute('class');
      expect(dateCellClasses).toContain('font-medium');
      
      // Action cell alignment
      const actionCell = firstRow.locator('td').last();
      const actionCellClasses = await actionCell.getAttribute('class');
      expect(actionCellClasses).toContain('text-center');
    }
  });

  test('should have accessible delete buttons', async ({ page }) => {
    const transactionRows = page.locator('tbody tr');
    
    if (await transactionRows.count() > 0) {
      const firstRow = transactionRows.first();
      const deleteButton = firstRow.locator('button[aria-label="Delete transaction"]');
      
      // Button should have proper ARIA label
      await expect(deleteButton).toHaveAttribute('aria-label', 'Delete transaction');
      
      // Button should be focusable
      await deleteButton.focus();
      await expect(deleteButton).toBeFocused();
      
      // Button should have trash icon
      const trashIcon = deleteButton.locator('svg');
      await expect(trashIcon).toBeVisible();
      await expect(trashIcon).toHaveClass(/h-4/);
      await expect(trashIcon).toHaveClass(/w-4/);
    }
  });

  test('should handle empty transaction list properly', async ({ page }) => {
    // If no transactions, should show appropriate message
    const emptyMessage = page.locator('text=No transactions found');
    const transactionRows = page.locator('tbody tr');
    
    const rowCount = await transactionRows.count();
    
    if (rowCount === 0) {
      await expect(emptyMessage).toBeVisible();
    } else {
      // If transactions exist, empty message should not be visible
      await expect(emptyMessage).not.toBeVisible();
    }
  });

  test('should maintain responsive design', async ({ page }) => {
    // Test on different viewport sizes
    const viewports = [
      { width: 1200, height: 800 }, // Desktop
      { width: 768, height: 1024 },  // Tablet
      { width: 375, height: 667 },   // Mobile
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      
      // Table should have horizontal scroll on smaller screens
      const tableContainer = page.locator('.overflow-x-auto');
      await expect(tableContainer).toBeVisible();
      
      // Date cells should maintain their structure
      const transactionRows = page.locator('tbody tr');
      
      if (await transactionRows.count() > 0) {
        const firstRow = transactionRows.first();
        const dateCell = firstRow.locator('td').first();
        
        // Date cell should still have proper structure
        const mainDateDiv = dateCell.locator('div').first();
        await expect(mainDateDiv).toBeVisible();
        await expect(mainDateDiv).toHaveClass(/min-w-\[70px\]/);
      }
    }
  });
});

/**
 * Property-based test for date formatting consistency
 */
test.describe('Date Formatting Property Tests', () => {
  test('should consistently format various dates in compact format', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[role="table"], table');
    
    const transactionRows = page.locator('tbody tr');
    const rowCount = await transactionRows.count();
    
    // Test multiple rows if available
    for (let i = 0; i < Math.min(rowCount, 5); i++) {
      const row = transactionRows.nth(i);
      const dateCell = row.locator('td').first();
      const dateText = await dateCell.textContent();
      
      if (dateText) {
        // Should contain day and month abbreviation
        expect(dateText).toMatch(/\d{1,2}\s+\w{3}/);
        
        // Should contain year
        expect(dateText).toMatch(/\d{4}/);
        
        // Should not contain comma (old format)
        expect(dateText).not.toContain(',');
        
        // Should be compact (less than 15 characters total)
        expect(dateText.replace(/\s+/g, ' ').trim().length).toBeLessThan(15);
      }
    }
  });
});