import request from 'supertest';
import app from '../../index';
import pool from '../../config/database';
import authService from '../../services/authService';

describe('Transaction Endpoints - User Isolation Integration Tests', () => {
  let userAToken: string;
  let userBToken: string;
  let userAId: number;
  let userBId: number;
  let userATransactionId: number;
  let userBTransactionId: number;
  let transactionTypeId: number;
  let categoryId: number;
  let accountId: number;
  let paymentModeId: number;

  beforeAll(async () => {
    // Create test users
    const userAEmail = `test-user-a-${Date.now()}@example.com`;
    const userBEmail = `test-user-b-${Date.now()}@example.com`;
    const password = 'TestPassword123!';
    const passwordHash = await authService.hashPassword(password);

    // Insert User A
    const userAResult = await pool.query(
      'INSERT INTO users (email, password_hash, username, role) VALUES ($1, $2, $3, $4) RETURNING id',
      [userAEmail, passwordHash, 'Test User A', 'user']
    );
    userAId = userAResult.rows[0].id;
    userAToken = authService.generateToken(userAId, 'user');

    // Insert User B
    const userBResult = await pool.query(
      'INSERT INTO users (email, password_hash, username, role) VALUES ($1, $2, $3, $4) RETURNING id',
      [userBEmail, passwordHash, 'Test User B', 'user']
    );
    userBId = userBResult.rows[0].id;
    userBToken = authService.generateToken(userBId, 'user');

    // Get configuration IDs for creating transactions
    const typeResult = await pool.query('SELECT id FROM transaction_types LIMIT 1');
    transactionTypeId = typeResult.rows[0].id;

    const categoryResult = await pool.query('SELECT id FROM categories LIMIT 1');
    categoryId = categoryResult.rows[0].id;

    const accountResult = await pool.query('SELECT id FROM accounts LIMIT 1');
    accountId = accountResult.rows[0].id;

    const paymentModeResult = await pool.query('SELECT id FROM payment_modes LIMIT 1');
    paymentModeId = paymentModeResult.rows[0].id;
  });

  afterAll(async () => {
    // Clean up test data
    await pool.query('DELETE FROM transactions WHERE user_id IN ($1, $2)', [userAId, userBId]);
    await pool.query('DELETE FROM users WHERE id IN ($1, $2)', [userAId, userBId]);
    await pool.end();
  });

  describe('POST /api/transactions - Create Transaction', () => {
    it('should create transaction for User A', async () => {
      const transactionData = {
        date: '2024-01-15',
        transactionTypeId,
        categoryId,
        accountId,
        paymentModeId,
        amount: 100.50,
        description: 'User A Transaction'
      };

      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${userAToken}`)
        .send(transactionData)
        .expect(201);

      expect(response.body.transaction).toBeDefined();
      expect(response.body.transaction.userId).toBe(userAId);
      expect(response.body.transaction.amount).toBe(100.50);
      expect(response.body.transaction.description).toBe('User A Transaction');

      userATransactionId = response.body.transaction.id;
    });

    it('should create transaction for User B', async () => {
      const transactionData = {
        date: '2024-01-16',
        transactionTypeId,
        categoryId,
        accountId,
        paymentModeId,
        amount: 200.75,
        description: 'User B Transaction'
      };

      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${userBToken}`)
        .send(transactionData)
        .expect(201);

      expect(response.body.transaction).toBeDefined();
      expect(response.body.transaction.userId).toBe(userBId);
      expect(response.body.transaction.amount).toBe(200.75);
      expect(response.body.transaction.description).toBe('User B Transaction');

      userBTransactionId = response.body.transaction.id;
    });
  });

  describe('GET /api/transactions - List Transactions', () => {
    it('should return only User A transactions for User A', async () => {
      const response = await request(app)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${userAToken}`)
        .expect(200);

      expect(response.body.transactions).toBeDefined();
      expect(Array.isArray(response.body.transactions)).toBe(true);

      // Verify all transactions belong to User A
      response.body.transactions.forEach((transaction: any) => {
        expect(transaction.userId).toBe(userAId);
      });

      // Verify User A's transaction is present
      const userATransaction = response.body.transactions.find(
        (t: any) => t.id === userATransactionId
      );
      expect(userATransaction).toBeDefined();
      expect(userATransaction.description).toBe('User A Transaction');

      // Verify User B's transaction is NOT present
      const userBTransaction = response.body.transactions.find(
        (t: any) => t.id === userBTransactionId
      );
      expect(userBTransaction).toBeUndefined();
    });

    it('should return only User B transactions for User B', async () => {
      const response = await request(app)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${userBToken}`)
        .expect(200);

      expect(response.body.transactions).toBeDefined();
      expect(Array.isArray(response.body.transactions)).toBe(true);

      // Verify all transactions belong to User B
      response.body.transactions.forEach((transaction: any) => {
        expect(transaction.userId).toBe(userBId);
      });

      // Verify User B's transaction is present
      const userBTransaction = response.body.transactions.find(
        (t: any) => t.id === userBTransactionId
      );
      expect(userBTransaction).toBeDefined();
      expect(userBTransaction.description).toBe('User B Transaction');

      // Verify User A's transaction is NOT present
      const userATransaction = response.body.transactions.find(
        (t: any) => t.id === userATransactionId
      );
      expect(userATransaction).toBeUndefined();
    });
  });

  describe('GET /api/transactions/:id - Get Single Transaction', () => {
    it('should allow User A to get their own transaction', async () => {
      const response = await request(app)
        .get(`/api/transactions/${userATransactionId}`)
        .set('Authorization', `Bearer ${userAToken}`)
        .expect(200);

      expect(response.body.transaction).toBeDefined();
      expect(response.body.transaction.id).toBe(userATransactionId);
      expect(response.body.transaction.userId).toBe(userAId);
    });

    it('should prevent User A from accessing User B transaction', async () => {
      const response = await request(app)
        .get(`/api/transactions/${userBTransactionId}`)
        .set('Authorization', `Bearer ${userAToken}`)
        .expect(404);

      expect(response.body.error).toBeDefined();
    });

    it('should prevent User B from accessing User A transaction', async () => {
      const response = await request(app)
        .get(`/api/transactions/${userATransactionId}`)
        .set('Authorization', `Bearer ${userBToken}`)
        .expect(404);

      expect(response.body.error).toBeDefined();
    });
  });

  describe('PUT /api/transactions/:id - Update Transaction', () => {
    it('should allow User A to update their own transaction', async () => {
      const updateData = {
        amount: 150.00,
        description: 'User A Updated Transaction'
      };

      const response = await request(app)
        .put(`/api/transactions/${userATransactionId}`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.transaction).toBeDefined();
      expect(response.body.transaction.id).toBe(userATransactionId);
      expect(response.body.transaction.amount).toBe(150.00);
      expect(response.body.transaction.description).toBe('User A Updated Transaction');
    });

    it('should prevent User A from updating User B transaction', async () => {
      const updateData = {
        amount: 999.99,
        description: 'Unauthorized Update Attempt'
      };

      const response = await request(app)
        .put(`/api/transactions/${userBTransactionId}`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body.error).toBeDefined();

      // Verify User B's transaction was not modified
      const verifyResponse = await request(app)
        .get(`/api/transactions/${userBTransactionId}`)
        .set('Authorization', `Bearer ${userBToken}`)
        .expect(200);

      expect(verifyResponse.body.transaction.amount).toBe(200.75);
      expect(verifyResponse.body.transaction.description).toBe('User B Transaction');
    });

    it('should prevent User B from updating User A transaction', async () => {
      const updateData = {
        amount: 888.88,
        description: 'Another Unauthorized Update'
      };

      const response = await request(app)
        .put(`/api/transactions/${userATransactionId}`)
        .set('Authorization', `Bearer ${userBToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body.error).toBeDefined();
    });
  });

  describe('DELETE /api/transactions/:id - Delete Transaction', () => {
    it('should prevent User A from deleting User B transaction', async () => {
      const response = await request(app)
        .delete(`/api/transactions/${userBTransactionId}`)
        .set('Authorization', `Bearer ${userAToken}`)
        .expect(404);

      expect(response.body.error).toBeDefined();

      // Verify User B's transaction still exists
      const verifyResponse = await request(app)
        .get(`/api/transactions/${userBTransactionId}`)
        .set('Authorization', `Bearer ${userBToken}`)
        .expect(200);

      expect(verifyResponse.body.transaction).toBeDefined();
    });

    it('should prevent User B from deleting User A transaction', async () => {
      const response = await request(app)
        .delete(`/api/transactions/${userATransactionId}`)
        .set('Authorization', `Bearer ${userBToken}`)
        .expect(404);

      expect(response.body.error).toBeDefined();

      // Verify User A's transaction still exists
      const verifyResponse = await request(app)
        .get(`/api/transactions/${userATransactionId}`)
        .set('Authorization', `Bearer ${userAToken}`)
        .expect(200);

      expect(verifyResponse.body.transaction).toBeDefined();
    });

    it('should allow User A to delete their own transaction', async () => {
      const response = await request(app)
        .delete(`/api/transactions/${userATransactionId}`)
        .set('Authorization', `Bearer ${userAToken}`)
        .expect(200);

      expect(response.body.message).toBeDefined();

      // Verify transaction is deleted
      await request(app)
        .get(`/api/transactions/${userATransactionId}`)
        .set('Authorization', `Bearer ${userAToken}`)
        .expect(404);
    });

    it('should allow User B to delete their own transaction', async () => {
      const response = await request(app)
        .delete(`/api/transactions/${userBTransactionId}`)
        .set('Authorization', `Bearer ${userBToken}`)
        .expect(200);

      expect(response.body.message).toBeDefined();

      // Verify transaction is deleted
      await request(app)
        .get(`/api/transactions/${userBTransactionId}`)
        .set('Authorization', `Bearer ${userBToken}`)
        .expect(404);
    });
  });
});
