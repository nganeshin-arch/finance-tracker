/**
 * API Integration Test Utility
 * This file contains functions to test all API endpoints
 * Run this in the browser console to verify API connectivity
 */

import { configService, trackingCycleService, transactionService, dashboardService } from '../services';

export const testApiIntegration = async () => {
  console.log('🚀 Starting API Integration Tests...\n');
  
  const results = {
    passed: 0,
    failed: 0,
    errors: [] as string[],
  };

  // Helper function to run a test
  const runTest = async (name: string, testFn: () => Promise<void>) => {
    try {
      console.log(`Testing: ${name}...`);
      await testFn();
      console.log(`✅ ${name} - PASSED\n`);
      results.passed++;
    } catch (error: any) {
      console.error(`❌ ${name} - FAILED:`, error.message);
      results.failed++;
      results.errors.push(`${name}: ${error.message}`);
    }
  };

  // Test Configuration Endpoints
  await runTest('GET /api/config/types', async () => {
    const types = await configService.getTransactionTypes();
    if (!Array.isArray(types)) throw new Error('Expected array of transaction types');
    console.log(`  Found ${types.length} transaction types`);
  });

  await runTest('GET /api/config/categories', async () => {
    const categories = await configService.getCategories();
    if (!Array.isArray(categories)) throw new Error('Expected array of categories');
    console.log(`  Found ${categories.length} categories`);
  });

  await runTest('GET /api/config/subcategories', async () => {
    const subCategories = await configService.getSubCategories();
    if (!Array.isArray(subCategories)) throw new Error('Expected array of sub-categories');
    console.log(`  Found ${subCategories.length} sub-categories`);
  });

  await runTest('GET /api/config/modes', async () => {
    const modes = await configService.getPaymentModes();
    if (!Array.isArray(modes)) throw new Error('Expected array of payment modes');
    console.log(`  Found ${modes.length} payment modes`);
  });

  await runTest('GET /api/config/accounts', async () => {
    const accounts = await configService.getAccounts();
    if (!Array.isArray(accounts)) throw new Error('Expected array of accounts');
    console.log(`  Found ${accounts.length} accounts`);
  });

  // Test Tracking Cycle Endpoints
  await runTest('GET /api/tracking-cycles', async () => {
    const cycles = await trackingCycleService.getTrackingCycles();
    if (!Array.isArray(cycles)) throw new Error('Expected array of tracking cycles');
    console.log(`  Found ${cycles.length} tracking cycles`);
  });

  await runTest('GET /api/tracking-cycles/active', async () => {
    const activeCycle = await trackingCycleService.getActiveTrackingCycle();
    console.log(`  Active cycle:`, activeCycle ? activeCycle.name : 'None');
  });

  // Test Transaction Endpoints
  await runTest('GET /api/transactions', async () => {
    const transactions = await transactionService.getTransactions();
    if (!Array.isArray(transactions)) throw new Error('Expected array of transactions');
    console.log(`  Found ${transactions.length} transactions`);
  });

  // Test Dashboard Endpoints
  await runTest('GET /api/dashboard/summary', async () => {
    const summary = await dashboardService.getSummary();
    if (typeof summary.totalIncome !== 'number') throw new Error('Expected totalIncome to be a number');
    if (typeof summary.totalExpenses !== 'number') throw new Error('Expected totalExpenses to be a number');
    if (typeof summary.netBalance !== 'number') throw new Error('Expected netBalance to be a number');
    console.log(`  Income: ${summary.totalIncome}, Expenses: ${summary.totalExpenses}, Balance: ${summary.netBalance}`);
  });

  await runTest('GET /api/dashboard/expenses-by-category', async () => {
    const expenses = await dashboardService.getExpensesByCategory();
    if (!Array.isArray(expenses)) throw new Error('Expected array of expenses by category');
    console.log(`  Found ${expenses.length} expense categories`);
  });

  await runTest('GET /api/dashboard/monthly-trend', async () => {
    const trend = await dashboardService.getMonthlyTrend();
    if (!Array.isArray(trend)) throw new Error('Expected array of monthly trends');
    console.log(`  Found ${trend.length} months of trend data`);
  });

  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Summary:');
  console.log(`  ✅ Passed: ${results.passed}`);
  console.log(`  ❌ Failed: ${results.failed}`);
  console.log(`  📈 Total: ${results.passed + results.failed}`);
  
  if (results.errors.length > 0) {
    console.log('\n❌ Failed Tests:');
    results.errors.forEach(error => console.log(`  - ${error}`));
  }
  
  console.log('='.repeat(50) + '\n');

  return results;
};

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as any).testApiIntegration = testApiIntegration;
}
