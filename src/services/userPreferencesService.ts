import api from './api';
import { UserPreferences } from '../types/models';

export interface UpdateUserPreferencesRequest {
  monthlyStartDate?: number;
  timezone?: string;
  currency?: string;
  dateFormat?: string;
}

class UserPreferencesService {
  /**
   * Get current user's preferences
   */
  async getUserPreferences(): Promise<UserPreferences> {
    const response = await api.get('/users/preferences');
    return response.data;
  }

  /**
   * Update current user's preferences
   */
  async updateUserPreferences(updates: UpdateUserPreferencesRequest): Promise<UserPreferences> {
    const response = await api.put('/users/preferences', updates);
    return response.data;
  }
}

export default new UserPreferencesService();