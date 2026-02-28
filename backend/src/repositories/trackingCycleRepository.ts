import pool from '../config/database';
import { TrackingCycle } from '../types/models';
import { CreateTrackingCycleDTO, UpdateTrackingCycleDTO } from '../types/dtos';
import { NotFoundError, ConflictError } from '../utils/errors';

/**
 * Repository for tracking cycle data access
 */
export class TrackingCycleRepository {
  /**
   * Get all tracking cycles
   */
  async findAll(): Promise<TrackingCycle[]> {
    const query = `
      SELECT id, name, start_date as "startDate", end_date as "endDate", 
             is_active as "isActive", created_at as "createdAt", updated_at as "updatedAt"
      FROM tracking_cycles
      ORDER BY start_date DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  /**
   * Get tracking cycle by ID
   */
  async findById(id: number): Promise<TrackingCycle> {
    const query = `
      SELECT id, name, start_date as "startDate", end_date as "endDate", 
             is_active as "isActive", created_at as "createdAt", updated_at as "updatedAt"
      FROM tracking_cycles
      WHERE id = $1
    `;
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      throw new NotFoundError(`Tracking cycle with ID ${id} not found`);
    }
    
    return result.rows[0];
  }

  /**
   * Get the currently active tracking cycle
   */
  async findActive(): Promise<TrackingCycle | null> {
    const query = `
      SELECT id, name, start_date as "startDate", end_date as "endDate", 
             is_active as "isActive", created_at as "createdAt", updated_at as "updatedAt"
      FROM tracking_cycles
      WHERE is_active = true
      LIMIT 1
    `;
    const result = await pool.query(query);
    
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Check if there are overlapping tracking cycles
   */
  async hasOverlap(startDate: Date, endDate: Date, excludeId?: number): Promise<boolean> {
    let query = `
      SELECT COUNT(*) as count
      FROM tracking_cycles
      WHERE (
        (start_date <= $1 AND end_date >= $1) OR
        (start_date <= $2 AND end_date >= $2) OR
        (start_date >= $1 AND end_date <= $2)
      )
    `;
    const params: any[] = [startDate, endDate];
    
    if (excludeId) {
      query += ` AND id != $3`;
      params.push(excludeId);
    }
    
    const result = await pool.query(query, params);
    return parseInt(result.rows[0].count) > 0;
  }

  /**
   * Create a new tracking cycle
   */
  async create(data: CreateTrackingCycleDTO): Promise<TrackingCycle> {
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    
    // Check for overlapping cycles
    const hasOverlap = await this.hasOverlap(startDate, endDate);
    if (hasOverlap) {
      throw new ConflictError('Tracking cycle dates overlap with an existing cycle');
    }
    
    const query = `
      INSERT INTO tracking_cycles (name, start_date, end_date, is_active)
      VALUES ($1, $2, $3, false)
      RETURNING id, name, start_date as "startDate", end_date as "endDate", 
                is_active as "isActive", created_at as "createdAt", updated_at as "updatedAt"
    `;
    
    const result = await pool.query(query, [data.name, startDate, endDate]);
    return result.rows[0];
  }

  /**
   * Update a tracking cycle
   */
  async update(id: number, data: UpdateTrackingCycleDTO): Promise<TrackingCycle> {
    // First check if the cycle exists
    await this.findById(id);
    
    // If dates are being updated, check for overlaps
    if (data.startDate || data.endDate) {
      const existing = await this.findById(id);
      const startDate = data.startDate ? new Date(data.startDate) : existing.startDate;
      const endDate = data.endDate ? new Date(data.endDate) : existing.endDate;
      
      const hasOverlap = await this.hasOverlap(startDate, endDate, id);
      if (hasOverlap) {
        throw new ConflictError('Tracking cycle dates overlap with an existing cycle');
      }
    }
    
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;
    
    if (data.name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(data.name);
    }
    
    if (data.startDate !== undefined) {
      updates.push(`start_date = $${paramCount++}`);
      values.push(new Date(data.startDate));
    }
    
    if (data.endDate !== undefined) {
      updates.push(`end_date = $${paramCount++}`);
      values.push(new Date(data.endDate));
    }
    
    if (data.isActive !== undefined) {
      updates.push(`is_active = $${paramCount++}`);
      values.push(data.isActive);
    }
    
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);
    
    const query = `
      UPDATE tracking_cycles
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, name, start_date as "startDate", end_date as "endDate", 
                is_active as "isActive", created_at as "createdAt", updated_at as "updatedAt"
    `;
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Delete a tracking cycle
   */
  async delete(id: number): Promise<void> {
    // First check if the cycle exists
    await this.findById(id);
    
    // Check if there are any transactions associated with this cycle
    const checkQuery = `
      SELECT COUNT(*) as count
      FROM transactions
      WHERE tracking_cycle_id = $1
    `;
    const checkResult = await pool.query(checkQuery, [id]);
    
    if (parseInt(checkResult.rows[0].count) > 0) {
      throw new ConflictError('Cannot delete tracking cycle with associated transactions');
    }
    
    const query = `DELETE FROM tracking_cycles WHERE id = $1`;
    await pool.query(query, [id]);
  }

  /**
   * Deactivate all tracking cycles
   */
  async deactivateAll(): Promise<void> {
    const query = `UPDATE tracking_cycles SET is_active = false, updated_at = CURRENT_TIMESTAMP`;
    await pool.query(query);
  }
}

export default new TrackingCycleRepository();
