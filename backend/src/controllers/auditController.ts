import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import { UserContextRequest } from '../middleware/userContext';

/**
 * Controller for audit log management and analysis
 * Admin-only endpoints for viewing and analyzing security logs
 */
export class AuditController {
  /**
   * Get recent audit logs
   */
  async getRecentLogs(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const logs = logger.getRecentLogs(limit);
      
      res.json({
        logs,
        count: logs.length
      });
    } catch (error) {
      console.error('[AuditController] Error fetching recent logs:', error);
      res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
  }

  /**
   * Get logs for a specific user
   */
  async getUserLogs(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.userId);
      const limit = parseInt(req.query.limit as string) || 100;
      
      if (isNaN(userId)) {
        res.status(400).json({ error: 'Invalid user ID' });
        return;
      }
      
      const logs = logger.getLogsByUser(userId, limit);
      
      res.json({
        userId,
        logs,
        count: logs.length
      });
    } catch (error) {
      console.error('[AuditController] Error fetching user logs:', error);
      res.status(500).json({ error: 'Failed to fetch user logs' });
    }
  }

  /**
   * Get failed authorization attempts
   */
  async getFailedAuthorizations(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const logs = logger.getFailedAuthorizationAttempts(limit);
      
      res.json({
        logs,
        count: logs.length
      });
    } catch (error) {
      console.error('[AuditController] Error fetching failed authorizations:', error);
      res.status(500).json({ error: 'Failed to fetch authorization failures' });
    }
  }

  /**
   * Get logs by IP address
   */
  async getLogsByIp(req: Request, res: Response): Promise<void> {
    try {
      const ip = req.params.ip;
      const limit = parseInt(req.query.limit as string) || 100;
      
      if (!ip) {
        res.status(400).json({ error: 'IP address required' });
        return;
      }
      
      const logs = logger.getLogsByIp(ip, limit);
      
      res.json({
        ip,
        logs,
        count: logs.length
      });
    } catch (error) {
      console.error('[AuditController] Error fetching logs by IP:', error);
      res.status(500).json({ error: 'Failed to fetch logs by IP' });
    }
  }

  /**
   * Generate security report
   */
  async getSecurityReport(req: Request, res: Response): Promise<void> {
    try {
      const report = logger.generateSecurityReport();
      
      res.json({
        report,
        generatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('[AuditController] Error generating security report:', error);
      res.status(500).json({ error: 'Failed to generate security report' });
    }
  }

  /**
   * Export all logs as JSON
   */
  async exportLogs(req: Request, res: Response): Promise<void> {
    try {
      const logsJson = logger.exportLogs();
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="audit-logs-${Date.now()}.json"`);
      res.send(logsJson);
    } catch (error) {
      console.error('[AuditController] Error exporting logs:', error);
      res.status(500).json({ error: 'Failed to export logs' });
    }
  }
}

export default new AuditController();
