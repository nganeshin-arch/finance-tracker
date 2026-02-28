import api from './api';
import { DashboardSummary, ExpenseByCategory, MonthlyTrend } from '../types';

export const dashboardService = {
  // Get dashboard summary
  getSummary: async (trackingCycleId?: number): Promise<DashboardSummary> => {
    const params = trackingCycleId ? { trackingCycleId } : {};
    const response = await api.get('/dashboard/summary', { params });
    return response.data;
  },

  // Get expenses by category
  getExpensesByCategory: async (
    trackingCycleId?: number
  ): Promise<ExpenseByCategory[]> => {
    const params = trackingCycleId ? { trackingCycleId } : {};
    const response = await api.get('/dashboard/expenses-by-category', { params });
    return response.data;
  },

  // Get monthly trend
  getMonthlyTrend: async (): Promise<MonthlyTrend[]> => {
    const response = await api.get('/dashboard/monthly-trend');
    return response.data;
  },
};
