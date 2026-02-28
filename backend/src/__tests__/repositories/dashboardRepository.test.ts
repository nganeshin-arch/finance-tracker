import { DashboardRepository } from '../../repositories/dashboardRepository';
import pool from '../../config/database';

// Mock the database pool
jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    query: jest.fn()
  }
}));

const mockQuery = pool.query as jest.MockedFunction<typeof pool.query>;

describe('DashboardRepository', () => {
  let repository: DashboardRepository;

  beforeEach(() => {
    repository = new DashboardRepository();
    jest.clearAllMocks();
  });

  describe('getSummary', () => {
    it('should filter by user_id when getting summary', async () => {
      const userId = 1;
      const startDate = '2024-01-01';
      const endDate = '2024-12-31';

      const mockSummary = {
        total_income: '5000.00',
        total_expense: '3000.00',
        transaction_count: '25'
      };

      mockQuery.mockResolvedValueOnce({ rows: [mockSummary] } as any);

      const result = await repository.getSummary(userId, startDate, endDate);

      expect(mockQuery).toHaveBeenCalledTimes(1);
      const callArgs = mockQuery.mock.calls[0];
      expect(callArgs[0]).toContain('WHERE t.user_id = $1');
      expect(callArgs[1][0]).toBe(userId);
      expect(callArgs[1]).toContainEqual(expect.any(Date));
      expect(result.totalIncome).toBe(5000.00);
      expect(result.totalExpense).toBe(3000.00);
      expect(result.transactionCount).toBe(25);
    });

    it('should filter by user_id without date range', async () => {
      const userId = 2;

      const mockSummary = {
        total_income: '10000.00',
        total_expense: '7500.00',
        transaction_count: '50'
      };

      mockQuery.mockResolvedValueOnce({ rows: [mockSummary] } as any);

      const result = await repository.getSummary(userId);

      const callArgs = mockQuery.mock.calls[0];
      expect(callArgs[0]).toContain('WHERE t.user_id = $1');
      expect(callArgs[1]).toEqual([userId]);
      expect(result.totalIncome).toBe(10000.00);
    });

    it('should return zero values when user has no transactions', async () => {
      const userId = 3;

      const mockSummary = {
        total_income: null,
        total_expense: null,
        transaction_count: '0'
      };

      mockQuery.mockResolvedValueOnce({ rows: [mockSummary] } as any);

      const result = await repository.getSummary(userId);

      expect(result.totalIncome).toBe(0);
      expect(result.totalExpense).toBe(0);
      expect(result.transactionCount).toBe(0);
    });
  });

  describe('getCategoryBreakdown', () => {
    it('should filter by user_id when getting category breakdown', async () => {
      const userId = 1;
      const type = 'Expense';

      const mockBreakdown = [
        { categoryId: 1, categoryName: 'Food', amount: '500.00' },
        { categoryId: 2, categoryName: 'Transport', amount: '300.00' },
        { categoryId: 3, categoryName: 'Entertainment', amount: '200.00' }
      ];

      mockQuery.mockResolvedValueOnce({ rows: mockBreakdown } as any);

      const result = await repository.getCategoryBreakdown(userId, type);

      expect(mockQuery).toHaveBeenCalledTimes(1);
      const callArgs = mockQuery.mock.calls[0];
      expect(callArgs[0]).toContain('WHERE t.user_id = $1 AND tt.name = $2');
      expect(callArgs[1][0]).toBe(userId);
      expect(callArgs[1][1]).toBe(type);
      expect(Array.isArray(result)).toBe(true);
      expect((result as any[]).length).toBe(3);
    });

    it('should filter by user_id with date range', async () => {
      const userId = 2;
      const type = 'Income';
      const startDate = '2024-01-01';
      const endDate = '2024-06-30';

      const mockBreakdown = [
        { categoryId: 4, categoryName: 'Salary', amount: '5000.00' }
      ];

      mockQuery.mockResolvedValueOnce({ rows: mockBreakdown } as any);

      const result = await repository.getCategoryBreakdown(userId, type, startDate, endDate);

      const callArgs = mockQuery.mock.calls[0];
      expect(callArgs[0]).toContain('WHERE t.user_id = $1 AND tt.name = $2');
      expect(callArgs[1][0]).toBe(userId);
      expect(callArgs[1][1]).toBe(type);
      expect(callArgs[1]).toContainEqual(expect.any(Date));
    });

    it('should support pagination while maintaining user filter', async () => {
      const userId = 1;
      const type = 'Expense';
      const pagination = { page: 1, limit: 5 };

      const mockBreakdown = [
        { categoryId: 1, categoryName: 'Food', amount: '500.00' }
      ];

      // Mock count query
      mockQuery.mockResolvedValueOnce({ rows: [{ total: '10' }] } as any);
      // Mock data query
      mockQuery.mockResolvedValueOnce({ rows: mockBreakdown } as any);

      const result = await repository.getCategoryBreakdown(userId, type, undefined, undefined, pagination);

      expect(mockQuery).toHaveBeenCalledTimes(2);
      // Verify both queries include user_id filter
      const countCall = mockQuery.mock.calls[0];
      const dataCall = mockQuery.mock.calls[1];
      expect(countCall[0]).toContain('WHERE t.user_id = $1 AND tt.name = $2');
      expect(dataCall[0]).toContain('WHERE t.user_id = $1 AND tt.name = $2');
    });
  });

  describe('getMonthlyTrend', () => {
    it('should filter by user_id when getting monthly trend', async () => {
      const userId = 1;
      const months = 6;

      const mockTrend = [
        { month: '2024-01', income: '5000.00', expenses: '3000.00' },
        { month: '2024-02', income: '5500.00', expenses: '3200.00' },
        { month: '2024-03', income: '5200.00', expenses: '2900.00' }
      ];

      mockQuery.mockResolvedValueOnce({ rows: mockTrend } as any);

      const result = await repository.getMonthlyTrend(userId, months);

      expect(mockQuery).toHaveBeenCalledTimes(1);
      const callArgs = mockQuery.mock.calls[0];
      expect(callArgs[0]).toContain('WHERE t.user_id = $1');
      expect(callArgs[1]).toEqual([userId, months]);
      expect(result).toHaveLength(3);
      expect(result[0].month).toBe('2024-01');
      expect(result[0].income).toBe(5000.00);
      expect(result[0].expenses).toBe(3000.00);
    });

    it('should use default months parameter while filtering by user_id', async () => {
      const userId = 2;

      const mockTrend = [
        { month: '2024-06', income: '6000.00', expenses: '4000.00' }
      ];

      mockQuery.mockResolvedValueOnce({ rows: mockTrend } as any);

      const result = await repository.getMonthlyTrend(userId);

      const callArgs = mockQuery.mock.calls[0];
      expect(callArgs[0]).toContain('WHERE t.user_id = $1');
      expect(callArgs[1]).toEqual([userId, 6]); // Default months = 6
    });

    it('should return empty array when user has no transactions', async () => {
      const userId = 3;

      mockQuery.mockResolvedValueOnce({ rows: [] } as any);

      const result = await repository.getMonthlyTrend(userId);

      expect(result).toEqual([]);
    });
  });

  describe('User Isolation Verification', () => {
    it('should ensure all queries include user_id in WHERE clause', async () => {
      const userId = 1;

      // Test getSummary
      mockQuery.mockResolvedValueOnce({
        rows: [{ total_income: '0', total_expense: '0', transaction_count: '0' }]
      } as any);
      await repository.getSummary(userId);
      let callArgs = mockQuery.mock.calls[mockQuery.mock.calls.length - 1];
      expect(callArgs[0]).toContain('t.user_id = $1');

      // Test getCategoryBreakdown
      mockQuery.mockResolvedValueOnce({ rows: [] } as any);
      await repository.getCategoryBreakdown(userId, 'Expense');
      callArgs = mockQuery.mock.calls[mockQuery.mock.calls.length - 1];
      expect(callArgs[0]).toContain('t.user_id = $1');

      // Test getMonthlyTrend
      mockQuery.mockResolvedValueOnce({ rows: [] } as any);
      await repository.getMonthlyTrend(userId);
      callArgs = mockQuery.mock.calls[mockQuery.mock.calls.length - 1];
      expect(callArgs[0]).toContain('t.user_id = $1');
    });

    it('should never query transactions without user_id filter', async () => {
      const userId = 1;

      mockQuery.mockResolvedValueOnce({
        rows: [{ total_income: '0', total_expense: '0', transaction_count: '0' }]
      } as any);

      await repository.getSummary(userId);

      const callArgs = mockQuery.mock.calls[0];
      const query = callArgs[0] as string;
      const params = callArgs[1] as any[];

      // Verify query contains user_id filter
      expect(query).toContain('user_id');
      expect(query).toContain('$1');
      // Verify userId is the first parameter
      expect(params[0]).toBe(userId);
    });
  });
});
