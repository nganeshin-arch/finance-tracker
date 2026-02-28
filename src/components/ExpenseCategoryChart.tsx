import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Transaction } from '../types/models';
import { formatCurrency } from '../utils/formatUtils';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { aggregateByCategory, assignColors, filterByTransactionType } from '../utils/chartUtils';
import { EXPENSE_COLOR_PALETTE } from '../utils/chartColors';

interface ExpenseCategoryChartProps {
  transactions: Transaction[];
}

const ExpenseCategoryChartComponent: React.FC<ExpenseCategoryChartProps> = ({ transactions }) => {
  // Filter transactions for expense type only
  const expenseTransactions = useMemo(() => {
    return filterByTransactionType(transactions, 'Expense');
  }, [transactions]);

  // Aggregate by category
  const aggregatedData = useMemo(() => {
    return aggregateByCategory(expenseTransactions);
  }, [expenseTransactions]);

  // Assign colors to aggregated data
  const chartData = useMemo(() => {
    return assignColors(aggregatedData, EXPENSE_COLOR_PALETTE);
  }, [aggregatedData]);

  // Calculate total expense
  const totalExpense = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.value, 0);
  }, [chartData]);

  // Empty state handling
  if (chartData.length === 0 || totalExpense === 0) {
    return (
      <Card 
        className="border-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border-red-200 dark:border-red-800"
        role="region"
        aria-label="Expenses by category chart - No data available"
      >
        <CardHeader>
          <CardTitle className="text-xl font-bold text-foreground">
            Expenses by Category
          </CardTitle>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400 mt-2" aria-label="Total expense amount: zero rupees">
            {formatCurrency(0)}
          </div>
        </CardHeader>
        <CardContent>
          <div 
            className="flex flex-col items-center justify-center h-[350px] text-muted-foreground"
            role="status"
            aria-live="polite"
          >
            <svg 
              className="w-16 h-16 mb-4 text-red-300 dark:text-red-700" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" 
              />
            </svg>
            <p className="text-center font-medium">No expense transactions in this period</p>
            <p className="text-sm text-muted-foreground/70 mt-2">Add expense transactions to see the breakdown</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className="border-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border-red-200 dark:border-red-800"
      role="region"
      aria-label={`Expense breakdown by category. Total expenses: ${formatCurrency(totalExpense)}`}
    >
      <CardHeader>
        <CardTitle className="text-xl font-bold text-foreground" id="expense-chart-title">
          Expenses by Category
        </CardTitle>
        <div className="text-2xl font-bold text-red-600 dark:text-red-400 mt-2" aria-label={`Total expense amount: ${formatCurrency(totalExpense)}`}>
          {formatCurrency(totalExpense)}
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div 
          role="img" 
          aria-labelledby="expense-chart-title"
          aria-describedby="expense-chart-description"
        >
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                outerRadius={100}
                innerRadius={0}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                    style={{ outline: 'none' }}
                    tabIndex={0}
                    aria-label={`${entry.name}: ${formatCurrency(entry.value)}, ${entry.percentage.toFixed(1)}% of total expenses`}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
                labelStyle={{
                  fontWeight: 600,
                  color: 'hsl(var(--foreground))',
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={60}
                iconType="circle"
                formatter={(value) => {
                  const item = chartData.find(d => d.name === value);
                  return (
                    <span className="text-sm">
                      {value}: {formatCurrency(item?.value || 0)} ({item?.percentage.toFixed(1)}%)
                    </span>
                  );
                }}
                wrapperStyle={{
                  paddingTop: '20px',
                }}
                content={(props) => {
                  const { payload } = props;
                  return (
                    <ul 
                      className="flex flex-wrap gap-4 justify-center mt-5"
                      role="list"
                      aria-label="Expense categories legend"
                    >
                      {payload?.map((entry, index) => {
                        const item = chartData.find(d => d.name === entry.value);
                        return (
                          <li
                            key={`legend-${index}`}
                            className="flex items-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded px-2 py-1 transition-all hover:bg-red-100 dark:hover:bg-red-900/20"
                            tabIndex={0}
                            role="button"
                            aria-label={`${entry.value}: ${formatCurrency(item?.value || 0)}, ${item?.percentage.toFixed(1)}% of total expenses. Press Enter to toggle visibility.`}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                // Legend click functionality handled by Recharts
                              }
                            }}
                          >
                            <span
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: entry.color }}
                              aria-hidden="true"
                            />
                            <span className="text-sm">
                              {entry.value}: {formatCurrency(item?.value || 0)} ({item?.percentage.toFixed(1)}%)
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Screen reader accessible data */}
        <div className="sr-only" id="expense-chart-description">
          <h3>Expenses by Category Data</h3>
          <p>This chart shows the distribution of expenses across {chartData.length} categories.</p>
          <ul>
            {chartData.map(item => (
              <li key={item.name}>
                {item.name}: {formatCurrency(item.value)} ({item.percentage.toFixed(1)}% of total)
              </li>
            ))}
          </ul>
          <p>Total Expenses: {formatCurrency(totalExpense)}</p>
        </div>
      </CardContent>
    </Card>
  );
};

// Wrap component with React.memo and custom comparison function
// Only re-render if transactions array reference changes
export const ExpenseCategoryChart = React.memo(
  ExpenseCategoryChartComponent,
  (prevProps, nextProps) => {
    // Custom comparison: only re-render if transactions actually changed
    return prevProps.transactions === nextProps.transactions;
  }
);

ExpenseCategoryChart.displayName = 'ExpenseCategoryChart';

export default ExpenseCategoryChart;
