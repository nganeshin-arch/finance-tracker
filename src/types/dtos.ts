// DTOs for API requests and responses
export interface CreateTrackingCycleDTO {
  name: string;
  startDate: string;
  endDate: string;
}

export interface UpdateTrackingCycleDTO extends Partial<CreateTrackingCycleDTO> {
  isActive?: boolean;
}

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

export interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  trackingCycleId?: number;
  transactionTypeId?: number;
  categoryId?: number;
  accountId?: number;
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
  trackingCycle?: {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
  };
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
