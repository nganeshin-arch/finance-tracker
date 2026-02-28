import pool from '../config/database';
import { PaymentMode } from '../types/models';
import { CreatePaymentModeDTO } from '../types/dtos';
import { NotFoundError, ConflictError } from '../utils/errors';
import cache from '../utils/cache';

/**
 * Repository for payment mode data access
 * Implements caching for improved performance (Requirement 10.4)
 */
export class PaymentModeRepository {
  private readonly CACHE_KEY = 'payment_modes:all';
  private readonly CACHE_TTL = 10 * 60 * 1000; // 10 minutes

  /**
   * Get all payment modes
   * Results are cached for improved performance
   */
  async findAll(): Promise<PaymentMode[]> {
    // Check cache first
    const cached = cache.get<PaymentMode[]>(this.CACHE_KEY);
    if (cached) {
      return cached;
    }

    // Query database
    const query = `
      SELECT id, name, created_at as "createdAt"
      FROM payment_modes
      ORDER BY name ASC
    `;
    const result = await pool.query(query);
    
    // Store in cache
    cache.set(this.CACHE_KEY, result.rows, this.CACHE_TTL);
    
    return result.rows;
  }

  /**
   * Get payment mode by ID
   */
  async findById(id: number): Promise<PaymentMode> {
    const query = `
      SELECT id, name, created_at as "createdAt"
      FROM payment_modes
      WHERE id = $1
    `;
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      throw new NotFoundError(`Payment mode with ID ${id} not found`);
    }
    
    return result.rows[0];
  }

  /**
   * Check if a payment mode name already exists
   */
  async existsByName(name: string, excludeId?: number): Promise<boolean> {
    let query = `
      SELECT COUNT(*) as count
      FROM payment_modes
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
   * Create a new payment mode
   */
  async create(data: CreatePaymentModeDTO): Promise<PaymentMode> {
    // Check for duplicate name
    const exists = await this.existsByName(data.name);
    if (exists) {
      throw new ConflictError(`Payment mode with name "${data.name}" already exists`);
    }
    
    const query = `
      INSERT INTO payment_modes (name)
      VALUES ($1)
      RETURNING id, name, created_at as "createdAt"
    `;
    
    const result = await pool.query(query, [data.name]);
    
    // Invalidate cache
    cache.delete(this.CACHE_KEY);
    
    return result.rows[0];
  }

  /**
   * Delete a payment mode
   * Invalidates cache after deletion
   */
  async delete(id: number): Promise<void> {
    // First check if the payment mode exists
    await this.findById(id);
    
    // Check if there are any transactions associated with this payment mode
    const checkQuery = `
      SELECT COUNT(*) as count
      FROM transactions
      WHERE payment_mode_id = $1
    `;
    const checkResult = await pool.query(checkQuery, [id]);
    
    if (parseInt(checkResult.rows[0].count) > 0) {
      throw new ConflictError('Cannot delete payment mode with associated transactions');
    }
    
    const query = `DELETE FROM payment_modes WHERE id = $1`;
    await pool.query(query, [id]);
    
    // Invalidate cache
    cache.delete(this.CACHE_KEY);
  }
}

export default new PaymentModeRepository();
