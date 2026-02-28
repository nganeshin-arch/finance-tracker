import pool from '../config/database';
import { Transaction } from '../types/models';
import { CreateTransactionDTO, UpdateTransactionDTO } from '../types/dtos';
import { TransactionFilters } from '../types/filters';
import { NotFoundError, ForbiddenError } from '../utils/errors';

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
 * Repository for transaction data access
 * Supports pagination for large result sets (Requirement 10.3)
 */
export class TransactionRepository {
  /**
   * Get all transactions for a specific user with optional filtering and pagination
   */
  async findByUserId(
    userId: number, 
    filters?: TransactionFilters, 
    pagination?: PaginationOptions
  ): Promise<Transaction[] | PaginatedResult<Transaction>> {
    let query = `
      SELECT 
        t.id, 
        t.user_id as "userId",
        t.tracking_cycle_id as "trackingCycleId",
        t.date,
        t.transaction_type_id as "transactionTypeId",
        t.category_id as "categoryId",
        t.sub_category_id as "subCategoryId",
        t.payment_mode_id as "paymentModeId",
        t.account_id as "accountId",
        t.amount,
        t.description,
        t.created_at as "createdAt",
        t.updated_at as "updatedAt",
        tt.id as "transactionType.id",
        tt.name as "transactionType.name",
        c.id as "category.id",
        c.name as "category.name",
        sc.id as "subCategory.id",
        sc.name as "subCategory.name",
        pm.id as "paymentMode.id",
        pm.name as "paymentMode.name",
        a.id as "account.id",
        a.name as "account.name"
      FROM transactions t
      LEFT JOIN transaction_types tt ON t.transaction_type_id = tt.id
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN sub_categories sc ON t.sub_category_id = sc.id
      LEFT JOIN payment_modes pm ON t.payment_mode_id = pm.id
      LEFT JOIN accounts a ON t.account_id = a.id
      WHERE t.user_id = $1
    `;

    const params: any[] = [userId];
    let paramCount = 2;

    if (filters) {
      if (filters.startDate) {
        query += ` AND t.date >= $${paramCount++}`;
        params.push(new Date(filters.startDate));
      }

      if (filters.endDate) {
        query += ` AND t.date <= $${paramCount++}`;
        params.push(new Date(filters.endDate));
      }

      if (filters.trackingCycleId) {
        query += ` AND t.tracking_cycle_id = $${paramCount++}`;
        params.push(filters.trackingCycleId);
      }

      if (filters.transactionTypeId) {
        query += ` AND t.transaction_type_id = $${paramCount++}`;
        params.push(filters.transactionTypeId);
      }

      if (filters.categoryId) {
        query += ` AND t.category_id = $${paramCount++}`;
        params.push(filters.categoryId);
      }

      if (filters.accountId) {
        query += ` AND t.account_id = $${paramCount++}`;
        params.push(filters.accountId);
      }
    }

    query += ` ORDER BY t.date DESC, t.created_at DESC`;

    // Handle pagination if requested
    if (pagination) {
      const page = pagination.page || 1;
      const limit = pagination.limit || 20;
      const offset = (page - 1) * limit;

      // Get total count first (without pagination)
      const countQuery = `
        SELECT COUNT(*) as total
        FROM transactions t
        WHERE t.user_id = $1
        ${filters?.startDate ? `AND t.date >= $${params.indexOf(new Date(filters.startDate)) + 1}` : ''}
        ${filters?.endDate ? `AND t.date <= $${params.indexOf(new Date(filters.endDate)) + 1}` : ''}
        ${filters?.trackingCycleId ? `AND t.tracking_cycle_id = $${params.indexOf(filters.trackingCycleId) + 1}` : ''}
        ${filters?.transactionTypeId ? `AND t.transaction_type_id = $${params.indexOf(filters.transactionTypeId) + 1}` : ''}
        ${filters?.categoryId ? `AND t.category_id = $${params.indexOf(filters.categoryId) + 1}` : ''}
        ${filters?.accountId ? `AND t.account_id = $${params.indexOf(filters.accountId) + 1}` : ''}
      `;
      const countResult = await pool.query(countQuery, params);
      const total = parseInt(countResult.rows[0].total) || 0;

      // Add pagination to main query
      query += ` LIMIT ${paramCount++} OFFSET ${paramCount++}`;
      params.push(limit, offset);

      const result = await pool.query(query, params);
      const transactions = result.rows.map(this.mapRowToTransaction);

      return {
        data: transactions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    }

    // No pagination - return all results
    const result = await pool.query(query, params);
    return result.rows.map(this.mapRowToTransaction);
  }

  /**
   * Get transaction by ID with populated relations
   * Optionally filter by userId for ownership check
   */
  async findById(id: number, userId?: number): Promise<Transaction | null> {
    let query = `
      SELECT 
        t.id, 
        t.user_id as "userId",
        t.tracking_cycle_id as "trackingCycleId",
        t.date,
        t.transaction_type_id as "transactionTypeId",
        t.category_id as "categoryId",
        t.sub_category_id as "subCategoryId",
        t.payment_mode_id as "paymentModeId",
        t.account_id as "accountId",
        t.amount,
        t.description,
        t.created_at as "createdAt",
        t.updated_at as "updatedAt",
        tt.id as "transactionType.id",
        tt.name as "transactionType.name",
        c.id as "category.id",
        c.name as "category.name",
        sc.id as "subCategory.id",
        sc.name as "subCategory.name",
        pm.id as "paymentMode.id",
        pm.name as "paymentMode.name",
        a.id as "account.id",
        a.name as "account.name",
        tc.id as "trackingCycle.id",
        tc.name as "trackingCycle.name",
        tc.start_date as "trackingCycle.startDate",
        tc.end_date as "trackingCycle.endDate"
      FROM transactions t
      LEFT JOIN transaction_types tt ON t.transaction_type_id = tt.id
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN sub_categories sc ON t.sub_category_id = sc.id
      LEFT JOIN payment_modes pm ON t.payment_mode_id = pm.id
      LEFT JOIN accounts a ON t.account_id = a.id
      LEFT JOIN tracking_cycles tc ON t.tracking_cycle_id = tc.id
      WHERE t.id = $1
    `;

    const params: any[] = [id];

    if (userId !== undefined) {
      query += ` AND t.user_id = $2`;
      params.push(userId);
    }

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToTransaction(result.rows[0]);
  }

  /**
   * Create a new transaction with user_id
   */
  async create(userId: number, data: CreateTransactionDTO): Promise<Transaction> {
    const query = `
      INSERT INTO transactions (
        user_id, tracking_cycle_id, date, transaction_type_id, category_id, 
        sub_category_id, payment_mode_id, account_id, amount, description
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING 
        id, 
        user_id as "userId",
        tracking_cycle_id as "trackingCycleId",
        date,
        transaction_type_id as "transactionTypeId",
        category_id as "categoryId",
        sub_category_id as "subCategoryId",
        payment_mode_id as "paymentModeId",
        account_id as "accountId",
        amount,
        description,
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;

    const params = [
      userId,
      data.trackingCycleId || null,
      new Date(data.date),
      data.transactionTypeId,
      data.categoryId,
      data.subCategoryId,
      data.paymentModeId,
      data.accountId,
      data.amount,
      data.description || null
    ];

    const result = await pool.query(query, params);
    
    // Fetch the complete transaction with relations
    const transaction = await this.findById(result.rows[0].id);
    if (!transaction) {
      throw new NotFoundError(`Failed to retrieve created transaction`);
    }
    return transaction;
  }

  /**
   * Update a transaction with ownership check
   */
  async update(userId: number, id: number, data: UpdateTransactionDTO): Promise<Transaction> {
    // First check if the transaction exists and belongs to the user
    const existing = await this.findById(id, userId);
    
    if (!existing) {
      // Check if transaction exists at all (without user filter)
      const anyTransaction = await this.findById(id);
      if (anyTransaction) {
        // Transaction exists but doesn't belong to this user
        throw new ForbiddenError(`You do not have permission to access this transaction`);
      }
      // Transaction doesn't exist at all
      throw new NotFoundError(`Transaction with ID ${id} not found`);
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (data.trackingCycleId !== undefined) {
      updates.push(`tracking_cycle_id = $${paramCount++}`);
      values.push(data.trackingCycleId || null);
    }

    if (data.date !== undefined) {
      updates.push(`date = $${paramCount++}`);
      values.push(new Date(data.date));
    }

    if (data.transactionTypeId !== undefined) {
      updates.push(`transaction_type_id = $${paramCount++}`);
      values.push(data.transactionTypeId);
    }

    if (data.categoryId !== undefined) {
      updates.push(`category_id = $${paramCount++}`);
      values.push(data.categoryId);
    }

    if (data.subCategoryId !== undefined) {
      updates.push(`sub_category_id = $${paramCount++}`);
      values.push(data.subCategoryId);
    }

    if (data.paymentModeId !== undefined) {
      updates.push(`payment_mode_id = $${paramCount++}`);
      values.push(data.paymentModeId);
    }

    if (data.accountId !== undefined) {
      updates.push(`account_id = $${paramCount++}`);
      values.push(data.accountId);
    }

    if (data.amount !== undefined) {
      updates.push(`amount = $${paramCount++}`);
      values.push(data.amount);
    }

    if (data.description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(data.description || null);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);
    values.push(userId);

    const query = `
      UPDATE transactions
      SET ${updates.join(', ')}
      WHERE id = $${paramCount++} AND user_id = $${paramCount}
      RETURNING id
    `;

    const result = await pool.query(query, values);
    
    if (result.rowCount === 0) {
      throw new ForbiddenError(`You do not have permission to access this transaction`);
    }
    
    // Fetch the complete transaction with relations
    const transaction = await this.findById(id, userId);
    if (!transaction) {
      throw new NotFoundError(`Failed to retrieve updated transaction`);
    }
    return transaction;
  }

  /**
   * Delete a transaction with ownership check
   */
  async delete(userId: number, id: number): Promise<boolean> {
    const query = `DELETE FROM transactions WHERE id = $1 AND user_id = $2`;
    const result = await pool.query(query, [id, userId]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  /**
   * Map database row to Transaction object with nested relations
   */
  private mapRowToTransaction(row: any): Transaction {
    const transaction: Transaction = {
      id: row.id,
      userId: row.userId,
      trackingCycleId: row.trackingCycleId,
      date: row.date,
      transactionTypeId: row.transactionTypeId,
      categoryId: row.categoryId,
      subCategoryId: row.subCategoryId,
      paymentModeId: row.paymentModeId,
      accountId: row.accountId,
      amount: parseFloat(row.amount),
      description: row.description,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    };

    // Populate transactionType if available
    if (row['transactionType.id']) {
      transaction.transactionType = {
        id: row['transactionType.id'],
        name: row['transactionType.name'],
        createdAt: row['transactionType.createdAt'] || new Date()
      };
    }

    // Populate category if available
    if (row['category.id']) {
      transaction.category = {
        id: row['category.id'],
        name: row['category.name'],
        transactionTypeId: row.transactionTypeId,
        createdAt: row['category.createdAt'] || new Date()
      };
    }

    // Populate subCategory if available
    if (row['subCategory.id']) {
      transaction.subCategory = {
        id: row['subCategory.id'],
        name: row['subCategory.name'],
        categoryId: row.categoryId,
        createdAt: row['subCategory.createdAt'] || new Date()
      };
    }

    // Populate paymentMode if available
    if (row['paymentMode.id']) {
      transaction.paymentMode = {
        id: row['paymentMode.id'],
        name: row['paymentMode.name'],
        createdAt: row['paymentMode.createdAt'] || new Date()
      };
    }

    // Populate account if available
    if (row['account.id']) {
      transaction.account = {
        id: row['account.id'],
        name: row['account.name'],
        createdAt: row['account.createdAt'] || new Date()
      };
    }

    // Populate trackingCycle if available
    if (row['trackingCycle.id']) {
      transaction.trackingCycle = {
        id: row['trackingCycle.id'],
        name: row['trackingCycle.name'],
        startDate: row['trackingCycle.startDate'],
        endDate: row['trackingCycle.endDate'],
        isActive: row['trackingCycle.isActive'] || false,
        createdAt: row['trackingCycle.createdAt'] || new Date(),
        updatedAt: row['trackingCycle.updatedAt'] || new Date()
      };
    }

    return transaction;
  }
}

export default new TransactionRepository();
