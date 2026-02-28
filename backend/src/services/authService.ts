import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ValidationError } from '../utils/errors';

/**
 * Token payload interface
 */
export interface TokenPayload {
  userId: number;
  role: 'user' | 'admin';
  iat: number;
  exp: number;
}

/**
 * Service layer for authentication business logic
 */
export class AuthService {
  private readonly saltRounds: number;
  private readonly jwtSecret: string;
  private readonly jwtExpiration: string | number;

  constructor() {
    // Get configuration from environment variables
    this.saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '10', 10);
    this.jwtSecret = process.env.JWT_SECRET || '';
    this.jwtExpiration = process.env.JWT_EXPIRATION || '7d';

    // Validate JWT secret is configured
    if (!this.jwtSecret) {
      throw new Error('JWT_SECRET environment variable is not configured');
    }
  }

  /**
   * Hash a password using bcrypt
   * @param password - Plain text password to hash
   * @returns Hashed password
   */
  async hashPassword(password: string): Promise<string> {
    try {
      if (!password || password.length < 8) {
        throw new ValidationError([
          { field: 'password', message: 'Password must be at least 8 characters' }
        ]);
      }

      return await bcrypt.hash(password, this.saltRounds);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      console.error('[AuthService] Error hashing password:', error);
      throw new Error('Failed to hash password');
    }
  }

  /**
   * Compare a plain text password with a hashed password
   * @param password - Plain text password
   * @param hash - Hashed password to compare against
   * @returns True if passwords match, false otherwise
   */
  async comparePassword(password: string, hash: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      console.error('[AuthService] Error comparing password:', error);
      throw new Error('Failed to verify password');
    }
  }

  /**
   * Generate a JWT token for a user
   * @param userId - User ID
   * @param role - User role ('user' or 'admin')
   * @returns JWT token string
   */
  generateToken(userId: number, role: 'user' | 'admin'): string {
    try {
      const payload = {
        userId,
        role
      };

      return jwt.sign(payload, this.jwtSecret, {
        expiresIn: this.jwtExpiration
      } as jwt.SignOptions);
    } catch (error) {
      console.error('[AuthService] Error generating token:', error);
      throw new Error('Failed to generate authentication token');
    }
  }

  /**
   * Verify and decode a JWT token
   * @param token - JWT token to verify
   * @returns Decoded token payload
   * @throws Error if token is invalid or expired
   */
  verifyToken(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as TokenPayload;
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        console.error('[AuthService] Token expired:', error.message);
        throw new Error('Session expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        console.error('[AuthService] Invalid token:', error.message);
        throw new Error('Invalid token');
      }
      console.error('[AuthService] Token verification failed:', error);
      throw new Error('Token verification failed');
    }
  }

  /**
   * Validate email format
   * @param email - Email address to validate
   * @returns True if email format is valid
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password requirements
   * @param password - Password to validate
   * @throws ValidationError if password doesn't meet requirements
   */
  validatePassword(password: string): void {
    const errors: Array<{ field: string; message: string }> = [];

    if (!password) {
      errors.push({ field: 'password', message: 'Password is required' });
    } else if (password.length < 8) {
      errors.push({ field: 'password', message: 'Password must be at least 8 characters' });
    }

    if (errors.length > 0) {
      throw new ValidationError(errors);
    }
  }
}

export default new AuthService();
