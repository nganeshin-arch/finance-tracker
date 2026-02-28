import { Request, Response, NextFunction } from 'express';
import trackingCycleService from '../services/trackingCycleService';
import { AuthRequest } from '../middleware/authMiddleware';

/**
 * Controller for tracking cycle endpoints
 */
export class TrackingCycleController {
  /**
   * GET /api/tracking-cycles
   * Get all tracking cycles
   */
  async getAllTrackingCycles(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthRequest;
      const userId = authReq.user?.userId;

      // TODO: Filter tracking cycles by userId once user_id column is added to tracking_cycles table
      const cycles = await trackingCycleService.getAllTrackingCycles();
      res.json(cycles);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/tracking-cycles/active
   * Get the currently active tracking cycle
   */
  async getActiveTrackingCycle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthRequest;
      const userId = authReq.user?.userId;

      // TODO: Filter active tracking cycle by userId once user_id column is added to tracking_cycles table
      const cycle = await trackingCycleService.getActiveTrackingCycle();
      
      if (!cycle) {
        res.status(404).json({
          error: 'Not Found',
          message: 'No active tracking cycle found'
        });
        return;
      }
      
      res.json(cycle);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/tracking-cycles/:id
   * Get tracking cycle by ID
   */
  async getTrackingCycleById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthRequest;
      const userId = authReq.user?.userId;

      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid tracking cycle ID'
        });
        return;
      }
      
      // TODO: Verify tracking cycle belongs to userId once user_id column is added
      const cycle = await trackingCycleService.getTrackingCycleById(id);
      res.json(cycle);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/tracking-cycles
   * Create a new tracking cycle
   */
  async createTrackingCycle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthRequest;
      const userId = authReq.user?.userId;

      // TODO: Add userId to tracking cycle data once user_id column is added to tracking_cycles table
      const cycle = await trackingCycleService.createTrackingCycle(req.body);
      res.status(201).json(cycle);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/tracking-cycles/:id
   * Update a tracking cycle
   */
  async updateTrackingCycle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthRequest;
      const userId = authReq.user?.userId;

      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid tracking cycle ID'
        });
        return;
      }
      
      // TODO: Verify tracking cycle belongs to userId once user_id column is added
      const cycle = await trackingCycleService.updateTrackingCycle(id, req.body);
      res.json(cycle);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/tracking-cycles/:id
   * Delete a tracking cycle
   */
  async deleteTrackingCycle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthRequest;
      const userId = authReq.user?.userId;

      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid tracking cycle ID'
        });
        return;
      }
      
      // TODO: Verify tracking cycle belongs to userId once user_id column is added
      await trackingCycleService.deleteTrackingCycle(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default new TrackingCycleController();
