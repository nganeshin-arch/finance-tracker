import pool from '../config/database';
import { ExpenseByCategory, MonthlyTrend } from '../types/dtos';

/**
 * Interface for pagination options
 */
export interface PaginationOptions {
  page?: number;
  limit?: number;
}

/**
 * Interface for paginated results
 */
export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Repository for dashboard analytics data access
 * All queries are optimized to use indexed columns (user_id, date)
 */
export class DashboardRepository {
  /**
   * Enable query performance analysis for debugging
   * Set to true to log EXPLAIN ANALYZE results
   */
  private enableQueryAnalysis = process.env.ENABLE_QUERY_ANALYSIS === 'true';

  /**
   * Execute a query with optional EXPLAIN ANALYZE for performance monitoring
   */
  private async executeQuery<T = any>(query: string, params: any[], queryName: string): Promise<T> {
    if (this.enableQueryAnalysis) {
      const explainQuery = `EXPLAIN ANALYZE ${query}`;
      const explainResult = await pool.query(explainQuery, params);
      console.log(`\n=== Query Analysis: ${queryName} ===`);
      explainResult.rows.forEach((row: any) => console.log(row['QUERY PLAN']));
      console.log('=== End Analysis ===\n');
    }

    const result = await pool.query(query, params);
    return result as T;
  }

  /**
   * Get summary statistics for a specific user and period
   * Optimized: Uses indexed user_id column in WHERE clause
   */
  async getSummary(userId: number, startDate?: string, endDate?: string): Promise<{
    totalIncome: number;
    totalExpense: number;
    transactionCount: number;
  }> {
    const params: any[] = [userId];
    let paramCount = 2;

    // Query optimized to use user_id index first, then date range if provided
    let query = `
      SELECT 
        SUM(CASE WHEN tt.name = 'Income' THEN t.amount ELSE 0 END) as total_income,
        SUM(CASE WHEN tt.name = 'Expense' THEN t.amount ELSE 0 END) as total_expense,
        COUNT(*) as transaction_count
      FROM transactions t
      INNER JOIN transaction_types tt ON t.transaction_type_id = tt.id
      WHERE t.user_id = $1
    `;

    if (startDate && endDate) {
      query += ` AND t.date >= $${paramCount++} AND t.date <= $${paramCount++}`;
      params.push(new Date(startDate), new Date(endDate));
    }

    const result = await this.executeQuery(query, params, 'getSummary');
    return {
      totalIncome: parseFloat(result.rows[0].total_income) || 0,
      totalExpense: parseFloat(result.rows[0].total_expense) || 0,
      transactionCount: parseInt(result.rows[0].transaction_count) || 0
    };
  }

  /**
   * Get category breakdown for a specific user and transaction type
   * Optimized: Uses indexed user_id column, supports pagination
   */
  async getCategoryBreakdown(
    userId: number, 
    type: 'Income' | 'Expense', 
    startDate?: string, 
    endDate?: string,
    pagination?: PaginationOptions
  ): Promise<ExpenseByCategory[] | PaginatedResult<ExpenseByCategory>> {
    const params: any[] = [userId, type];
    let paramCount = 3;

    // Query optimized to use user_id index first
    let query = `
      SELECT 
        c.id as "categoryId",
        c.name as "categoryName",
        COALESCE(SUM(t.amount), 0) as amount
      FROM transactions t
      INNER JOIN transaction_types tt ON t.transaction_type_id = tt.id
      INNER JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = $1 AND tt.name = $2
    `;

    if (startDate && endDate) {
      query += ` AND t.date >= $${paramCount++} AND t.date <= $${paramCount++}`;
      params.push(new Date(startDate), new Date(endDate));
    }

    query += `
      GROUP BY c.id, c.name
      HAVING SUM(t.amount) > 0
      ORDER BY amount DESC
    `;

    // Add pagination if requested
    if (pagination) {
      const page = pagination.page || 1;
      const limit = pagination.limit || 10;
      const offset = (page - 1) * limit;

      // Get total count first
      const countQuery = `
        SELECT COUNT(DISTINCT c.id) as total
        FROM transactions t
        INNER JOIN transaction_types tt ON t.transaction_type_id = tt.id
        INNER JOIN categories c ON t.category_id = c.id
        WHERE t.user_id = $1 AND tt.name = $2
        ${startDate && endDate ? `AND t.date >= $3 AND t.date <= $4` : ''}
      `;
      const countResult = await this.executeQuery(countQuery, params.slice(0, paramCount - 1), 'getCategoryBreakdown_count');
      const total = parseInt(countResult.rows[0].total) || 0;

      query += ` LIMIT $${paramCount++} OFFSET $${paramCount++}`;
      params.push(limit, offset);

      const result = await this.executeQuery(query, params, 'getCategoryBreakdown_paginated');
      
      return {
        data: result.rows.map((row: any) => ({
          categoryId: row.categoryId,
          categoryName: row.categoryName,
          amount: parseFloat(row.amount),
          percentage: 0 // Will be calculated in service layer
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    }

    const result = await this.executeQuery(query, params, 'getCategoryBreakdown');
    
    return result.rows.map((row: any) => ({
      categoryId: row.categoryId,
      categoryName: row.categoryName,
      amount: parseFloat(row.amount),
      percentage: 0 // Will be calculated in service layer
    }));
  }

  /**
   * Get total income for a specific period or tracking cycle
   */
  async getTotalIncome(trackingCycleId?: number, startDate?: string, endDate?: string): Promise<number> {
    let query = `
      SELECT COALESCE(SUM(t.amount), 0) as total
      FROM transactions t
      INNER JOIN transaction_types tt ON t.transaction_type_id = tt.id
      WHERE tt.name = 'Income'
    `;

    const params: any[] = [];
    let paramCount = 1;

    if (trackingCycleId) {
      query += ` AND t.tracking_cycle_id = $${paramCount++}`;
      params.push(trackingCycleId);
    } else if (startDate && endDate) {
      query += ` AND t.date >= $${paramCount++} AND t.date <= $${paramCount++}`;
      params.push(new Date(startDate), new Date(endDate));
    }

    const result = await this.executeQuery(query, params, 'getTotalIncome');
    return parseFloat(result.rows[0].total);
  }

  /**
   * Get total expenses for a specific period or tracking cycle
   */
  async getTotalExpenses(trackingCycleId?: number, startDate?: string, endDate?: string): Promise<number> {
    let query = `
      SELECT COALESCE(SUM(t.amount), 0) as total
      FROM transactions t
      INNER JOIN transaction_types tt ON t.transaction_type_id = tt.id
      WHERE tt.name = 'Expense'
    `;

    const params: any[] = [];
    let paramCount = 1;

    if (trackingCycleId) {
      query += ` AND t.tracking_cycle_id = $${paramCount++}`;
      params.push(trackingCycleId);
    } else if (startDate && endDate) {
      query += ` AND t.date >= $${paramCount++} AND t.date <= $${paramCount++}`;
      params.push(new Date(startDate), new Date(endDate));
    }

    const result = await this.executeQuery(query, params, 'getTotalExpenses');
    return parseFloat(result.rows[0].total);
  }

  /**
   * Get expenses grouped by category for a specific period or tracking cycle
   * Optimized: Supports pagination for large result sets
   */
  async getExpensesByCategory(
    trackingCycleId?: number, 
    startDate?: string, 
    endDate?: string,
    pagination?: PaginationOptions
  ): Promise<ExpenseByCategory[] | PaginatedResult<ExpenseByCategory>> {
    let query = `
      SELECT 
        c.id as "categoryId",
        c.name as "categoryName",
        COALESCE(SUM(t.amount), 0) as amount
      FROM categories c
      INNER JOIN transaction_types tt ON c.transaction_type_id = tt.id
      LEFT JOIN transactions t ON t.category_id = c.id
    `;

    const params: any[] = [];
    let paramCount = 1;

    // Add WHERE clause for expense type
    query += ` WHERE tt.name = 'Expense'`;

    // Add tracking cycle or date range filter
    if (trackingCycleId) {
      query += ` AND (t.tracking_cycle_id = $${paramCount++} OR t.id IS NULL)`;
      params.push(trackingCycleId);
    } else if (startDate && endDate) {
      query += ` AND (t.date >= $${paramCount++} AND t.date <= $${paramCount++} OR t.id IS NULL)`;
      params.push(new Date(startDate), new Date(endDate));
    }

    query += `
      GROUP BY c.id, c.name
      HAVING SUM(t.amount) > 0
      ORDER BY amount DESC
    `;

    // Add pagination if requested
    if (pagination) {
      const page = pagination.page || 1;
      const limit = pagination.limit || 10;
      const offset = (page - 1) * limit;

      // Get total count first
      const countQuery = `
        SELECT COUNT(DISTINCT c.id) as total
        FROM categories c
        INNER JOIN transaction_types tt ON c.transaction_type_id = tt.id
        LEFT JOIN transactions t ON t.category_id = c.id
        WHERE tt.name = 'Expense'
        ${trackingCycleId ? `AND (t.tracking_cycle_id = $1 OR t.id IS NULL)` : ''}
        ${startDate && endDate ? `AND (t.date >= $1 AND t.date <= $2 OR t.id IS NULL)` : ''}
      `;
      const countResult = await this.executeQuery(countQuery, params, 'getExpensesByCategory_count');
      const total = parseInt(countResult.rows[0].total) || 0;

      query += ` LIMIT $${paramCount++} OFFSET $${paramCount++}`;
      params.push(limit, offset);

      const result = await this.executeQuery(query, params, 'getExpensesByCategory_paginated');
      
      return {
        data: result.rows.map((row: any) => ({
          categoryId: row.categoryId,
          categoryName: row.categoryName,
          amount: parseFloat(row.amount),
          percentage: 0 // Will be calculated in service layer
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    }

    const result = await this.executeQuery(query, params, 'getExpensesByCategory');
    
    // Return raw data without percentage calculation (will be done in service layer)
    return result.rows.map((row: any) => ({
      categoryId: row.categoryId,
      categoryName: row.categoryName,
      amount: parseFloat(row.amount),
      percentage: 0 // Will be calculated in service layer
    }));
  }

  /**
   * Get monthly trend data showing income and expenses over time
   * Optimized: Uses indexed user_id and date columns, parameterized months
   */
  async getMonthlyTrend(userId: number, months: number = 6): Promise<MonthlyTrend[]> {
    // Parameterize the months value to prevent SQL injection
    const query = `
      WITH monthly_data AS (
        SELECT 
          TO_CHAR(t.date, 'YYYY-MM') as month,
          tt.name as transaction_type,
          COALESCE(SUM(t.amount), 0) as total
        FROM transactions t
        INNER JOIN transaction_types tt ON t.transaction_type_id = tt.id
        WHERE t.user_id = $1 AND t.date >= CURRENT_DATE - ($2 || ' months')::INTERVAL
        GROUP BY TO_CHAR(t.date, 'YYYY-MM'), tt.name
      )
      SELECT 
        month,
        COALESCE(MAX(CASE WHEN transaction_type = 'Income' THEN total END), 0) as income,
        COALESCE(MAX(CASE WHEN transaction_type = 'Expense' THEN total END), 0) as expenses
      FROM monthly_data
      GROUP BY month
      ORDER BY month ASC
    `;

    const result = await this.executeQuery(query, [userId, months], 'getMonthlyTrend');
    
    return result.rows.map((row: any) => ({
      month: row.month,
      income: parseFloat(row.income),
      expenses: parseFloat(row.expenses)
    }));
  }
}

export default new DashboardRepository();
