import { TransactionRepository } from '../../repositories/transactionRepository';
import pool from '../../config/database';
import { CreateTransactionDTO, UpdateTransactionDTO } from '../../types/dtos';
import { NotFoundError, ForbiddenError } from '../../utils/errors';

// Mock the database pool
jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    query: jest.fn()
  }
}));

const mockQuery = pool.query as jest.MockedFunction<typeof pool.query>;

describe('TransactionRepository', () => {
  let repository: TransactionRepository;

  beforeEach(() => {
    repository = new TransactionRepository();
    jest.clearAllMocks();
  });

  describe('findByUserId', () => {
    it('should return only transactions for the specified user', async () => {
      const userId = 1;
      const mockTransactions = [
        {
          id: 1,
          userId: 1,
          trackingCycleId: null,
          date: new Date('2024-01-01'),
          transactionTypeId: 1,
          categoryId: 1,
          subCategoryId: null,
          paymentModeId: 1,
          accountId: 1,
          amount: '100.00',
          description: 'Test transaction',
          createdAt: new Date(),
          updatedAt: new Date(),
          'transactionType.id': 1,
          'transactionType.name': 'Income',
          'category.id': 1,
          'category.name': 'Salary',
          'subCategory.id': null,
          'subCategory.name': null,
          'paymentMode.id': 1,
          'paymentMode.name': 'Bank Transfer',
          'account.id': 1,
          'account.name': 'Main Account'
        }
      ];

      mockQuery.mockResolvedValueOnce({ rows: mockTransactions } as any);

      const result = await repository.findByUserId(userId);

      expect(mockQuery).toHaveBeenCalledTimes(1);
      const callArgs = mockQuery.mock.calls[0];
      expect(callArgs[0]).toContain('WHERE t.user_id = $1');
      expect(callArgs[1]).toContain(userId);
      expect(result).toHaveLength(1);
      expect(result[0].userId).toBe(userId);
    });

    it('should apply filters while maintaining user isolation', async () => {
      const userId = 2;
      const filters = {
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        categoryId: 5
      };

      mockQuery.mockResolvedValueOnce({ rows: [] } as any);

      await repository.findByUserId(userId, filters);

      const callArgs = mockQuery.mock.calls[0];
      expect(callArgs[0]).toContain('WHERE t.user_id = $1');
      expect(callArgs[1][0]).toBe(userId);
      expect(callArgs[1]).toContainEqual(expect.any(Date));
      expect(callArgs[1]).toContain(filters.categoryId);
    });
  });

  describe('create', () => {
    it('should include user_id when creating a transaction', async () => {
      const userId = 1;
      const createData: CreateTransactionDTO = {
        date: '2024-01-15',
        transactionTypeId: 1,
        categoryId: 2,
        subCategoryId: 3,
        paymentModeId: 1,
        accountId: 1,
        amount: 250.50,
        description: 'New transaction'
      };

      const mockCreatedTransaction = {
        id: 10,
        userId: userId,
        trackingCycleId: null,
        date: new Date('2024-01-15'),
        transactionTypeId: 1,
        categoryId: 2,
        subCategoryId: 3,
        paymentModeId: 1,
        accountId: 1,
        amount: '250.50',
        description: 'New transaction',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Mock INSERT
      mockQuery.mockResolvedValueOnce({ rows: [mockCreatedTransaction] } as any);
      
      // Mock SELECT for findById
      mockQuery.mockResolvedValueOnce({
        rows: [{
          ...mockCreatedTransaction,
          'transactionType.id': 1,
          'transactionType.name': 'Expense',
          'category.id': 2,
          'category.name': 'Food',
          'subCategory.id': 3,
          'subCategory.name': 'Groceries',
          'paymentMode.id': 1,
          'paymentMode.name': 'Cash',
          'account.id': 1,
          'account.name': 'Wallet'
        }]
      } as any);

      const result = await repository.create(userId, createData);

      const insertCall = mockQuery.mock.calls[0];
      expect(insertCall[0]).toContain('INSERT INTO transactions');
      expect(insertCall[1][0]).toBe(userId);
      expect(result.userId).toBe(userId);
    });
  });

  describe('update', () => {
    it('should verify ownership before updating', async () => {
      const userId = 1;
      const transactionId = 5;
      const updateData: UpdateTransactionDTO = {
        amount: 300.00,
        description: 'Updated transaction'
      };

      const mockExistingTransaction = {
        id: transactionId,
        userId: userId,
        trackingCycleId: null,
        date: new Date('2024-01-01'),
        transactionTypeId: 1,
        categoryId: 1,
        subCategoryId: null,
        paymentModeId: 1,
        accountId: 1,
        amount: '200.00',
        description: 'Original transaction',
        createdAt: new Date(),
        updatedAt: new Date(),
        'transactionType.id': 1,
        'transactionType.name': 'Income',
        'category.id': 1,
        'category.name': 'Salary',
        'paymentMode.id': 1,
        'paymentMode.name': 'Bank Transfer',
        'account.id': 1,
        'account.name': 'Main Account'
      };

      // Mock findById for ownership check
      mockQuery.mockResolvedValueOnce({ rows: [mockExistingTransaction] } as any);
      // Mock UPDATE
      mockQuery.mockResolvedValueOnce({ rows: [{ id: transactionId }], rowCount: 1 } as any);
      // Mock findById for final result
      mockQuery.mockResolvedValueOnce({
        rows: [{
          ...mockExistingTransaction,
          amount: '300.00',
          description: 'Updated transaction'
        }]
      } as any);

      const result = await repository.update(userId, transactionId, updateData);

      const updateCall = mockQuery.mock.calls[1];
      expect(updateCall[0]).toContain('WHERE id =');
      expect(updateCall[1]).toContain(transactionId);
      expect(updateCall[1]).toContain(userId);
      expect(result.amount).toBe(300.00);
    });

    it('should throw ForbiddenError when user does not own the transaction', async () => {
      const userId = 1;
      const transactionId = 5;
      const updateData: UpdateTransactionDTO = {
        amount: 300.00
      };

      // Mock findById with userId filter - returns null
      mockQuery.mockResolvedValueOnce({ rows: [] } as any);
      // Mock findById without userId filter - returns transaction owned by another user
      mockQuery.mockResolvedValueOnce({
        rows: [{
          id: transactionId,
          userId: 2,
          trackingCycleId: null,
          date: new Date('2024-01-01'),
          transactionTypeId: 1,
          categoryId: 1,
          subCategoryId: null,
          paymentModeId: 1,
          accountId: 1,
          amount: '200.00',
          description: 'Other user transaction',
          createdAt: new Date(),
          updatedAt: new Date()
        }]
      } as any);

      await expect(repository.update(userId, transactionId, updateData))
        .rejects
        .toThrow(ForbiddenError);
    });

    it('should throw NotFoundError when transaction does not exist', async () => {
      const userId = 1;
      const transactionId = 999;
      const updateData: UpdateTransactionDTO = {
        amount: 300.00
      };

      // Mock both findById calls returning null
      mockQuery.mockResolvedValueOnce({ rows: [] } as any);
      mockQuery.mockResolvedValueOnce({ rows: [] } as any);

      await expect(repository.update(userId, transactionId, updateData))
        .rejects
        .toThrow(NotFoundError);
    });
  });

  describe('delete', () => {
    it('should verify ownership when deleting', async () => {
      const userId = 1;
      const transactionId = 5;

      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 1 } as any);

      const result = await repository.delete(userId, transactionId);

      expect(mockQuery).toHaveBeenCalledWith(
        'DELETE FROM transactions WHERE id = $1 AND user_id = $2',
        [transactionId, userId]
      );
      expect(result).toBe(true);
    });

    it('should return false when transaction does not belong to user', async () => {
      const userId = 1;
      const transactionId = 5;

      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 } as any);

      const result = await repository.delete(userId, transactionId);

      expect(result).toBe(false);
    });
  });

  describe('findById', () => {
    it('should return transaction when userId is provided and matches', async () => {
      const userId = 1;
      const transactionId = 5;

      const mockTransaction = {
        id: transactionId,
        userId: userId,
        trackingCycleId: null,
        date: new Date('2024-01-01'),
        transactionTypeId: 1,
        categoryId: 1,
        subCategoryId: null,
        paymentModeId: 1,
        accountId: 1,
        amount: '100.00',
        description: 'Test',
        createdAt: new Date(),
        updatedAt: new Date(),
        'transactionType.id': 1,
        'transactionType.name': 'Income',
        'category.id': 1,
        'category.name': 'Salary',
        'paymentMode.id': 1,
        'paymentMode.name': 'Bank Transfer',
        'account.id': 1,
        'account.name': 'Main Account'
      };

      mockQuery.mockResolvedValueOnce({ rows: [mockTransaction] } as any);

      const result = await repository.findById(transactionId, userId);

      const callArgs = mockQuery.mock.calls[0];
      expect(callArgs[0]).toContain('WHERE t.id = $1');
      expect(callArgs[1]).toEqual([transactionId, userId]);
      expect(result).not.toBeNull();
      expect(result?.userId).toBe(userId);
    });

    it('should return null when transaction does not belong to user', async () => {
      const userId = 1;
      const transactionId = 5;

      mockQuery.mockResolvedValueOnce({ rows: [] } as any);

      const result = await repository.findById(transactionId, userId);

      expect(result).toBeNull();
    });
  });
});
