import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Loading } from './ui/loading';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { useTrackingCycleContext } from '../contexts/TrackingCycleContext';
import { dashboardService } from '../services';
import { ExpenseByCategory } from '../types';
import { formatCurrency, formatPercentage } from '../utils/formatUtils';
import { format } from 'date-fns';

// Color palette for chart - using design system colors
const COLORS = [
  '#ef4444', // expense-500 (primary red)
  '#dc2626', // expense-600 (darker red)
  '#f87171', // expense-400 (lighter red)
  '#b91c1c', // expense-700 (deep red)
  '#fca5a5', // expense-300 (light red)
  '#991b1b', // expense-800
  '#fee2e2', // expense-100 (very light red)
  '#3b82f6', // neutral-500 (blue)
  '#2563eb', // neutral-600 (darker blue)
  '#60a5fa', // neutral-400 (lighter blue)
  '#1d4ed8', // neutral-700 (deep blue)
  '#93c5fd', // neutral-300 (light blue)
  '#1e40af', // neutral-800
  '#dbeafe', // neutral-100 (very light blue)
  '#22c55e', // income-500 (green)
  '#16a34a', // income-600 (darker green)
];

const ExpenseByCategoryChart: React.FC = () => {
  const { trackingCycles, activeTrackingCycle, loading: cyclesLoading } = useTrackingCycleContext();
  const [selectedCycleId, setSelectedCycleId] = useState<number | undefined>(undefined);
  const [expenses, setExpenses] = useState<ExpenseByCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Set default to active cycle when available
  useEffect(() => {
    if (activeTrackingCycle && selectedCycleId === undefined) {
      setSelectedCycleId(activeTrackingCycle.id);
    }
  }, [activeTrackingCycle, selectedCycleId]);

  // Fetch expenses data when cycle changes
  useEffect(() => {
    const fetchExpenses = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await dashboardService.getExpensesByCategory(selectedCycleId);
        setExpenses(data);
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Failed to fetch expenses by category';
        setError(errorMessage);
        console.error('Error fetching expenses by category:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, [selectedCycleId]);

  const handleCycleChange = (value: string) => {
    setSelectedCycleId(value === 'all' ? undefined : Number(value));
  };

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border bg-popover p-3 shadow-md">
          <p className="mb-1 text-sm font-semibold text-popover-foreground">
            {data.categoryName}
          </p>
          <p className="text-sm text-muted-foreground">
            Amount: {formatCurrency(data.amount)}
          </p>
          <p className="text-sm text-muted-foreground">
            Percentage: {formatPercentage(data.percentage)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (cyclesLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex min-h-[300px] sm:min-h-[400px] items-center justify-center">
            <Loading message="Loading tracking cycles..." />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Expenses by Category</CardTitle>
      </CardHeader>

      <CardContent>
        {/* Tracking Cycle Selector */}
        <div className="mb-6">
          <Select
            value={selectedCycleId?.toString() || 'all'}
            onValueChange={handleCycleChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select tracking cycle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              {trackingCycles.map((cycle) => (
                <SelectItem key={cycle.id} value={cycle.id.toString()}>
                  <span className="block truncate">
                    {cycle.name} ({format(new Date(cycle.startDate), 'MMM d, yyyy')} -{' '}
                    {format(new Date(cycle.endDate), 'MMM d, yyyy')})
                    {cycle.isActive && ' (Active)'}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex min-h-[300px] items-center justify-center">
            <Loading message="Loading expense data..." />
          </div>
        )}

        {/* Chart */}
        {!loading && expenses.length > 0 && (
          <div className="w-full">
            <ResponsiveContainer width="100%" height={isMobile ? 350 : 400} minWidth={300}>
              <PieChart>
                <Pie
                  data={expenses}
                  dataKey="amount"
                  nameKey="categoryName"
                  cx="50%"
                  cy="50%"
                  outerRadius={isMobile ? 80 : 120}
                  label={!isMobile ? (entry) => `${entry.categoryName}: ${formatPercentage(entry.percentage)}` : false}
                  labelLine={!isMobile}
                >
                  {expenses.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value, entry: any) => 
                    isMobile 
                      ? value 
                      : `${value} (${formatCurrency(entry.payload.amount)})`
                  }
                  wrapperStyle={{ 
                    paddingTop: '10px', 
                    fontSize: isMobile ? '11px' : '14px',
                    maxHeight: isMobile ? '100px' : 'none',
                    overflowY: isMobile ? 'auto' : 'visible'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Empty State */}
        {!loading && expenses.length === 0 && (
          <div className="flex min-h-[300px] items-center justify-center">
            <p className="text-sm text-muted-foreground">
              No expense data available for the selected period
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExpenseByCategoryChart;
