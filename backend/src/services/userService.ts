import userRepository, { UserSummary, UserStats } from '../repositories/userRepository';
import { User, UserPreferences } from '../types/models';
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
   * Get user preferences
   * Returns default preferences if none exist
   */
  async getUserPreferences(userId: number): Promise<UserPreferences> {
    // Verify user exists
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError(`User with ID ${userId} not found`);
    }

    let preferences = await userRepository.getUserPreferences(userId);
    
    // Create default preferences if none exist
    if (!preferences) {
      const defaultPreferences = {
        userId,
        monthlyStartDate: 1, // Default to 1st of month
        timezone: 'Asia/Kolkata',
        currency: 'INR',
        dateFormat: 'DD/MM/YYYY'
      };
      
      preferences = await userRepository.createUserPreferences(defaultPreferences);
    }
    
    return preferences;
  }

  /**
   * Update user preferences
   */
  async updateUserPreferences(
    userId: number, 
    updates: Partial<Pick<UserPreferences, 'monthlyStartDate' | 'timezone' | 'currency' | 'dateFormat'>>
  ): Promise<UserPreferences> {
    // Verify user exists
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError(`User with ID ${userId} not found`);
    }

    // Get existing preferences or create defaults
    let preferences = await userRepository.getUserPreferences(userId);
    
    if (!preferences) {
      // Create new preferences with updates
      const defaultPreferences = {
        userId,
        monthlyStartDate: updates.monthlyStartDate ?? 1,
        timezone: updates.timezone ?? 'Asia/Kolkata',
        currency: updates.currency ?? 'INR',
        dateFormat: updates.dateFormat ?? 'DD/MM/YYYY'
      };
      
      return await userRepository.createUserPreferences(defaultPreferences);
    } else {
      // Update existing preferences
      return await userRepository.updateUserPreferences(userId, updates);
    }
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
