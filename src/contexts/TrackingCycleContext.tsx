import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { trackingCycleService } from '../services';
import { getApiErrorMessage } from '../services/api';
import {
  TrackingCycle,
  CreateTrackingCycleDTO,
  UpdateTrackingCycleDTO,
} from '../types';

interface TrackingCycleContextType {
  trackingCycles: TrackingCycle[];
  activeTrackingCycle: TrackingCycle | null;
  loading: boolean;
  error: string | null;
  fetchTrackingCycles: () => Promise<void>;
  fetchActiveTrackingCycle: () => Promise<void>;
  createTrackingCycle: (data: CreateTrackingCycleDTO) => Promise<TrackingCycle>;
  updateTrackingCycle: (id: number, data: UpdateTrackingCycleDTO) => Promise<TrackingCycle>;
  deleteTrackingCycle: (id: number) => Promise<void>;
}

const TrackingCycleContext = createContext<TrackingCycleContextType | undefined>(undefined);

export const useTrackingCycleContext = () => {
  const context = useContext(TrackingCycleContext);
  if (!context) {
    throw new Error('useTrackingCycleContext must be used within a TrackingCycleProvider');
  }
  return context;
};

interface TrackingCycleProviderProps {
  children: ReactNode;
}

export const TrackingCycleProvider: React.FC<TrackingCycleProviderProps> = ({ children }) => {
  const [trackingCycles, setTrackingCycles] = useState<TrackingCycle[]>([]);
  const [activeTrackingCycle, setActiveTrackingCycle] = useState<TrackingCycle | null>(null);
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
      console.error('Error fetching tracking cycles:', err);
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
      console.error('Error fetching active tracking cycle:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createTrackingCycle = async (data: CreateTrackingCycleDTO): Promise<TrackingCycle> => {
    setLoading(true);
    setError(null);
    try {
      const newCycle = await trackingCycleService.createTrackingCycle(data);
      setTrackingCycles((prev) => [...prev, newCycle]);
      return newCycle;
    } catch (err: any) {
      const errorMessage = getApiErrorMessage(err);
      setError(errorMessage);
      console.error('Error creating tracking cycle:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTrackingCycle = async (
    id: number,
    data: UpdateTrackingCycleDTO
  ): Promise<TrackingCycle> => {
    setLoading(true);
    setError(null);
    try {
      const updatedCycle = await trackingCycleService.updateTrackingCycle(id, data);
      setTrackingCycles((prev) => prev.map((c) => (c.id === id ? updatedCycle : c)));
      if (updatedCycle.isActive) {
        setActiveTrackingCycle(updatedCycle);
      }
      return updatedCycle;
    } catch (err: any) {
      const errorMessage = getApiErrorMessage(err);
      setError(errorMessage);
      console.error('Error updating tracking cycle:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteTrackingCycle = async (id: number): Promise<void> => {
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
      console.error('Error deleting tracking cycle:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrackingCycles();
    fetchActiveTrackingCycle();
  }, [fetchTrackingCycles, fetchActiveTrackingCycle]);

  const value: TrackingCycleContextType = {
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

  return (
    <TrackingCycleContext.Provider value={value}>
      {children}
    </TrackingCycleContext.Provider>
  );
};
