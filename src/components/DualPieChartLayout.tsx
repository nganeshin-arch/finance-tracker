import React, { useMemo } from 'react';
import { Transaction } from '../types/models';
import { IncomeCategoryChart } from './IncomeCategoryChart';
import { ExpenseCategoryChart } from './ExpenseCategoryChart';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface DualPieChartLayoutProps {
  transactions: Transaction[];
}

/**
 * Validates transaction data before processing
 * Ensures transactions have required fields and valid data
 */
const validateTransaction = (transaction: Transaction): boolean => {
  return (
    transaction.amount !== undefined &&
    transaction.amount >= 0 &&
    transaction.transactionType?.name !== undefined &&
    transaction.category?.name !== undefined
  );
};

/**
 * Ensures category data exists, providing fallback for missing data
 */
const ensureCategoryData = (transaction: Transaction): Transaction => {
  return {
    ...transaction,
    category: transaction.category || { 
      id: 0, 
      name: 'Uncategorized', 
      transactionTypeId: transaction.transactionTypeId,
      createdAt: new Date()
    }
  };
};

const DualPieChartLayoutComponent: React.FC<DualPieChartLayoutProps> = ({ transactions }) => {
  // Validate and process transactions
  const validatedTransactions = useMemo(() => {
    if (!transactions || !Array.isArray(transactions)) {
      return [];
    }

    return transactions
      .filter(validateTransaction)
      .map(ensureCategoryData);
  }, [transactions]);

  // Split transactions into income and expense arrays
  const { incomeTransactions, expenseTransactions } = useMemo(() => {
    const income: Transaction[] = [];
    const expense: Transaction[] = [];

    validatedTransactions.forEach(transaction => {
      if (transaction.transactionType?.name === 'Income') {
        income.push(transaction);
      } else if (transaction.transactionType?.name === 'Expense') {
        expense.push(transaction);
      }
    });

    return {
      incomeTransactions: income,
      expenseTransactions: expense,
    };
  }, [validatedTransactions]);

  // Handle empty state when no transactions exist
  if (!validatedTransactions || validatedTransactions.length === 0) {
    return (
      <Card 
        className="border-2 rounded-xl shadow-lg bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-950/20 dark:to-gray-950/20 border-slate-200 dark:border-slate-800"
        role="region"
        aria-label="Category breakdown - No data available"
      >
        <CardHeader>
          <CardTitle className="text-xl font-bold text-foreground">
            Category Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            className="flex flex-col items-center justify-center h-[350px] text-muted-foreground"
            role="status"
            aria-live="polite"
          >
            <svg 
              className="w-20 h-20 mb-4 text-slate-300 dark:text-slate-700" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" 
              />
            </svg>
            <p className="text-center font-medium text-lg">No transaction data available</p>
            <p className="text-sm text-muted-foreground/70 mt-2">Add transactions to see income and expense breakdowns by category</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Responsive grid layout: 2 columns on desktop (md:grid-cols-2), 1 column on mobile
  return (
    <div 
      className="grid grid-cols-1 md:grid-cols-2 gap-6"
      role="group"
      aria-label="Income and expense category breakdown charts"
    >
      <IncomeCategoryChart transactions={incomeTransactions} />
      <ExpenseCategoryChart transactions={expenseTransactions} />
    </div>
  );
};

// Wrap component with React.memo and custom comparison function
// Only re-render if transactions array reference changes
export const DualPieChartLayout = React.memo(
  DualPieChartLayoutComponent,
  (prevProps, nextProps) => {
    // Custom comparison: only re-render if transactions actually changed
    return prevProps.transactions === nextProps.transactions;
  }
);

DualPieChartLayout.displayName = 'DualPieChartLayout';

export default DualPieChartLayout;
