import { useState, useEffect, useCallback } from 'react';
import { trackingCycleService } from '../services';
import { getApiErrorMessage } from '../services/api';
import {
  TrackingCycle,
  CreateTrackingCycleDTO,
  UpdateTrackingCycleDTO,
} from '../types';

export const useTrackingCycles = () => {
  const [trackingCycles, setTrackingCycles] = useState<TrackingCycle[]>([]);
  const [activeTrackingCycle, setActiveTrackingCycle] =
    useState<TrackingCycle | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrackingCycles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await trackingCycleService.getTrackingCycles();
      setTrackingCycles(data);
    } catch (err: any) {
      const errorMessage = getApiErrorMessage(err);
      setError(errorMessage);
      console.error('Failed to fetch tracking cycles:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchActiveTrackingCycle = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await trackingCycleService.getActiveTrackingCycle();
      setActiveTrackingCycle(data);
    } catch (err: any) {
      const errorMessage = getApiErrorMessage(err);
      setError(errorMessage);
      console.error('Failed to fetch active tracking cycle:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createTrackingCycle = async (data: CreateTrackingCycleDTO) => {
    setLoading(true);
    setError(null);
    try {
      const newCycle = await trackingCycleService.createTrackingCycle(data);
      setTrackingCycles((prev) => [...prev, newCycle]);
      return newCycle;
    } catch (err: any) {
      const errorMessage = getApiErrorMessage(err);
      setError(errorMessage);
      console.error('Failed to create tracking cycle:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTrackingCycle = async (
    id: number,
    data: UpdateTrackingCycleDTO
  ) => {
    setLoading(true);
    setError(null);
    try {
      const updatedCycle = await trackingCycleService.updateTrackingCycle(
        id,
        data
      );
      setTrackingCycles((prev) =>
        prev.map((c) => (c.id === id ? updatedCycle : c))
      );
      if (updatedCycle.isActive) {
        setActiveTrackingCycle(updatedCycle);
      }
      return updatedCycle;
    } catch (err: any) {
      const errorMessage = getApiErrorMessage(err);
      setError(errorMessage);
      console.error('Failed to update tracking cycle:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteTrackingCycle = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await trackingCycleService.deleteTrackingCycle(id);
      setTrackingCycles((prev) => prev.filter((c) => c.id !== id));
      if (activeTrackingCycle?.id === id) {
        setActiveTrackingCycle(null);
      }
    } catch (err: any) {
      const errorMessage = getApiErrorMessage(err);
      setError(errorMessage);
      console.error('Failed to delete tracking cycle:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrackingCycles();
    fetchActiveTrackingCycle();
  }, [fetchTrackingCycles, fetchActiveTrackingCycle]);

  return {
    trackingCycles,
    activeTrackingCycle,
    loading,
    error,
    fetchTrackingCycles,
    fetchActiveTrackingCycle,
    createTrackingCycle,
    updateTrackingCycle,
    deleteTrackingCycle,
  };
};
