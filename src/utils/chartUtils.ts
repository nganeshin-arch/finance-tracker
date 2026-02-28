import { Transaction } from '../types/models';

/**
 * Chart data point interface for pie chart visualization
 */
export interface ChartDataPoint {
  name: string;        // Category name
  value: number;       // Total amount for category
  color: string;       // Assigned color from palette
  percentage: number;  // Calculated percentage
}

/**
 * Validates that a transaction has the required fields for chart processing
 * @param transaction - Transaction to validate
 * @returns true if transaction is valid, false otherwise
 */
function isValidTransaction(transaction: Transaction): boolean {
  return (
    transaction.amount !== undefined &&
    transaction.amount >= 0 &&
    transaction.transactionType?.name !== undefined &&
    transaction.category?.name !== undefined
  );
}

/**
 * Aggregates transactions by category and calculates totals and percentages
 * Time complexity: O(n) where n is the number of transactions
 * Space complexity: O(m) where m is the number of unique categories
 * 
 * Performance optimizations:
 * - Uses Map for O(1) lookups and insertions
 * - Single pass through transactions array
 * - Efficient sorting only on final result set
 * 
 * @param transactions - Array of transactions to aggregate
 * @returns Array of chart data points sorted by value (descending)
 */
export function aggregateByCategory(
  transactions: Transaction[]
): ChartDataPoint[] {
  // Validate input
  if (!Array.isArray(transactions) || transactions.length === 0) {
    return [];
  }

  // Filter out invalid transactions and log warnings
  const validTransactions = transactions.filter(transaction => {
    const isValid = isValidTransaction(transaction);
    if (!isValid) {
      console.warn('Invalid transaction found during aggregation:', transaction);
    }
    return isValid;
  });

  if (validTransactions.length === 0) {
    return [];
  }

  // Aggregate amounts by category using Map for O(1) lookups
  // This ensures O(n) time complexity for the aggregation
  const categoryMap = new Map<string, number>();
  
  // Single pass through transactions - O(n)
  for (const transaction of validTransactions) {
    const categoryName = transaction.category?.name || 'Uncategorized';
    const currentAmount = categoryMap.get(categoryName) || 0;
    categoryMap.set(categoryName, currentAmount + transaction.amount);
  }

  // Calculate total for percentage calculation - O(m) where m = number of categories
  const total = Array.from(categoryMap.values()).reduce((sum, val) => sum + val, 0);

  // Handle edge case where total is 0
  if (total === 0) {
    return [];
  }

  // Transform to chart data format - O(m)
  const chartData = Array.from(categoryMap.entries()).map(([name, value]) => ({
    name,
    value,
    percentage: (value / total) * 100,
    color: '', // Will be assigned by assignColors function
  }));

  // Sort by value descending (largest categories first) - O(m log m)
  // Overall complexity: O(n + m log m), which simplifies to O(n) when m << n
  return chartData.sort((a, b) => b.value - a.value);
}

/**
 * Assigns colors from a palette to chart data points
 * Colors are assigned cyclically if there are more data points than colors
 * 
 * @param data - Array of chart data points
 * @param colorPalette - Array of color hex codes
 * @returns Array of chart data points with colors assigned
 */
export function assignColors(
  data: ChartDataPoint[],
  colorPalette: string[]
): ChartDataPoint[] {
  // Validate inputs
  if (!Array.isArray(data) || data.length === 0) {
    return [];
  }

  if (!Array.isArray(colorPalette) || colorPalette.length === 0) {
    console.warn('Empty color palette provided, using default color');
    const defaultColor = '#6b7280'; // gray-500
    return data.map(point => ({ ...point, color: defaultColor }));
  }

  // Assign colors cyclically
  return data.map((point, index) => ({
    ...point,
    color: colorPalette[index % colorPalette.length],
  }));
}

/**
 * Validates an array of transactions for chart processing
 * @param transactions - Array of transactions to validate
 * @returns true if all transactions are valid, false otherwise
 */
export function validateTransactions(transactions: Transaction[]): boolean {
  if (!Array.isArray(transactions)) {
    return false;
  }

  if (transactions.length === 0) {
    return true; // Empty array is valid
  }

  return transactions.every(isValidTransaction);
}

/**
 * Filters transactions by transaction type name
 * @param transactions - Array of transactions to filter
 * @param typeName - Transaction type name to filter by (e.g., 'Income', 'Expense')
 * @returns Filtered array of transactions
 */
export function filterByTransactionType(
  transactions: Transaction[],
  typeName: string
): Transaction[] {
  if (!Array.isArray(transactions) || !typeName) {
    return [];
  }

  return transactions.filter(
    transaction => transaction.transactionType?.name === typeName
  );
}
