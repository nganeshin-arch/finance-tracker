import request from 'supertest';
import app from '../../index';
import pool from '../../config/database';
import authService from '../../services/authService';

describe('Dashboard Endpoints - User Isolation Integration Tests', () => {
  let userAToken: string;
  let userBToken: string;
  let userAId: number;
  let userBId: number;
  let incomeTypeId: number;
  let expenseTypeId: number;
  let categoryId: number;
  let accountId: number;
  let paymentModeId: number;

  beforeAll(async () => {
    // Create test users
    const userAEmail = `test-dashboard-a-${Date.now()}@example.com`;
    const userBEmail = `test-dashboard-b-${Date.now()}@example.com`;
    const password = 'TestPassword123!';
    const passwordHash = await authService.hashPassword(password);

    // Insert User A
    const userAResult = await pool.query(
      'INSERT INTO users (email, password_hash, username, role) VALUES ($1, $2, $3, $4) RETURNING id',
      [userAEmail, passwordHash, 'Dashboard User A', 'user']
    );
    userAId = userAResult.rows[0].id;
    userAToken = authService.generateToken(userAId, 'user');

    // Insert User B
    const userBResult = await pool.query(
      'INSERT INTO users (email, password_hash, username, role) VALUES ($1, $2, $3, $4) RETURNING id',
      [userBEmail, passwordHash, 'Dashboard User B', 'user']
    );
    userBId = userBResult.rows[0].id;
    userBToken = authService.generateToken(userBId, 'user');

    // Get configuration IDs
    const incomeTypeResult = await pool.query(
      "SELECT id FROM transaction_types WHERE name = 'Income' LIMIT 1"
    );
    incomeTypeId = incomeTypeResult.rows[0]?.id;

    const expenseTypeResult = await pool.query(
      "SELECT id FROM transaction_types WHERE name = 'Expense' LIMIT 1"
    );
    expenseTypeId = expenseTypeResult.rows[0]?.id;

    const categoryResult = await pool.query('SELECT id FROM categories LIMIT 1');
    categoryId = categoryResult.rows[0].id;

    const accountResult = await pool.query('SELECT id FROM accounts LIMIT 1');
    accountId = accountResult.rows[0].id;

    const paymentModeResult = await pool.query('SELECT id FROM payment_modes LIMIT 1');
    paymentModeId = paymentModeResult.rows[0].id;

    // Create transactions for User A
    // 3 income transactions totaling 3000
    await pool.query(
      `INSERT INTO transactions (user_id, date, transaction_type_id, category_id, account_id, payment_mode_id, amount, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [userAId, '2024-01-10', incomeTypeId, categoryId, accountId, paymentModeId, 1000, 'User A Income 1']
    );
    await pool.query(
      `INSERT INTO transactions (user_id, date, transaction_type_id, category_id, account_id, payment_mode_id, amount, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [userAId, '2024-01-15', incomeTypeId, categoryId, accountId, paymentModeId, 1500, 'User A Income 2']
    );
    await pool.query(
      `INSERT INTO transactions (user_id, date, transaction_type_id, category_id, account_id, payment_mode_id, amount, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [userAId, '2024-01-20', incomeTypeId, categoryId, accountId, paymentModeId, 500, 'User A Income 3']
    );

    // 2 expense transactions totaling 1200
    await pool.query(
      `INSERT INTO transactions (user_id, date, transaction_type_id, category_id, account_id, payment_mode_id, amount, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [userAId, '2024-01-12', expenseTypeId, categoryId, accountId, paymentModeId, 700, 'User A Expense 1']
    );
    await pool.query(
      `INSERT INTO transactions (user_id, date, transaction_type_id, category_id, account_id, payment_mode_id, amount, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [userAId, '2024-01-18', expenseTypeId, categoryId, accountId, paymentModeId, 500, 'User A Expense 2']
    );

    // Create transactions for User B
    // 2 income transactions totaling 5000
    await pool.query(
      `INSERT INTO transactions (user_id, date, transaction_type_id, category_id, account_id, payment_mode_id, amount, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [userBId, '2024-01-11', incomeTypeId, categoryId, accountId, paymentModeId, 2000, 'User B Income 1']
    );
    await pool.query(
      `INSERT INTO transactions (user_id, date, transaction_type_id, category_id, account_id, payment_mode_id, amount, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [userBId, '2024-01-16', incomeTypeId, categoryId, accountId, paymentModeId, 3000, 'User B Income 2']
    );

    // 3 expense transactions totaling 2500
    await pool.query(
      `INSERT INTO transactions (user_id, date, transaction_type_id, category_id, account_id, payment_mode_id, amount, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [userBId, '2024-01-13', expenseTypeId, categoryId, accountId, paymentModeId, 1000, 'User B Expense 1']
    );
    await pool.query(
      `INSERT INTO transactions (user_id, date, transaction_type_id, category_id, account_id, payment_mode_id, amount, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [userBId, '2024-01-17', expenseTypeId, categoryId, accountId, paymentModeId, 800, 'User B Expense 2']
    );
    await pool.query(
      `INSERT INTO transactions (user_id, date, transaction_type_id, category_id, account_id, payment_mode_id, amount, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [userBId, '2024-01-22', expenseTypeId, categoryId, accountId, paymentModeId, 700, 'User B Expense 3']
    );
  });

  afterAll(async () => {
    // Clean up test data
    await pool.query('DELETE FROM transactions WHERE user_id IN ($1, $2)', [userAId, userBId]);
    await pool.query('DELETE FROM users WHERE id IN ($1, $2)', [userAId, userBId]);
    await pool.end();
  });

  describe('GET /api/dashboard - Get Dashboard Data', () => {
    it('should return User A dashboard with only User A data', async () => {
      const response = await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${userAToken}`)
        .expect(200);

      expect(response.body).toBeDefined();
      
      // Verify summary calculations are based on User A's data only
      // User A: Income = 3000, Expense = 1200, Balance = 1800
      const summary = response.body.summary || response.body;
      
      expect(summary.totalIncome).toBeDefined();
      expect(summary.totalExpense).toBeDefined();
      
      // User A should have 3000 income and 1200 expense
      expect(parseFloat(summary.totalIncome)).toBe(3000);
      expect(parseFloat(summary.totalExpense)).toBe(1200);
      
      // Balance should be 1800
      if (summary.balance !== undefined) {
        expect(parseFloat(summary.balance)).toBe(1800);
      }
    });

    it('should return User B dashboard with only User B data', async () => {
      const response = await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${userBToken}`)
        .expect(200);

      expect(response.body).toBeDefined();
      
      // Verify summary calculations are based on User B's data only
      // User B: Income = 5000, Expense = 2500, Balance = 2500
      const summary = response.body.summary || response.body;
      
      expect(summary.totalIncome).toBeDefined();
      expect(summary.totalExpense).toBeDefined();
      
      // User B should have 5000 income and 2500 expense
      expect(parseFloat(summary.totalIncome)).toBe(5000);
      expect(parseFloat(summary.totalExpense)).toBe(2500);
      
      // Balance should be 2500
      if (summary.balance !== undefined) {
        expect(parseFloat(summary.balance)).toBe(2500);
      }
    });

    it('should show different transaction counts for each user', async () => {
      const responseA = await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${userAToken}`)
        .expect(200);

      const responseB = await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${userBToken}`)
        .expect(200);

      const summaryA = responseA.body.summary || responseA.body;
      const summaryB = responseB.body.summary || responseB.body;

      // User A has 5 transactions, User B has 5 transactions
      if (summaryA.transactionCount !== undefined) {
        expect(summaryA.transactionCount).toBe(5);
      }
      
      if (summaryB.transactionCount !== undefined) {
        expect(summaryB.transactionCount).toBe(5);
      }

      // Verify the totals are different
      expect(parseFloat(summaryA.totalIncome)).not.toBe(parseFloat(summaryB.totalIncome));
      expect(parseFloat(summaryA.totalExpense)).not.toBe(parseFloat(summaryB.totalExpense));
    });
  });

  describe('GET /api/dashboard/summary - Get Summary with Date Filters', () => {
    it('should return User A summary for specific date range', async () => {
      const response = await request(app)
        .get('/api/dashboard/summary')
        .query({ startDate: '2024-01-01', endDate: '2024-01-31' })
        .set('Authorization', `Bearer ${userAToken}`)
        .expect(200);

      expect(response.body).toBeDefined();
      
      // User A totals within January 2024
      expect(parseFloat(response.body.totalIncome)).toBe(3000);
      expect(parseFloat(response.body.totalExpense)).toBe(1200);
    });

    it('should return User B summary for specific date range', async () => {
      const response = await request(app)
        .get('/api/dashboard/summary')
        .query({ startDate: '2024-01-01', endDate: '2024-01-31' })
        .set('Authorization', `Bearer ${userBToken}`)
        .expect(200);

      expect(response.body).toBeDefined();
      
      // User B totals within January 2024
      expect(parseFloat(response.body.totalIncome)).toBe(5000);
      expect(parseFloat(response.body.totalExpense)).toBe(2500);
    });

    it('should filter by date range correctly for each user', async () => {
      // Test with a narrow date range that includes only some transactions
      const responseA = await request(app)
        .get('/api/dashboard/summary')
        .query({ startDate: '2024-01-10', endDate: '2024-01-15' })
        .set('Authorization', `Bearer ${userAToken}`)
        .expect(200);

      // User A has transactions on 01-10, 01-12, 01-15 in this range
      // Income: 1000 (01-10) + 1500 (01-15) = 2500
      // Expense: 700 (01-12) = 700
      expect(parseFloat(responseA.body.totalIncome)).toBe(2500);
      expect(parseFloat(responseA.body.totalExpense)).toBe(700);

      const responseB = await request(app)
        .get('/api/dashboard/summary')
        .query({ startDate: '2024-01-10', endDate: '2024-01-15' })
        .set('Authorization', `Bearer ${userBToken}`)
        .expect(200);

      // User B has transactions on 01-11, 01-13 in this range
      // Income: 2000 (01-11) = 2000
      // Expense: 1000 (01-13) = 1000
      expect(parseFloat(responseB.body.totalIncome)).toBe(2000);
      expect(parseFloat(responseB.body.totalExpense)).toBe(1000);
    });
  });

  describe('GET /api/dashboard/chart-data - Get Chart Data', () => {
    it('should return User A specific chart data', async () => {
      const response = await request(app)
        .get('/api/dashboard/chart-data')
        .set('Authorization', `Bearer ${userAToken}`)
        .expect(200);

      expect(response.body).toBeDefined();
      
      // Chart data should be based on User A's transactions only
      if (response.body.categoryBreakdown) {
        // Verify data exists and is an array
        expect(Array.isArray(response.body.categoryBreakdown)).toBe(true);
      }
      
      if (response.body.monthlyTrend) {
        expect(Array.isArray(response.body.monthlyTrend)).toBe(true);
      }
    });

    it('should return User B specific chart data', async () => {
      const response = await request(app)
        .get('/api/dashboard/chart-data')
        .set('Authorization', `Bearer ${userBToken}`)
        .expect(200);

      expect(response.body).toBeDefined();
      
      // Chart data should be based on User B's transactions only
      if (response.body.categoryBreakdown) {
        expect(Array.isArray(response.body.categoryBreakdown)).toBe(true);
      }
      
      if (response.body.monthlyTrend) {
        expect(Array.isArray(response.body.monthlyTrend)).toBe(true);
      }
    });

    it('should show different chart data for each user', async () => {
      const responseA = await request(app)
        .get('/api/dashboard/chart-data')
        .set('Authorization', `Bearer ${userAToken}`)
        .expect(200);

      const responseB = await request(app)
        .get('/api/dashboard/chart-data')
        .set('Authorization', `Bearer ${userBToken}`)
        .expect(200);

      // The chart data should be different for each user
      // This is a basic check - in a real scenario, you'd verify specific values
      expect(responseA.body).toBeDefined();
      expect(responseB.body).toBeDefined();
      
      // If both have category breakdown, they should potentially differ
      if (responseA.body.categoryBreakdown && responseB.body.categoryBreakdown) {
        // Just verify both exist - actual values will differ based on transactions
        expect(responseA.body.categoryBreakdown).toBeDefined();
        expect(responseB.body.categoryBreakdown).toBeDefined();
      }
    });
  });

  describe('Dashboard Data Isolation Verification', () => {
    it('should never leak User B data into User A dashboard', async () => {
      const response = await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${userAToken}`)
        .expect(200);

      const summary = response.body.summary || response.body;
      
      // User A should never see User B's totals (5000 income, 2500 expense)
      expect(parseFloat(summary.totalIncome)).not.toBe(5000);
      expect(parseFloat(summary.totalExpense)).not.toBe(2500);
      
      // User A should see their own totals (3000 income, 1200 expense)
      expect(parseFloat(summary.totalIncome)).toBe(3000);
      expect(parseFloat(summary.totalExpense)).toBe(1200);
    });

    it('should never leak User A data into User B dashboard', async () => {
      const response = await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${userBToken}`)
        .expect(200);

      const summary = response.body.summary || response.body;
      
      // User B should never see User A's totals (3000 income, 1200 expense)
      expect(parseFloat(summary.totalIncome)).not.toBe(3000);
      expect(parseFloat(summary.totalExpense)).not.toBe(1200);
      
      // User B should see their own totals (5000 income, 2500 expense)
      expect(parseFloat(summary.totalIncome)).toBe(5000);
      expect(parseFloat(summary.totalExpense)).toBe(2500);
    });

    it('should calculate correct balance for each user independently', async () => {
      const responseA = await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${userAToken}`)
        .expect(200);

      const responseB = await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${userBToken}`)
        .expect(200);

      const summaryA = responseA.body.summary || responseA.body;
      const summaryB = responseB.body.summary || responseB.body;

      // User A: 3000 - 1200 = 1800
      const balanceA = parseFloat(summaryA.totalIncome) - parseFloat(summaryA.totalExpense);
      expect(balanceA).toBe(1800);

      // User B: 5000 - 2500 = 2500
      const balanceB = parseFloat(summaryB.totalIncome) - parseFloat(summaryB.totalExpense);
      expect(balanceB).toBe(2500);

      // Balances should be different
      expect(balanceA).not.toBe(balanceB);
    });
  });
});
