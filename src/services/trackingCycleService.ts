import api from './api';
import {
  TrackingCycle,
  CreateTrackingCycleDTO,
  UpdateTrackingCycleDTO,
} from '../types';

export const trackingCycleService = {
  // Get all tracking cycles
  getTrackingCycles: async (): Promise<TrackingCycle[]> => {
    const response = await api.get('/tracking-cycles');
    return response.data;
  },

  // Get active tracking cycle
  getActiveTrackingCycle: async (): Promise<TrackingCycle | null> => {
    const response = await api.get('/tracking-cycles/active');
    return response.data;
  },

  // Get tracking cycle by ID
  getTrackingCycleById: async (id: number): Promise<TrackingCycle> => {
    const response = await api.get(`/tracking-cycles/${id}`);
    return response.data;
  },

  // Create new tracking cycle
  createTrackingCycle: async (
    data: CreateTrackingCycleDTO
  ): Promise<TrackingCycle> => {
    const response = await api.post('/tracking-cycles', data);
    return response.data;
  },

  // Update tracking cycle
  updateTrackingCycle: async (
    id: number,
    data: UpdateTrackingCycleDTO
  ): Promise<TrackingCycle> => {
    const response = await api.put(`/tracking-cycles/${id}`, data);
    return response.data;
  },

  // Delete tracking cycle
  deleteTrackingCycle: async (id: number): Promise<void> => {
    await api.delete(`/tracking-cycles/${id}`);
  },
};
