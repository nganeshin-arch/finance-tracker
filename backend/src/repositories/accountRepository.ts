import pool from '../config/database';
import { Account } from '../types/models';
import { CreateAccountDTO } from '../types/dtos';
import { NotFoundError, ConflictError } from '../utils/errors';
import cache from '../utils/cache';

/**
 * Repository for account data access
 * Implements caching for improved performance (Requirement 10.4)
 */
export class AccountRepository {
  private readonly CACHE_KEY = 'accounts:all';
  private readonly CACHE_TTL = 10 * 60 * 1000; // 10 minutes

  /**
   * Get all accounts
   * Results are cached for improved performance
   */
  async findAll(): Promise<Account[]> {
    // Check cache first
    const cached = cache.get<Account[]>(this.CACHE_KEY);
    if (cached) {
      return cached;
    }

    // Query database
    const query = `
      SELECT id, name, created_at as "createdAt"
      FROM accounts
      ORDER BY name ASC
    `;
    const result = await pool.query(query);
    
    // Store in cache
    cache.set(this.CACHE_KEY, result.rows, this.CACHE_TTL);
    
    return result.rows;
  }

  /**
   * Get account by ID
   */
  async findById(id: number): Promise<Account> {
    const query = `
      SELECT id, name, created_at as "createdAt"
      FROM accounts
      WHERE id = $1
    `;
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      throw new NotFoundError(`Account with ID ${id} not found`);
    }
    
    return result.rows[0];
  }

  /**
   * Check if an account name already exists
   */
  async existsByName(name: string, excludeId?: number): Promise<boolean> {
    let query = `
      SELECT COUNT(*) as count
      FROM accounts
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
   * Create a new account
   */
  async create(data: CreateAccountDTO): Promise<Account> {
    // Check for duplicate name
    const exists = await this.existsByName(data.name);
    if (exists) {
      throw new ConflictError(`Account with name "${data.name}" already exists`);
    }
    
    const query = `
      INSERT INTO accounts (name)
      VALUES ($1)
      RETURNING id, name, created_at as "createdAt"
    `;
    
    const result = await pool.query(query, [data.name]);
    
    // Invalidate cache
    cache.delete(this.CACHE_KEY);
    
    return result.rows[0];
  }

  /**
   * Delete an account
   * Invalidates cache after deletion
   */
  async delete(id: number): Promise<void> {
    // First check if the account exists
    await this.findById(id);
    
    // Check if there are any transactions associated with this account
    const checkQuery = `
      SELECT COUNT(*) as count
      FROM transactions
      WHERE account_id = $1
    `;
    const checkResult = await pool.query(checkQuery, [id]);
    
    if (parseInt(checkResult.rows[0].count) > 0) {
      throw new ConflictError('Cannot delete account with associated transactions');
    }
    
    const query = `DELETE FROM accounts WHERE id = $1`;
    await pool.query(query, [id]);
    
    // Invalidate cache
    cache.delete(this.CACHE_KEY);
  }
}

export default new AccountRepository();
