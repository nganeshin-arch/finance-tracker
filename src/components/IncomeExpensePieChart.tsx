import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Transaction } from '../types/models';
import { formatCurrency } from '../utils/formatUtils';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface IncomeExpensePieChartProps {
  transactions: Transaction[];
}

const COLORS = {
  income: '#10b981', // green-500
  expense: '#ef4444', // red-500
};

export const IncomeExpensePieChart: React.FC<IncomeExpensePieChartProps> = ({ transactions }) => {
  const chartData = useMemo(() => {
    const totals = transactions.reduce(
      (acc, transaction) => {
        const typeName = transaction.transactionType?.name.toLowerCase() || '';
        if (typeName === 'income') {
          acc.income += transaction.amount;
        } else if (typeName === 'expense') {
          acc.expense += transaction.amount;
        }
        return acc;
      },
      { income: 0, expense: 0 }
    );

    return [
      { name: 'Income', value: totals.income, color: COLORS.income },
      { name: 'Expense', value: totals.expense, color: COLORS.expense },
    ].filter(item => item.value > 0);
  }, [transactions]);

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  if (chartData.length === 0 || total === 0) {
    return (
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Income vs Expense</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No transaction data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="text-lg font-bold">Income vs Expense</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '0.5rem',
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => {
                const item = chartData.find(d => d.name === value);
                return `${value}: ${formatCurrency(item?.value || 0)}`;
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Summary Stats */}
        <div className="mt-4 pt-4 border-t space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-muted-foreground">Total Income:</span>
            <span className="text-sm font-bold text-green-600 dark:text-green-400">
              {formatCurrency(chartData.find(d => d.name === 'Income')?.value || 0)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-muted-foreground">Total Expense:</span>
            <span className="text-sm font-bold text-red-600 dark:text-red-400">
              {formatCurrency(chartData.find(d => d.name === 'Expense')?.value || 0)}
            </span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t">
            <span className="text-sm font-bold">Net Balance:</span>
            <span className={`text-sm font-bold ${
              (chartData.find(d => d.name === 'Income')?.value || 0) - 
              (chartData.find(d => d.name === 'Expense')?.value || 0) >= 0
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}>
              {formatCurrency(
                (chartData.find(d => d.name === 'Income')?.value || 0) - 
                (chartData.find(d => d.name === 'Expense')?.value || 0)
              )}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
