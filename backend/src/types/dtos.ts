/**
 * Data Transfer Objects (DTOs) for API requests and responses
 */

import { TrackingCycle } from './models';

// Tracking Cycle DTOs
export interface CreateTrackingCycleDTO {
  name: string;
  startDate: string;
  endDate: string;
}

export interface UpdateTrackingCycleDTO extends Partial<CreateTrackingCycleDTO> {
  isActive?: boolean;
}

// Transaction DTOs
export interface CreateTransactionDTO {
  trackingCycleId?: number;
  date: string;
  transactionTypeId: number;
  categoryId: number;
  subCategoryId: number;
  paymentModeId: number;
  accountId: number;
  amount: number;
  description?: string;
}

export interface UpdateTransactionDTO extends Partial<CreateTransactionDTO> {}

// Configuration DTOs
export interface CreateTransactionTypeDTO {
  name: string;
}

export interface CreateCategoryDTO {
  name: string;
  transactionTypeId: number;
}

export interface UpdateCategoryDTO {
  name?: string;
  transactionTypeId?: number;
}

export interface CreateSubCategoryDTO {
  name: string;
  categoryId: number;
}

export interface UpdateSubCategoryDTO {
  name?: string;
  categoryId?: number;
}

export interface CreatePaymentModeDTO {
  name: string;
}

export interface CreateAccountDTO {
  name: string;
}

// Dashboard DTOs
export interface DashboardSummary {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  period: {
    startDate: string;
    endDate: string;
  };
  trackingCycle?: TrackingCycle;
}

export interface ExpenseByCategory {
  categoryId: number;
  categoryName: string;
  amount: number;
  percentage: number;
}

export interface MonthlyTrend {
  month: string;
  income: number;
  expenses: number;
}
