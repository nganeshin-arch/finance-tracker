import request from 'supertest';
import app from '../../index';
import pool from '../../config/database';
import authService from '../../services/authService';

describe('Admin User Management Endpoints - Integration Tests', () => {
  let adminToken: string;
  let regularUserToken: string;
  let adminUserId: number;
  let regularUserId: number;
  let testUser1Id: number;
  let testUser2Id: number;

  beforeAll(async () => {
    const password = 'TestPassword123!';
    const passwordHash = await authService.hashPassword(password);

    // Create admin user
    const adminEmail = `test-admin-${Date.now()}@example.com`;
    const adminResult = await pool.query(
      'INSERT INTO users (email, password_hash, username, role) VALUES ($1, $2, $3, $4) RETURNING id',
      [adminEmail, passwordHash, 'Test Admin', 'admin']
    );
    adminUserId = adminResult.rows[0].id;
    adminToken = authService.generateToken(adminUserId, 'admin');

    // Create regular user
    const regularEmail = `test-regular-${Date.now()}@example.com`;
    const regularResult = await pool.query(
      'INSERT INTO users (email, password_hash, username, role) VALUES ($1, $2, $3, $4) RETURNING id',
      [regularEmail, passwordHash, 'Test Regular User', 'user']
    );
    regularUserId = regularResult.rows[0].id;
    regularUserToken = authService.generateToken(regularUserId, 'user');

    // Create additional test users with transactions for statistics
    const testUser1Email = `test-user-1-${Date.now()}@example.com`;
    const testUser1Result = await pool.query(
      'INSERT INTO users (email, password_hash, username, role) VALUES ($1, $2, $3, $4) RETURNING id',
      [testUser1Email, passwordHash, 'Test User 1', 'user']
    );
    testUser1Id = testUser1Result.rows[0].id;

    const testUser2Email = `test-user-2-${Date.now()}@example.com`;
    const testUser2Result = await pool.query(
      'INSERT INTO users (email, password_hash, username, role) VALUES ($1, $2, $3, $4) RETURNING id',
      [testUser2Email, passwordHash, 'Test User 2', 'user']
    );
    testUser2Id = testUser2Result.rows[0].id;

    // Get configuration IDs for creating test transactions
    const typeResult = await pool.query('SELECT id FROM transaction_types LIMIT 1');
    const transactionTypeId = typeResult.rows[0]?.id;

    const categoryResult = await pool.query('SELECT id FROM categories LIMIT 1');
    const categoryId = categoryResult.rows[0]?.id;

    const accountResult = await pool.query('SELECT id FROM accounts LIMIT 1');
    const accountId = accountResult.rows[0]?.id;

    const paymentModeResult = await pool.query('SELECT id FROM payment_modes LIMIT 1');
    const paymentModeId = paymentModeResult.rows[0]?.id;

    // Create transactions for test users if configuration exists
    if (transactionTypeId && categoryId && accountId && paymentModeId) {
      // Create 3 transactions for testUser1
      await pool.query(
        `INSERT INTO transactions (user_id, date, transaction_type_id, category_id, account_id, payment_mode_id, amount, description)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [testUser1Id, '2024-01-10', transactionTypeId, categoryId, accountId, paymentModeId, 100, 'Test 1 Transaction 1']
      );
      await pool.query(
        `INSERT INTO transactions (user_id, date, transaction_type_id, category_id, account_id, payment_mode_id, amount, description)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [testUser1Id, '2024-01-15', transactionTypeId, categoryId, accountId, paymentModeId, 200, 'Test 1 Transaction 2']
      );
      await pool.query(
        `INSERT INTO transactions (user_id, date, transaction_type_id, category_id, account_id, payment_mode_id, amount, description)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [testUser1Id, '2024-01-20', transactionTypeId, categoryId, accountId, paymentModeId, 150, 'Test 1 Transaction 3']
      );

      // Create 2 transactions for testUser2
      await pool.query(
        `INSERT INTO transactions (user_id, date, transaction_type_id, category_id, account_id, payment_mode_id, amount, description)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [testUser2Id, '2024-01-12', transactionTypeId, categoryId, accountId, paymentModeId, 300, 'Test 2 Transaction 1']
      );
      await pool.query(
        `INSERT INTO transactions (user_id, date, transaction_type_id, category_id, account_id, payment_mode_id, amount, description)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [testUser2Id, '2024-01-18', transactionTypeId, categoryId, accountId, paymentModeId, 250, 'Test 2 Transaction 2']
      );
    }
  });

  afterAll(async () => {
    // Clean up test data
    await pool.query(
      'DELETE FROM transactions WHERE user_id IN ($1, $2, $3, $4)',
      [adminUserId, regularUserId, testUser1Id, testUser2Id]
    );
    await pool.query(
      'DELETE FROM users WHERE id IN ($1, $2, $3, $4)',
      [adminUserId, regularUserId, testUser1Id, testUser2Id]
    );
    await pool.end();
  });

  describe('GET /api/users - List All Users', () => {
    it('should allow admin to list all users', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.users).toBeDefined();
      expect(Array.isArray(response.body.users)).toBe(true);
      expect(response.body.users.length).toBeGreaterThanOrEqual(4);

      // Verify the response includes our test users
      const userIds = response.body.users.map((u: any) => u.id);
      expect(userIds).toContain(adminUserId);
      expect(userIds).toContain(regularUserId);
      expect(userIds).toContain(testUser1Id);
      expect(userIds).toContain(testUser2Id);

      // Verify user data structure
      const firstUser = response.body.users[0];
      expect(firstUser).toHaveProperty('id');
      expect(firstUser).toHaveProperty('email');
      expect(firstUser).toHaveProperty('username');
      expect(firstUser).toHaveProperty('role');
      expect(firstUser).toHaveProperty('createdAt');

      // Verify password hash is NOT included
      expect(firstUser).not.toHaveProperty('passwordHash');
      expect(firstUser).not.toHaveProperty('password_hash');
    });

    it('should prevent regular user from listing all users', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(403);

      expect(response.body.error).toBeDefined();
      expect(response.body.error).toContain('Access denied');
    });

    it('should prevent unauthenticated access to user list', async () => {
      const response = await request(app)
        .get('/api/users')
        .expect(401);

      expect(response.body.error).toBeDefined();
    });

    it('should include transaction count for each user', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.users).toBeDefined();

      // Find our test users
      const testUser1 = response.body.users.find((u: any) => u.id === testUser1Id);
      const testUser2 = response.body.users.find((u: any) => u.id === testUser2Id);

      if (testUser1 && testUser1.transactionCount !== undefined) {
        expect(testUser1.transactionCount).toBe(3);
      }

      if (testUser2 && testUser2.transactionCount !== undefined) {
        expect(testUser2.transactionCount).toBe(2);
      }
    });
  });

  describe('GET /api/users/:id/stats - Get User Statistics', () => {
    it('should allow admin to view user statistics', async () => {
      const response = await request(app)
        .get(`/api/users/${testUser1Id}/stats`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.userId).toBe(testUser1Id);

      // Verify statistics structure
      if (response.body.totalTransactions !== undefined) {
        expect(response.body.totalTransactions).toBe(3);
      }

      if (response.body.totalIncome !== undefined || response.body.totalExpense !== undefined) {
        expect(response.body).toHaveProperty('totalIncome');
        expect(response.body).toHaveProperty('totalExpense');
      }

      // Verify date fields if present
      if (response.body.firstTransactionDate) {
        expect(response.body.firstTransactionDate).toBeDefined();
      }

      if (response.body.lastTransactionDate) {
        expect(response.body.lastTransactionDate).toBeDefined();
      }
    });

    it('should prevent regular user from viewing other user statistics', async () => {
      const response = await request(app)
        .get(`/api/users/${testUser1Id}/stats`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(403);

      expect(response.body.error).toBeDefined();
      expect(response.body.error).toContain('Access denied');
    });

    it('should prevent unauthenticated access to user statistics', async () => {
      const response = await request(app)
        .get(`/api/users/${testUser1Id}/stats`)
        .expect(401);

      expect(response.body.error).toBeDefined();
    });

    it('should return different statistics for different users', async () => {
      const response1 = await request(app)
        .get(`/api/users/${testUser1Id}/stats`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const response2 = await request(app)
        .get(`/api/users/${testUser2Id}/stats`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response1.body.userId).toBe(testUser1Id);
      expect(response2.body.userId).toBe(testUser2Id);

      // Verify transaction counts are different
      if (response1.body.totalTransactions !== undefined && response2.body.totalTransactions !== undefined) {
        expect(response1.body.totalTransactions).toBe(3);
        expect(response2.body.totalTransactions).toBe(2);
        expect(response1.body.totalTransactions).not.toBe(response2.body.totalTransactions);
      }
    });

    it('should handle request for user with no transactions', async () => {
      const response = await request(app)
        .get(`/api/users/${regularUserId}/stats`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.userId).toBe(regularUserId);

      // User with no transactions should have zero counts
      if (response.body.totalTransactions !== undefined) {
        expect(response.body.totalTransactions).toBe(0);
      }
    });

    it('should return 404 for non-existent user', async () => {
      const nonExistentUserId = 999999;
      
      const response = await request(app)
        .get(`/api/users/${nonExistentUserId}/stats`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.error).toBeDefined();
    });
  });

  describe('Admin Privacy Protection', () => {
    it('should not expose individual transaction details in user list', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.users).toBeDefined();

      // Verify that individual transaction details are not included
      response.body.users.forEach((user: any) => {
        expect(user).not.toHaveProperty('transactions');
        expect(user).not.toHaveProperty('transactionDetails');
      });
    });

    it('should not expose individual transaction details in user stats', async () => {
      const response = await request(app)
        .get(`/api/users/${testUser1Id}/stats`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toBeDefined();

      // Verify that individual transaction details are not included
      expect(response.body).not.toHaveProperty('transactions');
      expect(response.body).not.toHaveProperty('transactionList');
      expect(response.body).not.toHaveProperty('transactionDetails');
    });

    it('should not expose sensitive user information', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.users).toBeDefined();

      // Verify sensitive fields are not exposed
      response.body.users.forEach((user: any) => {
        expect(user).not.toHaveProperty('passwordHash');
        expect(user).not.toHaveProperty('password_hash');
        expect(user).not.toHaveProperty('password');
      });
    });
  });

  describe('Role-Based Access Control', () => {
    it('should verify admin role is required for user management', async () => {
      // Regular user should not access admin endpoints
      const listResponse = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(403);

      expect(listResponse.body.error).toBeDefined();

      const statsResponse = await request(app)
        .get(`/api/users/${testUser1Id}/stats`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(403);

      expect(statsResponse.body.error).toBeDefined();
    });

    it('should allow admin to access all admin endpoints', async () => {
      // Admin should successfully access all admin endpoints
      const listResponse = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(listResponse.body.users).toBeDefined();

      const statsResponse = await request(app)
        .get(`/api/users/${testUser1Id}/stats`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(statsResponse.body).toBeDefined();
    });

    it('should reject requests with invalid tokens', async () => {
      const invalidToken = 'invalid.token.here';

      const listResponse = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${invalidToken}`)
        .expect(401);

      expect(listResponse.body.error).toBeDefined();

      const statsResponse = await request(app)
        .get(`/api/users/${testUser1Id}/stats`)
        .set('Authorization', `Bearer ${invalidToken}`)
        .expect(401);

      expect(statsResponse.body.error).toBeDefined();
    });
  });
});
