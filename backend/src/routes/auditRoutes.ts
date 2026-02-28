import { Router } from 'express';
import auditController from '../controllers/auditController';
import { authenticateToken, authorizeRole } from '../middleware/authMiddleware';

const router = Router();

/**
 * All audit routes require authentication and admin role
 */

// Get recent audit logs
router.get(
  '/logs',
  authenticateToken,
  authorizeRole('admin'),
  auditController.getRecentLogs.bind(auditController)
);

// Get logs for specific user
router.get(
  '/logs/user/:userId',
  authenticateToken,
  authorizeRole('admin'),
  auditController.getUserLogs.bind(auditController)
);

// Get failed authorization attempts
router.get(
  '/logs/failed-authorizations',
  authenticateToken,
  authorizeRole('admin'),
  auditController.getFailedAuthorizations.bind(auditController)
);

// Get logs by IP address
router.get(
  '/logs/ip/:ip',
  authenticateToken,
  authorizeRole('admin'),
  auditController.getLogsByIp.bind(auditController)
);

// Get security report
router.get(
  '/security-report',
  authenticateToken,
  authorizeRole('admin'),
  auditController.getSecurityReport.bind(auditController)
);

// Export logs
router.get(
  '/logs/export',
  authenticateToken,
  authorizeRole('admin'),
  auditController.exportLogs.bind(auditController)
);

export default router;
