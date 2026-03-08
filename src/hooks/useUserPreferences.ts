import { useState, useEffect } from 'react';
import { UserPreferences } from '../types/models';
import userPreferencesService, { UpdateUserPreferencesRequest } from '../services/userPreferencesService';

export const useUserPreferences = () => {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user preferences
  const fetchPreferences = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userPreferencesService.getUserPreferences();
      setPreferences(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch preferences');
      console.error('Error fetching user preferences:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update user preferences
  const updatePreferences = async (updates: UpdateUserPreferencesRequest) => {
    try {
      setError(null);
      const updatedPreferences = await userPreferencesService.updateUserPreferences(updates);
      setPreferences(updatedPreferences);
      return updatedPreferences;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update preferences');
      console.error('Error updating user preferences:', err);
      throw err;
    }
  };

  // Load preferences on mount
  useEffect(() => {
    fetchPreferences();
  }, []);

  return {
    preferences,
    loading,
    error,
    updatePreferences,
    refetch: fetchPreferences
  };
};