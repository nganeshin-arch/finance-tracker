import { useState, useEffect, useCallback } from 'react';
import { userService } from '../services';
import { getApiErrorMessage } from '../services/api';
import { UserSummary, UserStats } from '../types';

export const useUsers = () => {
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (err: any) {
      const errorMessage = getApiErrorMessage(err);
      setError(errorMessage);
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    fetchUsers,
  };
};

export const useUserStats = (userId: number | null) => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!userId) {
      setStats(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await userService.getUserStats(userId);
      setStats(data);
    } catch (err: any) {
      const errorMessage = getApiErrorMessage(err);
      setError(errorMessage);
      console.error('Failed to fetch user stats:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    fetchStats,
  };
};
