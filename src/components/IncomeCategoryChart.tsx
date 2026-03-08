import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Transaction } from '../types/models';
import { formatCurrency } from '../utils/formatUtils';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { aggregateByCategory, assignColors, filterByTransactionType } from '../utils/chartUtils';
import { INCOME_COLOR_PALETTE } from '../utils/chartColors';

interface IncomeCategoryChartProps {
  transactions: Transaction[];
}

const IncomeCategoryChartComponent: React.FC<IncomeCategoryChartProps> = ({ transactions }) => {
  // Filter transactions for income type only
  const incomeTransactions = useMemo(() => {
    return filterByTransactionType(transactions, 'Income');
  }, [transactions]);

  // Aggregate by category
  const aggregatedData = useMemo(() => {
    return aggregateByCategory(incomeTransactions);
  }, [incomeTransactions]);

  // Assign colors to aggregated data
  const chartData = useMemo(() => {
    return assignColors(aggregatedData, INCOME_COLOR_PALETTE);
  }, [aggregatedData]);

  // Calculate total income
  const totalIncome = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.value, 0);
  }, [chartData]);

  // Empty state handling
  if (chartData.length === 0 || totalIncome === 0) {
    return (
      <Card 
        className="border-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800"
        role="region"
        aria-label="Income by category chart - No data available"
      >
        <CardHeader>
          <CardTitle className="text-xl font-bold text-foreground">
            Income by Category
          </CardTitle>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2" aria-label="Total income amount: zero rupees">
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
              className="w-16 h-16 mb-4 text-green-300 dark:text-green-700" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
            <p className="text-center font-medium">No income transactions in this period</p>
            <p className="text-sm text-muted-foreground/70 mt-2">Add income transactions to see the breakdown</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className="border-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800"
      role="region"
      aria-label={`Income breakdown by category. Total income: ${formatCurrency(totalIncome)}`}
    >
      <CardHeader>
        <CardTitle className="text-xl font-bold text-foreground" id="income-chart-title">
          Income by Category
        </CardTitle>
        <div className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2" aria-label={`Total income amount: ${formatCurrency(totalIncome)}`}>
          {formatCurrency(totalIncome)}
        </div>
      </CardHeader>
      <CardContent className="p-6 overflow-hidden">
        <div 
          role="img" 
          aria-labelledby="income-chart-title"
          aria-describedby="income-chart-description"
          className="w-full"
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
                    aria-label={`${entry.name}: ${formatCurrency(entry.value)}, ${entry.percentage.toFixed(1)}% of total income`}
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
                height={80}
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
                  maxWidth: '100%',
                  overflow: 'hidden',
                }}
                content={(props) => {
                  const { payload } = props;
                  return (
                    <div className="w-full px-2 mt-4 max-w-full overflow-hidden">
                      <ul 
                        className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs max-w-full"
                        role="list"
                        aria-label="Income categories legend"
                      >
                        {payload?.map((entry, index) => {
                          const item = chartData.find(d => d.name === entry.value);
                          return (
                            <li
                              key={`legend-${index}`}
                              className="flex items-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded px-2 py-1 transition-all hover:bg-green-100 dark:hover:bg-green-900/20 min-w-0 max-w-full"
                              tabIndex={0}
                              role="button"
                              aria-label={`${entry.value}: ${formatCurrency(item?.value || 0)}, ${item?.percentage.toFixed(1)}% of total income. Press Enter to toggle visibility.`}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  // Legend click functionality handled by Recharts
                                }
                              }}
                            >
                              <span
                                className="w-3 h-3 rounded-full flex-shrink-0"
                                style={{ backgroundColor: entry.color }}
                                aria-hidden="true"
                              />
                              <span className="text-xs truncate flex-1 min-w-0">
                                {entry.value}: {formatCurrency(item?.value || 0)} ({item?.percentage.toFixed(1)}%)
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Screen reader accessible data */}
        <div className="sr-only" id="income-chart-description">
          <h3>Income by Category Data</h3>
          <p>This chart shows the distribution of income across {chartData.length} categories.</p>
          <ul>
            {chartData.map(item => (
              <li key={item.name}>
                {item.name}: {formatCurrency(item.value)} ({item.percentage.toFixed(1)}% of total)
              </li>
            ))}
          </ul>
          <p>Total Income: {formatCurrency(totalIncome)}</p>
        </div>
      </CardContent>
    </Card>
  );
};

// Wrap component with React.memo and custom comparison function
// Only re-render if transactions array reference changes
export const IncomeCategoryChart = React.memo(
  IncomeCategoryChartComponent,
  (prevProps, nextProps) => {
    // Custom comparison: only re-render if transactions actually changed
    return prevProps.transactions === nextProps.transactions;
  }
);

IncomeCategoryChart.displayName = 'IncomeCategoryChart';

export default IncomeCategoryChart;
