import pool from '../config/database';
import { User, UserPreferences } from '../types/models';

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
 * Interface for user summary with transaction statistics
 */
export interface UserSummary {
  id: number;
  username: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: Date;
  transactionCount: number;
  lastTransactionDate: Date | null;
}

/**
 * Interface for detailed user statistics
 */
export interface UserStats {
  userId: number;
  totalTransactions: number;
  totalIncome: number;
  totalExpense: number;
  firstTransactionDate: Date | null;
  lastTransactionDate: Date | null;
}

/**
 * Repository for user management data access (admin only)
 * Supports pagination for large result sets (Requirement 10.3)
 */
export class UserRepository {
  /**
   * Get all users with transaction counts and last transaction date
   * Ordered by registration date (newest first)
   * Supports pagination for large user lists
   * Requirements: 8.1, 8.2, 10.3
   */
  async findAll(pagination?: PaginationOptions): Promise<UserSummary[] | PaginatedResult<UserSummary>> {
    const query = `
      SELECT 
        u.id,
        u.username,
        u.email,
        u.role,
        u.created_at as "createdAt",
        COUNT(t.id) as "transactionCount",
        MAX(t.date) as "lastTransactionDate"
      FROM users u
      LEFT JOIN transactions t ON u.id = t.user_id
      GROUP BY u.id, u.username, u.email, u.role, u.created_at
      ORDER BY u.created_at DESC
    `;

    // Handle pagination if requested
    if (pagination) {
      const page = pagination.page || 1;
      const limit = pagination.limit || 20;
      const offset = (page - 1) * limit;

      // Get total count first
      const countQuery = `SELECT COUNT(*) as total FROM users`;
      const countResult = await pool.query(countQuery);
      const total = parseInt(countResult.rows[0].total) || 0;

      // Add pagination to main query
      const paginatedQuery = query + ` LIMIT $1 OFFSET $2`;
      const result = await pool.query(paginatedQuery, [limit, offset]);
      
      const users = result.rows.map((row: any) => ({
        id: row.id,
        username: row.username,
        email: row.email,
        role: row.role,
        createdAt: row.createdAt,
        transactionCount: parseInt(row.transactionCount) || 0,
        lastTransactionDate: row.lastTransactionDate
      }));

      return {
        data: users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    }

    // No pagination - return all results
    const result = await pool.query(query);
    
    return result.rows.map((row: any) => ({
      id: row.id,
      username: row.username,
      email: row.email,
      role: row.role,
      createdAt: row.createdAt,
      transactionCount: parseInt(row.transactionCount) || 0,
      lastTransactionDate: row.lastTransactionDate
    }));
  }

  /**
   * Get user by ID
   * Requirements: 8.1, 8.3
   */
  async findById(id: number): Promise<User | null> {
    const query = `
      SELECT 
        id,
        username,
        email,
        role,
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM users
      WHERE id = $1
    `;

    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  }

  /**
   * Get detailed statistics for a specific user
   * Calculates total transactions, income, expense, and date range
   * Requirements: 8.3
   */
  async getUserStats(userId: number): Promise<UserStats> {
    const query = `
      SELECT 
        u.id as "userId",
        COUNT(t.id) as "totalTransactions",
        COALESCE(SUM(CASE WHEN tt.name = 'Income' THEN t.amount ELSE 0 END), 0) as "totalIncome",
        COALESCE(SUM(CASE WHEN tt.name = 'Expense' THEN t.amount ELSE 0 END), 0) as "totalExpense",
        MIN(t.date) as "firstTransactionDate",
        MAX(t.date) as "lastTransactionDate"
      FROM users u
      LEFT JOIN transactions t ON u.id = t.user_id
      LEFT JOIN transaction_types tt ON t.transaction_type_id = tt.id
      WHERE u.id = $1
      GROUP BY u.id
    `;

    const result = await pool.query(query, [userId]);
    
    if (result.rows.length === 0) {
      // User exists but has no transactions
      return {
        userId,
        totalTransactions: 0,
        totalIncome: 0,
        totalExpense: 0,
        firstTransactionDate: null,
        lastTransactionDate: null
      };
    }

    const row = result.rows[0];
    return {
      userId: row.userId,
      totalTransactions: parseInt(row.totalTransactions) || 0,
      totalIncome: parseFloat(row.totalIncome) || 0,
      totalExpense: parseFloat(row.totalExpense) || 0,
      firstTransactionDate: row.firstTransactionDate,
      lastTransactionDate: row.lastTransactionDate
    };
  }

  /**
   * Get user preferences by user ID
   */
  async getUserPreferences(userId: number): Promise<UserPreferences | null> {
    const query = `
      SELECT 
        id,
        user_id as "userId",
        monthly_start_date as "monthlyStartDate",
        timezone,
        currency,
        date_format as "dateFormat",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM user_preferences
      WHERE user_id = $1
    `;

    const result = await pool.query(query, [userId]);
    
    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  }

  /**
   * Create user preferences
   */
  async createUserPreferences(preferences: Omit<UserPreferences, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserPreferences> {
    const query = `
      INSERT INTO user_preferences (user_id, monthly_start_date, timezone, currency, date_format)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING 
        id,
        user_id as "userId",
        monthly_start_date as "monthlyStartDate",
        timezone,
        currency,
        date_format as "dateFormat",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;

    const result = await pool.query(query, [
      preferences.userId,
      preferences.monthlyStartDate,
      preferences.timezone,
      preferences.currency,
      preferences.dateFormat
    ]);

    return result.rows[0];
  }

  /**
   * Update user preferences
   */
  async updateUserPreferences(
    userId: number, 
    updates: Partial<Pick<UserPreferences, 'monthlyStartDate' | 'timezone' | 'currency' | 'dateFormat'>>
  ): Promise<UserPreferences> {
    const setParts: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updates.monthlyStartDate !== undefined) {
      setParts.push(`monthly_start_date = $${paramIndex++}`);
      values.push(updates.monthlyStartDate);
    }
    if (updates.timezone !== undefined) {
      setParts.push(`timezone = $${paramIndex++}`);
      values.push(updates.timezone);
    }
    if (updates.currency !== undefined) {
      setParts.push(`currency = $${paramIndex++}`);
      values.push(updates.currency);
    }
    if (updates.dateFormat !== undefined) {
      setParts.push(`date_format = $${paramIndex++}`);
      values.push(updates.dateFormat);
    }

    setParts.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(userId);

    const query = `
      UPDATE user_preferences 
      SET ${setParts.join(', ')}
      WHERE user_id = $${paramIndex}
      RETURNING 
        id,
        user_id as "userId",
        monthly_start_date as "monthlyStartDate",
        timezone,
        currency,
        date_format as "dateFormat",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }
}

export default new UserRepository();
