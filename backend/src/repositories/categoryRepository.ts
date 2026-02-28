import pool from '../config/database';
import { Category } from '../types/models';
import { CreateCategoryDTO, UpdateCategoryDTO } from '../types/dtos';
import { NotFoundError, ConflictError } from '../utils/errors';
import cache from '../utils/cache';

/**
 * Repository for category data access
 * Implements caching for improved performance (Requirement 10.4)
 */
export class CategoryRepository {
  private readonly CACHE_KEY_PREFIX = 'categories';
  private readonly CACHE_TTL = 10 * 60 * 1000; // 10 minutes

  /**
   * Get cache key for categories
   */
  private getCacheKey(transactionTypeId?: number): string {
    return transactionTypeId 
      ? `${this.CACHE_KEY_PREFIX}:type:${transactionTypeId}`
      : `${this.CACHE_KEY_PREFIX}:all`;
  }

  /**
   * Invalidate all category caches
   */
  private invalidateCache(): void {
    cache.invalidatePattern(`^${this.CACHE_KEY_PREFIX}:`);
  }

  /**
   * Get all categories with optional transaction type filter
   * Results are cached for improved performance
   */
  async findAll(transactionTypeId?: number): Promise<Category[]> {
    // Check cache first
    const cacheKey = this.getCacheKey(transactionTypeId);
    const cached = cache.get<Category[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // Query database
    let query = `
      SELECT c.id, c.name, c.transaction_type_id as "transactionTypeId", 
             c.created_at as "createdAt",
             t.id as "transactionType.id", t.name as "transactionType.name",
             t.created_at as "transactionType.createdAt"
      FROM categories c
      LEFT JOIN transaction_types t ON c.transaction_type_id = t.id
    `;
    const params: any[] = [];
    
    if (transactionTypeId) {
      query += ` WHERE c.transaction_type_id = $1`;
      params.push(transactionTypeId);
    }
    
    query += ` ORDER BY c.name ASC`;
    
    const result = await pool.query(query, params);
    
    // Transform flat rows to nested objects
    const categories = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      transactionTypeId: row.transactionTypeId,
      createdAt: row.createdAt,
      transactionType: row['transactionType.id'] ? {
        id: row['transactionType.id'],
        name: row['transactionType.name'],
        createdAt: row['transactionType.createdAt']
      } : undefined
    }));
    
    // Store in cache
    cache.set(cacheKey, categories, this.CACHE_TTL);
    
    return categories;
  }

  /**
   * Get category by ID
   */
  async findById(id: number): Promise<Category> {
    const query = `
      SELECT c.id, c.name, c.transaction_type_id as "transactionTypeId", 
             c.created_at as "createdAt",
             t.id as "transactionType.id", t.name as "transactionType.name",
             t.created_at as "transactionType.createdAt"
      FROM categories c
      LEFT JOIN transaction_types t ON c.transaction_type_id = t.id
      WHERE c.id = $1
    `;
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      throw new NotFoundError(`Category with ID ${id} not found`);
    }
    
    const row = result.rows[0];
    return {
      id: row.id,
      name: row.name,
      transactionTypeId: row.transactionTypeId,
      createdAt: row.createdAt,
      transactionType: row['transactionType.id'] ? {
        id: row['transactionType.id'],
        name: row['transactionType.name'],
        createdAt: row['transactionType.createdAt']
      } : undefined
    };
  }

  /**
   * Check if a category name already exists within a transaction type
   */
  async existsByName(name: string, transactionTypeId: number, excludeId?: number): Promise<boolean> {
    let query = `
      SELECT COUNT(*) as count
      FROM categories
      WHERE LOWER(name) = LOWER($1) AND transaction_type_id = $2
    `;
    const params: any[] = [name, transactionTypeId];
    
    if (excludeId) {
      query += ` AND id != $3`;
      params.push(excludeId);
    }
    
    const result = await pool.query(query, params);
    return parseInt(result.rows[0].count) > 0;
  }

  /**
   * Create a new category
   */
  async create(data: CreateCategoryDTO): Promise<Category> {
    // Check for duplicate name within the same transaction type
    const exists = await this.existsByName(data.name, data.transactionTypeId);
    if (exists) {
      throw new ConflictError(`Category with name "${data.name}" already exists for this transaction type`);
    }
    
    const query = `
      INSERT INTO categories (name, transaction_type_id)
      VALUES ($1, $2)
      RETURNING id, name, transaction_type_id as "transactionTypeId", created_at as "createdAt"
    `;
    
    const result = await pool.query(query, [data.name, data.transactionTypeId]);
    
    // Invalidate cache
    this.invalidateCache();
    
    return result.rows[0];
  }

  /**
   * Update a category
   */
  async update(id: number, data: UpdateCategoryDTO): Promise<Category> {
    // First check if the category exists
    const existing = await this.findById(id);
    
    // Check for duplicate name if name is being updated
    if (data.name) {
      const transactionTypeId = data.transactionTypeId || existing.transactionTypeId;
      const exists = await this.existsByName(data.name, transactionTypeId, id);
      if (exists) {
        throw new ConflictError(`Category with name "${data.name}" already exists for this transaction type`);
      }
    }
    
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;
    
    if (data.name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(data.name);
    }
    
    if (data.transactionTypeId !== undefined) {
      updates.push(`transaction_type_id = $${paramCount++}`);
      values.push(data.transactionTypeId);
    }
    
    if (updates.length === 0) {
      return existing;
    }
    
    values.push(id);
    
    const query = `
      UPDATE categories
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, name, transaction_type_id as "transactionTypeId", created_at as "createdAt"
    `;
    
    const result = await pool.query(query, values);
    
    // Invalidate cache
    this.invalidateCache();
    
    return result.rows[0];
  }

  /**
   * Delete a category
   */
  async delete(id: number): Promise<void> {
    // First check if the category exists
    await this.findById(id);
    
    // Check if there are any sub-categories associated with this category
    const checkSubCategoriesQuery = `
      SELECT COUNT(*) as count
      FROM sub_categories
      WHERE category_id = $1
    `;
    const subCategoriesResult = await pool.query(checkSubCategoriesQuery, [id]);
    
    if (parseInt(subCategoriesResult.rows[0].count) > 0) {
      throw new ConflictError('Cannot delete category with associated sub-categories');
    }
    
    // Check if there are any transactions associated with this category
    const checkTransactionsQuery = `
      SELECT COUNT(*) as count
      FROM transactions
      WHERE category_id = $1
    `;
    const transactionsResult = await pool.query(checkTransactionsQuery, [id]);
    
    if (parseInt(transactionsResult.rows[0].count) > 0) {
      throw new ConflictError('Cannot delete category with associated transactions');
    }
    
    const query = `DELETE FROM categories WHERE id = $1`;
    await pool.query(query, [id]);
    
    // Invalidate cache
    this.invalidateCache();
  }
}

export default new CategoryRepository();
