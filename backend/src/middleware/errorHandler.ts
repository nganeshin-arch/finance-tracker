import { Request, Response, NextFunction } from 'express';
import { ValidationError, NotFoundError, ConflictError, ForbiddenError } from '../utils/errors';

/**
 * Global error handling middleware
 */
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Error:', err);

  if (err instanceof ValidationError) {
    res.status(400).json({
      error: 'Validation Error',
      details: err.details
    });
    return;
  }

  if (err instanceof NotFoundError) {
    res.status(404).json({
      error: 'Resource Not Found',
      message: err.message
    });
    return;
  }

  if (err instanceof ForbiddenError) {
    res.status(403).json({
      error: 'Forbidden',
      message: err.message
    });
    return;
  }

  if (err instanceof ConflictError) {
    res.status(409).json({
      error: 'Conflict',
      message: err.message
    });
    return;
  }

  // Default to 500 server error
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
  });
};
