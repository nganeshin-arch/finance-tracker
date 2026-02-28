/**
 * Security and audit logging utility
 * Provides structured logging for security events, data access, and authorization attempts
 */

export enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  SECURITY = 'SECURITY'
}

export enum LogAction {
  READ = 'READ',
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  AUTH_FAILED = 'AUTH_FAILED',
  ACCESS_DENIED = 'ACCESS_DENIED',
  RATE_LIMIT = 'RATE_LIMIT'
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  action: LogAction;
  userId?: number;
  resource?: string;
  resourceId?: string | number;
  method?: string;
  path?: string;
  ip?: string;
  userAgent?: string;
  message?: string;
  error?: string;
  metadata?: Record<string, any>;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogsInMemory = 1000;

  /**
   * Log a security event
   */
  logSecurityEvent(entry: Omit<LogEntry, 'timestamp' | 'level'>): void {
    const logEntry: LogEntry = {
      ...entry,
      timestamp: new Date().toISOString(),
      level: LogLevel.SECURITY
    };

    this.addLog(logEntry);
    this.writeToConsole(logEntry);
  }

  /**
   * Log data access attempt
   */
  logDataAccess(
    action: LogAction,
    userId: number,
    resource: string,
    resourceId?: string | number,
    metadata?: Record<string, any>
  ): void {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel.INFO,
      action,
      userId,
      resource,
      resourceId,
      metadata
    };

    this.addLog(logEntry);
    this.writeToConsole(logEntry);
  }

  /**
   * Log failed authorization attempt
   */
  logAuthorizationFailure(
    userId: number | undefined,
    resource: string,
    action: LogAction,
    reason: string,
    ip?: string,
    userAgent?: string
  ): void {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel.WARN,
      action: LogAction.ACCESS_DENIED,
      userId,
      resource,
      message: reason,
      ip,
      userAgent
    };

    this.addLog(logEntry);
    this.writeToConsole(logEntry);
  }

  /**
   * Log authentication failure
   */
  logAuthenticationFailure(
    email: string,
    reason: string,
    ip?: string,
    userAgent?: string
  ): void {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel.WARN,
      action: LogAction.AUTH_FAILED,
      message: `Authentication failed for ${email}: ${reason}`,
      ip,
      userAgent,
      metadata: { email }
    };

    this.addLog(logEntry);
    this.writeToConsole(logEntry);
  }

  /**
   * Log rate limit violation
   */
  logRateLimitViolation(
    ip: string,
    path: string,
    userId?: number
  ): void {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel.WARN,
      action: LogAction.RATE_LIMIT,
      userId,
      path,
      ip,
      message: `Rate limit exceeded for ${ip} on ${path}`
    };

    this.addLog(logEntry);
    this.writeToConsole(logEntry);
  }

  /**
   * Get recent logs (for analysis)
   */
  getRecentLogs(limit: number = 100): LogEntry[] {
    return this.logs.slice(-limit);
  }

  /**
   * Get logs by user
   */
  getLogsByUser(userId: number, limit: number = 100): LogEntry[] {
    return this.logs
      .filter(log => log.userId === userId)
      .slice(-limit);
  }

  /**
   * Get failed authorization attempts
   */
  getFailedAuthorizationAttempts(limit: number = 100): LogEntry[] {
    return this.logs
      .filter(log => log.action === LogAction.ACCESS_DENIED)
      .slice(-limit);
  }

  /**
   * Get logs by IP address
   */
  getLogsByIp(ip: string, limit: number = 100): LogEntry[] {
    return this.logs
      .filter(log => log.ip === ip)
      .slice(-limit);
  }

  /**
   * Clear old logs to prevent memory overflow
   */
  private addLog(entry: LogEntry): void {
    this.logs.push(entry);
    
    // Keep only recent logs in memory
    if (this.logs.length > this.maxLogsInMemory) {
      this.logs = this.logs.slice(-this.maxLogsInMemory);
    }
  }

  /**
   * Write log to console with formatting
   */
  private writeToConsole(entry: LogEntry): void {
    const prefix = `[${entry.level}] [${entry.action}]`;
    const userInfo = entry.userId ? `User ${entry.userId}` : 'Anonymous';
    const resourceInfo = entry.resource 
      ? `${entry.resource}${entry.resourceId ? `/${entry.resourceId}` : ''}`
      : '';
    
    let message = `${prefix} ${entry.timestamp} - ${userInfo}`;
    
    if (resourceInfo) {
      message += ` - ${resourceInfo}`;
    }
    
    if (entry.message) {
      message += ` - ${entry.message}`;
    }

    if (entry.ip) {
      message += ` [IP: ${entry.ip}]`;
    }

    // Use appropriate console method based on level
    switch (entry.level) {
      case LogLevel.ERROR:
        console.error(message, entry.error || '');
        break;
      case LogLevel.WARN:
      case LogLevel.SECURITY:
        console.warn(message);
        break;
      default:
        console.log(message);
    }
  }

  /**
   * Export logs as JSON (for external analysis tools)
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Generate security report
   */
  generateSecurityReport(): {
    totalLogs: number;
    failedAuthorizations: number;
    failedAuthentications: number;
    rateLimitViolations: number;
    uniqueUsers: number;
    uniqueIPs: number;
    recentFailures: LogEntry[];
  } {
    const failedAuthorizations = this.logs.filter(
      log => log.action === LogAction.ACCESS_DENIED
    );
    const failedAuthentications = this.logs.filter(
      log => log.action === LogAction.AUTH_FAILED
    );
    const rateLimitViolations = this.logs.filter(
      log => log.action === LogAction.RATE_LIMIT
    );

    const uniqueUsers = new Set(
      this.logs.filter(log => log.userId).map(log => log.userId)
    ).size;

    const uniqueIPs = new Set(
      this.logs.filter(log => log.ip).map(log => log.ip)
    ).size;

    const recentFailures = [
      ...failedAuthorizations,
      ...failedAuthentications,
      ...rateLimitViolations
    ]
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
      .slice(0, 20);

    return {
      totalLogs: this.logs.length,
      failedAuthorizations: failedAuthorizations.length,
      failedAuthentications: failedAuthentications.length,
      rateLimitViolations: rateLimitViolations.length,
      uniqueUsers,
      uniqueIPs,
      recentFailures
    };
  }
}

// Export singleton instance
export const logger = new Logger();
