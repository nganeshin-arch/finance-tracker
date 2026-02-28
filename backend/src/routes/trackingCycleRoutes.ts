import { Router } from 'express';
import trackingCycleController from '../controllers/trackingCycleController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

/**
 * Tracking Cycle Routes
 * All routes require authentication
 */

// GET /api/tracking-cycles/active - Must be before /:id route
router.get('/active', authenticateToken, trackingCycleController.getActiveTrackingCycle.bind(trackingCycleController));

// GET /api/tracking-cycles
router.get('/', authenticateToken, trackingCycleController.getAllTrackingCycles.bind(trackingCycleController));

// GET /api/tracking-cycles/:id
router.get('/:id', authenticateToken, trackingCycleController.getTrackingCycleById.bind(trackingCycleController));

// POST /api/tracking-cycles
router.post('/', authenticateToken, trackingCycleController.createTrackingCycle.bind(trackingCycleController));

// PUT /api/tracking-cycles/:id
router.put('/:id', authenticateToken, trackingCycleController.updateTrackingCycle.bind(trackingCycleController));

// DELETE /api/tracking-cycles/:id
router.delete('/:id', authenticateToken, trackingCycleController.deleteTrackingCycle.bind(trackingCycleController));

export default router;
