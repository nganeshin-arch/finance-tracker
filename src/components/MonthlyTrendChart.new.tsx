import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Loading } from './ui/loading';
import { dashboardService } from '../services';
import { MonthlyTrend } from '../types';
import { formatCurrency } from '../utils/formatUtils';

const MonthlyTrendChart: React.FC = () => {
  const [trends, setTrends] = useState<MonthlyTrend[]>([]);
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

  // Fetch monthly trend data
  useEffect(() => {
    const fetchTrends = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await dashboardService.getMonthlyTrend();
        setTrends(data);
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Failed to fetch monthly trend';
        setError(errorMessage);
        console.error('Error fetching monthly trend:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrends();
  }, []);

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-popover p-3 shadow-md">
          <p className="mb-2 text-sm font-semibold text-popover-foreground">
            {label}
          </p>
          {payload.map((entry: any, index: number) => (
            <p
              key={index}
              className="text-sm"
              style={{ color: entry.color }}
            >
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Monthly Income & Expense Trend</CardTitle>
      </CardHeader>

      <CardContent>
        {/* Error Display */}
        {error && (
          <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex min-h-[300px] sm:min-h-[400px] items-center justify-center">
            <Loading message="Loading trend data..." />
          </div>
        )}

        {/* Chart */}
        {!loading && trends.length > 0 && (
          <div className="w-full overflow-x-auto">
            <ResponsiveContainer width="100%" height={isMobile ? 300 : 400} minWidth={300}>
              <LineChart
                data={trends}
                margin={{ 
                  top: 5, 
                  right: isMobile ? 10 : 30, 
                  left: isMobile ? 0 : 20, 
                  bottom: 5 
                }}
              >
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="#e5e7eb"
                  opacity={0.5}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: isMobile ? 10 : 12, fill: '#6b7280' }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  tick={{ fontSize: isMobile ? 10 : 12, fill: '#6b7280' }}
                  tickFormatter={(value) => `${value.toLocaleString()}`}
                  width={isMobile ? 50 : 60}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="top"
                  height={36}
                  iconType="line"
                  wrapperStyle={{ paddingBottom: '10px', fontSize: isMobile ? '12px' : '14px' }}
                />
                <Line
                  type="monotone"
                  dataKey="income"
                  name="Income"
                  stroke="#16a34a"
                  strokeWidth={2}
                  dot={{ fill: '#16a34a', r: isMobile ? 3 : 4 }}
                  activeDot={{ r: isMobile ? 5 : 6, fill: '#22c55e' }}
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  name="Expenses"
                  stroke="#dc2626"
                  strokeWidth={2}
                  dot={{ fill: '#dc2626', r: isMobile ? 3 : 4 }}
                  activeDot={{ r: isMobile ? 5 : 6, fill: '#ef4444' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Empty State */}
        {!loading && trends.length === 0 && (
          <div className="flex min-h-[300px] sm:min-h-[400px] items-center justify-center">
            <p className="text-sm text-muted-foreground">
              No trend data available
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MonthlyTrendChart;
