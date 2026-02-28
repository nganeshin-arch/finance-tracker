import { Request, Response, NextFunction } from 'express';
const { body, validationResult } = require('express-validator');
import authService from '../services/authService';
import authRepository from '../repositories/authRepository';
import { ValidationError, ConflictError } from '../utils/errors';

/**
 * Auth response interface
 */
interface AuthResponse {
  token: string;
  user: {
    id: number;
    email: string;
    username: string;
    role: 'user' | 'admin';
  };
}

/**
 * Controller for authentication endpoints
 */
export class AuthController {
  /**
   * Validation rules for registration
   */
  validateRegister = [
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Invalid email format')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters'),
    body('username')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Username must be between 1 and 100 characters')
  ];

  /**
   * Validation rules for login
   */
  validateLogin = [
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Invalid email format')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ];

  /**
   * POST /api/auth/register
   * Register a new user
   */
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const validationErrors = errors.array().map((err: any) => ({
          field: err.type === 'field' ? err.path : 'unknown',
          message: err.msg
        }));
        throw new ValidationError(validationErrors);
      }

      const { email, password, username } = req.body;

      // Use email as username if username not provided
      const finalUsername = username || email.split('@')[0];

      // Check if user already exists
      const existingUser = await authRepository.findUserByEmail(email);
      if (existingUser) {
        console.warn(`[AuthController] Registration attempt with existing email: ${email}`);
        throw new ConflictError('Email already registered');
      }

      // Hash password
      const passwordHash = await authService.hashPassword(password);

      // Create user with 'user' role by default
      const user = await authRepository.createUser(email, passwordHash, finalUsername, 'user');

      console.log(`[AuthController] User registered successfully: ${user.email} (ID: ${user.id})`);

      // Generate JWT token
      const token = authService.generateToken(user.id, user.role);

      // Prepare response
      const response: AuthResponse = {
        token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role
        }
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('[AuthController] Registration error:', error);
      next(error);
    }
  }

  /**
   * POST /api/auth/login
   * Login user with email and password
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const validationErrors = errors.array().map((err: any) => ({
          field: err.type === 'field' ? err.path : 'unknown',
          message: err.msg
        }));
        throw new ValidationError(validationErrors);
      }

      const { email, password } = req.body;

      // Find user by email (with password hash)
      const result = await authRepository.findUserByEmailWithPassword(email);
      
      // Generic error message to avoid revealing if email exists
      if (!result) {
        console.warn(`[AuthController] Login attempt with non-existent email: ${email}`);
        res.status(401).json({
          error: 'Invalid email or password'
        });
        return;
      }

      const { user, passwordHash } = result;

      // Verify password
      const isPasswordValid = await authService.comparePassword(password, passwordHash);
      
      if (!isPasswordValid) {
        console.warn(`[AuthController] Failed login attempt for user: ${email}`);
        res.status(401).json({
          error: 'Invalid email or password'
        });
        return;
      }

      console.log(`[AuthController] User logged in successfully: ${user.email} (ID: ${user.id})`);

      // Generate JWT token
      const token = authService.generateToken(user.id, user.role);

      // Prepare response
      const response: AuthResponse = {
        token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role
        }
      };

      res.json(response);
    } catch (error) {
      console.error('[AuthController] Login error:', error);
      next(error);
    }
  }

  /**
   * GET /api/auth/me
   * Get current authenticated user
   * Requires authenticateToken middleware
   */
  async getCurrentUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // User is attached to request by authenticateToken middleware
      const userId = (req as any).user?.userId;

      if (!userId) {
        console.warn('[AuthController] getCurrentUser called without authenticated user');
        res.status(401).json({
          error: 'Not authenticated'
        });
        return;
      }

      // Fetch user from database
      const user = await authRepository.findUserById(userId);

      if (!user) {
        console.error(`[AuthController] User not found for ID: ${userId}`);
        res.status(404).json({
          error: 'User not found'
        });
        return;
      }

      // Return user data (without password hash)
      res.json({
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role
      });
    } catch (error) {
      console.error('[AuthController] Error getting current user:', error);
      next(error);
    }
  }
}

export default new AuthController();
