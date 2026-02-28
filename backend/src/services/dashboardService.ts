import dashboardRepository from '../repositories/dashboardRepository';
import trackingCycleRepository from '../repositories/trackingCycleRepository';
import { DashboardSummary, ExpenseByCategory, MonthlyTrend } from '../types/dtos';
import { ValidationError } from '../utils/errors';

/**
 * Service for dashboard analytics business logic
 */
export class DashboardService {
  /**
   * Get dashboard summary with total income, expenses, and net balance
   */
  async getSummary(userId: number, trackingCycleId?: number, startDate?: string, endDate?: string): Promise<DashboardSummary> {
    // Validate that either trackingCycleId or date range is provided
    if (!trackingCycleId && (!startDate || !endDate)) {
      throw new ValidationError([
        { field: 'query', message: 'Either trackingCycleId or both startDate and endDate must be provided' }
      ]);
    }

    // Validate date range if provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new ValidationError([
          { field: 'date', message: 'Invalid date format' }
        ]);
      }
      
      if (end < start) {
        throw new ValidationError([
          { field: 'endDate', message: 'End date must be greater than or equal to start date' }
        ]);
      }
    }

    // Get tracking cycle details if ID is provided
    let trackingCycle;
    let periodStartDate: string;
    let periodEndDate: string;

    if (trackingCycleId) {
      trackingCycle = await trackingCycleRepository.findById(trackingCycleId);
      periodStartDate = trackingCycle.startDate.toISOString().split('T')[0];
      periodEndDate = trackingCycle.endDate.toISOString().split('T')[0];
    } else {
      periodStartDate = startDate!;
      periodEndDate = endDate!;
    }

    // Get totals from repository with userId filter
    const summary = await dashboardRepository.getSummary(userId, startDate, endDate);
    
    // Calculate net balance
    const netBalance = this.calculateNetBalance(summary.totalIncome, summary.totalExpense);

    return {
      totalIncome: summary.totalIncome,
      totalExpenses: summary.totalExpense,
      netBalance,
      period: {
        startDate: periodStartDate,
        endDate: periodEndDate
      },
      trackingCycle
    };
  }

  /**
   * Get expenses grouped by category with percentages
   */
  async getExpensesByCategory(userId: number, trackingCycleId?: number, startDate?: string, endDate?: string): Promise<ExpenseByCategory[]> {
    // Validate that either trackingCycleId or date range is provided
    if (!trackingCycleId && (!startDate || !endDate)) {
      throw new ValidationError([
        { field: 'query', message: 'Either trackingCycleId or both startDate and endDate must be provided' }
      ]);
    }

    // Validate date range if provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new ValidationError([
          { field: 'date', message: 'Invalid date format' }
        ]);
      }
      
      if (end < start) {
        throw new ValidationError([
          { field: 'endDate', message: 'End date must be greater than or equal to start date' }
        ]);
      }
    }

    // Get expenses by category from repository with userId filter
    const expenses = await dashboardRepository.getCategoryBreakdown(userId, 'Expense', startDate, endDate);
    
    // Handle paginated results
    if ('data' in expenses) {
      return this.calculateCategoryPercentages(expenses.data);
    }
    
    // Calculate percentages
    return this.calculateCategoryPercentages(expenses);
  }

  /**
   * Get monthly trend data
   */
  async getMonthlyTrend(userId: number, months: number = 6): Promise<MonthlyTrend[]> {
    // Validate months parameter
    if (months < 1 || months > 24) {
      throw new ValidationError([
        { field: 'months', message: 'Months must be between 1 and 24' }
      ]);
    }

    // Get trend data from repository with userId filter
    const trendData = await dashboardRepository.getMonthlyTrend(userId, months);
    
    // Format the data (already formatted in repository, but can add additional logic here)
    return this.formatMonthlyTrendData(trendData);
  }

  /**
   * Calculate net balance (income - expenses)
   */
  private calculateNetBalance(totalIncome: number, totalExpenses: number): number {
    return totalIncome - totalExpenses;
  }

  /**
   * Calculate percentage for each category based on total expenses
   */
  private calculateCategoryPercentages(expenses: ExpenseByCategory[]): ExpenseByCategory[] {
    // Calculate total expenses
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    // If no expenses, return empty array
    if (totalExpenses === 0) {
      return [];
    }

    // Calculate percentage for each category
    return expenses.map(expense => ({
      ...expense,
      percentage: Math.round((expense.amount / totalExpenses) * 100 * 100) / 100 // Round to 2 decimal places
    }));
  }

  /**
   * Format monthly trend data
   */
  private formatMonthlyTrendData(trendData: MonthlyTrend[]): MonthlyTrend[] {
    // Additional formatting can be added here if needed
    // For now, just return the data as-is
    return trendData;
  }
}

export default new DashboardService();
