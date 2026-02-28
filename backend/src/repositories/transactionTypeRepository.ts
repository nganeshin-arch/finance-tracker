import pool from '../config/database';
import { TransactionType } from '../types/models';
import { CreateTransactionTypeDTO } from '../types/dtos';
import { NotFoundError, ConflictError } from '../utils/errors';
import cache from '../utils/cache';

/**
 * Repository for transaction type data access
 * Implements caching for improved performance (Requirement 10.4)
 */
export class TransactionTypeRepository {
  private readonly CACHE_KEY = 'transaction_types:all';
  private readonly CACHE_TTL = 10 * 60 * 1000; // 10 minutes

  /**
   * Get all transaction types
   * Results are cached for improved performance
   */
  async findAll(): Promise<TransactionType[]> {
    // Check cache first
    const cached = cache.get<TransactionType[]>(this.CACHE_KEY);
    if (cached) {
      return cached;
    }

    // Query database
    const query = `
      SELECT id, name, created_at as "createdAt"
      FROM transaction_types
      ORDER BY name ASC
    `;
    const result = await pool.query(query);
    
    // Store in cache
    cache.set(this.CACHE_KEY, result.rows, this.CACHE_TTL);
    
    return result.rows;
  }

  /**
   * Get transaction type by ID
   */
  async findById(id: number): Promise<TransactionType> {
    const query = `
      SELECT id, name, created_at as "createdAt"
      FROM transaction_types
      WHERE id = $1
    `;
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      throw new NotFoundError(`Transaction type with ID ${id} not found`);
    }
    
    return result.rows[0];
  }

  /**
   * Check if a transaction type name already exists
   */
  async existsByName(name: string, excludeId?: number): Promise<boolean> {
    let query = `
      SELECT COUNT(*) as count
      FROM transaction_types
      WHERE LOWER(name) = LOWER($1)
    `;
    const params: any[] = [name];
    
    if (excludeId) {
      query += ` AND id != $2`;
      params.push(excludeId);
    }
    
    const result = await pool.query(query, params);
    return parseInt(result.rows[0].count) > 0;
  }

  /**
   * Create a new transaction type
   * Invalidates cache after creation
   */
  async create(data: CreateTransactionTypeDTO): Promise<TransactionType> {
    // Check for duplicate name
    const exists = await this.existsByName(data.name);
    if (exists) {
      throw new ConflictError(`Transaction type with name "${data.name}" already exists`);
    }
    
    const query = `
      INSERT INTO transaction_types (name)
      VALUES ($1)
      RETURNING id, name, created_at as "createdAt"
    `;
    
    const result = await pool.query(query, [data.name]);
    
    // Invalidate cache
    cache.delete(this.CACHE_KEY);
    
    return result.rows[0];
  }

  /**
   * Delete a transaction type
   * Invalidates cache after deletion
   */
  async delete(id: number): Promise<void> {
    // First check if the type exists
    await this.findById(id);
    
    // Check if there are any categories associated with this type
    const checkQuery = `
      SELECT COUNT(*) as count
      FROM categories
      WHERE transaction_type_id = $1
    `;
    const checkResult = await pool.query(checkQuery, [id]);
    
    if (parseInt(checkResult.rows[0].count) > 0) {
      throw new ConflictError('Cannot delete transaction type with associated categories');
    }
    
    const query = `DELETE FROM transaction_types WHERE id = $1`;
    await pool.query(query, [id]);
    
    // Invalidate cache
    cache.delete(this.CACHE_KEY);
  }
}

export default new TransactionTypeRepository();
