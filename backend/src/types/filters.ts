/**
 * Filter and query parameter types
 */

// Transaction filters
export interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  trackingCycleId?: number;
  transactionTypeId?: number;
  categoryId?: number;
  accountId?: number;
}

// Category filters
export interface CategoryFilters {
  transactionTypeId?: number;
}

// Sub-category filters
export interface SubCategoryFilters {
  categoryId?: number;
}

// Dashboard filters
export interface DashboardFilters {
  trackingCycleId?: number;
  startDate?: string;
  endDate?: string;
}

// Pagination parameters
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Query parameters combining filters and pagination
export interface TransactionQueryParams extends TransactionFilters, PaginationParams {}
