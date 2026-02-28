import trackingCycleRepository from '../repositories/trackingCycleRepository';
import { TrackingCycle } from '../types/models';
import { CreateTrackingCycleDTO, UpdateTrackingCycleDTO } from '../types/dtos';
import { ValidationError } from '../utils/errors';

/**
 * Service layer for tracking cycle business logic
 */
export class TrackingCycleService {
  /**
   * Get all tracking cycles
   */
  async getAllTrackingCycles(): Promise<TrackingCycle[]> {
    return await trackingCycleRepository.findAll();
  }

  /**
   * Get tracking cycle by ID
   */
  async getTrackingCycleById(id: number): Promise<TrackingCycle> {
    return await trackingCycleRepository.findById(id);
  }

  /**
   * Get the currently active tracking cycle
   */
  async getActiveTrackingCycle(): Promise<TrackingCycle | null> {
    return await trackingCycleRepository.findActive();
  }

  /**
   * Validate tracking cycle data
   */
  private validateTrackingCycleData(data: CreateTrackingCycleDTO | UpdateTrackingCycleDTO): void {
    const errors: Array<{ field: string; message: string }> = [];

    // Validate name
    if ('name' in data && data.name !== undefined) {
      if (!data.name || data.name.trim().length === 0) {
        errors.push({ field: 'name', message: 'Name is required' });
      } else if (data.name.length > 100) {
        errors.push({ field: 'name', message: 'Name must not exceed 100 characters' });
      }
    }

    // Validate dates
    if ('startDate' in data && 'endDate' in data && data.startDate && data.endDate) {
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);

      if (isNaN(startDate.getTime())) {
        errors.push({ field: 'startDate', message: 'Invalid start date format' });
      }

      if (isNaN(endDate.getTime())) {
        errors.push({ field: 'endDate', message: 'Invalid end date format' });
      }

      if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
        if (endDate < startDate) {
          errors.push({ field: 'endDate', message: 'End date must be on or after start date' });
        }
      }
    }

    if (errors.length > 0) {
      throw new ValidationError(errors);
    }
  }

  /**
   * Create a new tracking cycle
   */
  async createTrackingCycle(data: CreateTrackingCycleDTO): Promise<TrackingCycle> {
    // Validate required fields
    const errors: Array<{ field: string; message: string }> = [];

    if (!data.name) {
      errors.push({ field: 'name', message: 'Name is required' });
    }

    if (!data.startDate) {
      errors.push({ field: 'startDate', message: 'Start date is required' });
    }

    if (!data.endDate) {
      errors.push({ field: 'endDate', message: 'End date is required' });
    }

    if (errors.length > 0) {
      throw new ValidationError(errors);
    }

    // Validate data
    this.validateTrackingCycleData(data);

    // Create the tracking cycle
    return await trackingCycleRepository.create(data);
  }

  /**
   * Update a tracking cycle
   */
  async updateTrackingCycle(id: number, data: UpdateTrackingCycleDTO): Promise<TrackingCycle> {
    // Validate data if provided
    if (Object.keys(data).length > 0) {
      this.validateTrackingCycleData(data);
    }

    // If activating this cycle, deactivate all others first
    if (data.isActive === true) {
      await trackingCycleRepository.deactivateAll();
    }

    // Update the tracking cycle
    return await trackingCycleRepository.update(id, data);
  }

  /**
   * Activate a tracking cycle (deactivates all others)
   */
  async activateTrackingCycle(id: number): Promise<TrackingCycle> {
    // Deactivate all cycles first
    await trackingCycleRepository.deactivateAll();

    // Activate the specified cycle
    return await trackingCycleRepository.update(id, { isActive: true });
  }

  /**
   * Deactivate a tracking cycle
   */
  async deactivateTrackingCycle(id: number): Promise<TrackingCycle> {
    return await trackingCycleRepository.update(id, { isActive: false });
  }

  /**
   * Delete a tracking cycle
   */
  async deleteTrackingCycle(id: number): Promise<void> {
    await trackingCycleRepository.delete(id);
  }
}

export default new TrackingCycleService();
