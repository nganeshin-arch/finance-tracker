// Core Models
export interface TrackingCycle {
  id: number;
  name: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  id: number;
  userId: number;
  monthlyStartDate: number; // Day of month (1-31)
  timezone: string;
  currency: string;
  dateFormat: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSummary {
  id: number;
  email: string;
  role: 'user' | 'admin';
  createdAt: Date;
  transactionCount: number;
  lastTransactionDate: Date | null;
}

export interface UserStats {
  totalTransactions: number;
  totalIncome: number;
  totalExpense: number;
  firstTransactionDate: Date | null;
  lastTransactionDate: Date | null;
}

export interface TransactionType {
  id: number;
  name: string;
  createdAt: Date;
}

export interface Category {
  id: number;
  name: string;
  transactionTypeId: number;
  transactionType?: TransactionType;
  createdAt: Date;
}

export interface SubCategory {
  id: number;
  name: string;
  categoryId: number;
  category?: Category;
  createdAt: Date;
}

export interface PaymentMode {
  id: number;
  name: string;
  createdAt: Date;
}

export interface Account {
  id: number;
  name: string;
  createdAt: Date;
}

export interface Transaction {
  id: number;
  trackingCycleId?: number;
  userId?: number;
  date: Date;
  transactionTypeId: number;
  categoryId: number;
  subCategoryId: number;
  paymentModeId: number;
  accountId: number;
  amount: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  // Populated relations
  trackingCycle?: TrackingCycle;
  user?: User;
  transactionType?: TransactionType;
  category?: Category;
  subCategory?: SubCategory;
  paymentMode?: PaymentMode;
  account?: Account;
}
