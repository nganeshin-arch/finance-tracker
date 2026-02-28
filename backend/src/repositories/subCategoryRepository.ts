import pool from '../config/database';
import { SubCategory } from '../types/models';
import { CreateSubCategoryDTO, UpdateSubCategoryDTO } from '../types/dtos';
import { NotFoundError, ConflictError } from '../utils/errors';

/**
 * Repository for sub-category data access
 */
export class SubCategoryRepository {
  /**
   * Get all sub-categories with optional category filter
   */
  async findAll(categoryId?: number): Promise<SubCategory[]> {
    let query = `
      SELECT sc.id, sc.name, sc.category_id as "categoryId", 
             sc.created_at as "createdAt",
             c.id as "category.id", c.name as "category.name",
             c.transaction_type_id as "category.transactionTypeId",
             c.created_at as "category.createdAt"
      FROM sub_categories sc
      LEFT JOIN categories c ON sc.category_id = c.id
    `;
    const params: any[] = [];
    
    if (categoryId) {
      query += ` WHERE sc.category_id = $1`;
      params.push(categoryId);
    }
    
    query += ` ORDER BY sc.name ASC`;
    
    const result = await pool.query(query, params);
    
    // Transform flat rows to nested objects
    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      categoryId: row.categoryId,
      createdAt: row.createdAt,
      category: row['category.id'] ? {
        id: row['category.id'],
        name: row['category.name'],
        transactionTypeId: row['category.transactionTypeId'],
        createdAt: row['category.createdAt']
      } : undefined
    }));
  }

  /**
   * Get sub-category by ID
   */
  async findById(id: number): Promise<SubCategory> {
    const query = `
      SELECT sc.id, sc.name, sc.category_id as "categoryId", 
             sc.created_at as "createdAt",
             c.id as "category.id", c.name as "category.name",
             c.transaction_type_id as "category.transactionTypeId",
             c.created_at as "category.createdAt"
      FROM sub_categories sc
      LEFT JOIN categories c ON sc.category_id = c.id
      WHERE sc.id = $1
    `;
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      throw new NotFoundError(`Sub-category with ID ${id} not found`);
    }
    
    const row = result.rows[0];
    return {
      id: row.id,
      name: row.name,
      categoryId: row.categoryId,
      createdAt: row.createdAt,
      category: row['category.id'] ? {
        id: row['category.id'],
        name: row['category.name'],
        transactionTypeId: row['category.transactionTypeId'],
        createdAt: row['category.createdAt']
      } : undefined
    };
  }

  /**
   * Check if a sub-category name already exists within a category
   */
  async existsByName(name: string, categoryId: number, excludeId?: number): Promise<boolean> {
    let query = `
      SELECT COUNT(*) as count
      FROM sub_categories
      WHERE LOWER(name) = LOWER($1) AND category_id = $2
    `;
    const params: any[] = [name, categoryId];
    
    if (excludeId) {
      query += ` AND id != $3`;
      params.push(excludeId);
    }
    
    const result = await pool.query(query, params);
    return parseInt(result.rows[0].count) > 0;
  }

  /**
   * Create a new sub-category
   */
  async create(data: CreateSubCategoryDTO): Promise<SubCategory> {
    // Check for duplicate name within the same category
    const exists = await this.existsByName(data.name, data.categoryId);
    if (exists) {
      throw new ConflictError(`Sub-category with name "${data.name}" already exists for this category`);
    }
    
    const query = `
      INSERT INTO sub_categories (name, category_id)
      VALUES ($1, $2)
      RETURNING id, name, category_id as "categoryId", created_at as "createdAt"
    `;
    
    const result = await pool.query(query, [data.name, data.categoryId]);
    return result.rows[0];
  }

  /**
   * Update a sub-category
   */
  async update(id: number, data: UpdateSubCategoryDTO): Promise<SubCategory> {
    // First check if the sub-category exists
    const existing = await this.findById(id);
    
    // Check for duplicate name if name is being updated
    if (data.name) {
      const categoryId = data.categoryId || existing.categoryId;
      const exists = await this.existsByName(data.name, categoryId, id);
      if (exists) {
        throw new ConflictError(`Sub-category with name "${data.name}" already exists for this category`);
      }
    }
    
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;
    
    if (data.name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(data.name);
    }
    
    if (data.categoryId !== undefined) {
      updates.push(`category_id = $${paramCount++}`);
      values.push(data.categoryId);
    }
    
    if (updates.length === 0) {
      return existing;
    }
    
    values.push(id);
    
    const query = `
      UPDATE sub_categories
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, name, category_id as "categoryId", created_at as "createdAt"
    `;
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Delete a sub-category
   */
  async delete(id: number): Promise<void> {
    // First check if the sub-category exists
    await this.findById(id);
    
    // Check if there are any transactions associated with this sub-category
    const checkQuery = `
      SELECT COUNT(*) as count
      FROM transactions
      WHERE sub_category_id = $1
    `;
    const checkResult = await pool.query(checkQuery, [id]);
    
    if (parseInt(checkResult.rows[0].count) > 0) {
      throw new ConflictError('Cannot delete sub-category with associated transactions');
    }
    
    const query = `DELETE FROM sub_categories WHERE id = $1`;
    await pool.query(query, [id]);
  }
}

export default new SubCategoryRepository();
