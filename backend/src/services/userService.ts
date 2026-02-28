import userRepository, { UserSummary, UserStats } from '../repositories/userRepository';
import { User } from '../types/models';
import { NotFoundError, ForbiddenError } from '../utils/errors';

/**
 * Service layer for user management business logic (admin only)
 */
export class UserService {
  /**
   * Get all users with transaction statistics
   * Admin only - requires role check in controller
   * Requirements: 8.1, 8.2
   */
  async getAllUsers(): Promise<UserSummary[]> {
    return await userRepository.findAll();
  }

  /**
   * Get detailed statistics for a specific user
   * Admin only - requires role check in controller
   * Requirements: 8.3
   */
  async getUserStats(userId: number): Promise<UserStats> {
    // Verify user exists
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError(`User with ID ${userId} not found`);
    }

    // Get statistics
    return await userRepository.getUserStats(userId);
  }

  /**
   * Get user by ID
   * Admin only - requires role check in controller
   * Requirements: 8.1
   */
  async getUserById(userId: number): Promise<User> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError(`User with ID ${userId} not found`);
    }
    return user;
  }

  /**
   * Verify that the requesting user has admin role
   * Throws ForbiddenError if not admin
   */
  verifyAdminAccess(role: string): void {
    if (role !== 'admin') {
      throw new ForbiddenError('Admin access required');
    }
  }
}

export default new UserService();
