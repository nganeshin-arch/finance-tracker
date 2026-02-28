import pool from '../config/database';
import { User } from '../types/models';
import { NotFoundError, ConflictError } from '../utils/errors';

/**
 * Repository for authentication data access
 */
export class AuthRepository {
  /**
   * Find user by email (includes password_hash for authentication)
   * This is the ONLY method that retrieves password_hash
   */
  async findUserByEmailWithPassword(email: string): Promise<{ user: User; passwordHash: string } | null> {
    try {
      const query = `
        SELECT 
          id, 
          username, 
          email, 
          password_hash,
          role, 
          created_at as "createdAt", 
          updated_at as "updatedAt"
        FROM users
        WHERE email = $1
      `;
      
      const result = await pool.query(query, [email]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      const row = result.rows[0];
      
      return {
        user: {
          id: row.id,
          username: row.username,
          email: row.email,
          role: row.role,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt
        },
        passwordHash: row.password_hash
      };
    } catch (error) {
      console.error('[AuthRepository] Error finding user by email with password:', error);
      throw new Error('Failed to retrieve user data');
    }
  }

  /**
   * Find user by email (WITHOUT password_hash)
   * Use this for general user lookups
   */
  async findUserByEmail(email: string): Promise<User | null> {
    try {
      const query = `
        SELECT 
          id, 
          username, 
          email, 
          role, 
          created_at as "createdAt", 
          updated_at as "updatedAt"
        FROM users
        WHERE email = $1
      `;
      
      const result = await pool.query(query, [email]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return result.rows[0];
    } catch (error) {
      console.error('[AuthRepository] Error finding user by email:', error);
      throw new Error('Failed to retrieve user data');
    }
  }

  /**
   * Find user by ID (WITHOUT password_hash)
   */
  async findUserById(id: number): Promise<User | null> {
    try {
      const query = `
        SELECT 
          id, 
          username, 
          email, 
          role, 
          created_at as "createdAt", 
          updated_at as "updatedAt"
        FROM users
        WHERE id = $1
      `;
      
      const result = await pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return result.rows[0];
    } catch (error) {
      console.error('[AuthRepository] Error finding user by ID:', error);
      throw new Error('Failed to retrieve user data');
    }
  }

  /**
   * Check if a user with the given email already exists
   */
  async existsByEmail(email: string): Promise<boolean> {
    try {
      const query = `
        SELECT COUNT(*) as count
        FROM users
        WHERE LOWER(email) = LOWER($1)
      `;
      
      const result = await pool.query(query, [email]);
      return parseInt(result.rows[0].count) > 0;
    } catch (error) {
      console.error('[AuthRepository] Error checking if email exists:', error);
      throw new Error('Failed to check email availability');
    }
  }

  /**
   * Create a new user with email and hashed password
   */
  async createUser(email: string, passwordHash: string, username: string, role: 'user' | 'admin' = 'user'): Promise<User> {
    try {
      // Check for duplicate email
      const exists = await this.existsByEmail(email);
      if (exists) {
        throw new ConflictError(`User with email "${email}" already exists`);
      }
      
      const query = `
        INSERT INTO users (username, email, password_hash, role)
        VALUES ($1, $2, $3, $4)
        RETURNING 
          id, 
          username, 
          email, 
          role, 
          created_at as "createdAt", 
          updated_at as "updatedAt"
      `;
      
      const result = await pool.query(query, [username, email, passwordHash, role]);
      return result.rows[0];
    } catch (error) {
      if (error instanceof ConflictError) {
        throw error;
      }
      console.error('[AuthRepository] Error creating user:', error);
      throw new Error('Failed to create user account');
    }
  }
}

export default new AuthRepository();
