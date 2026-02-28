import api from './api';
import { UserSummary, UserStats } from '../types';

export const userService = {
  // Get all users (admin only)
  getAllUsers: async (): Promise<UserSummary[]> => {
    const response = await api.get('/users');
    return response.data;
  },

  // Get user statistics (admin only)
  getUserStats: async (userId: number): Promise<UserStats> => {
    const response = await api.get(`/users/${userId}/stats`);
    return response.data;
  },
};
