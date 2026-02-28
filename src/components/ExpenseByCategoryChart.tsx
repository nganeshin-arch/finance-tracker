import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useTrackingCycleContext } from '../contexts/TrackingCycleContext';
import { dashboardService } from '../services';
import { ExpenseByCategory } from '../types';
import { formatCurrency, formatPercentage } from '../utils/formatUtils';
import { format } from 'date-fns';

// Color palette for chart
const COLORS = [
  '#f44336', // Red
  '#e91e63', // Pink
  '#9c27b0', // Purple
  '#673ab7', // Deep Purple
  '#3f51b5', // Indigo
  '#2196f3', // Blue
  '#03a9f4', // Light Blue
  '#00bcd4', // Cyan
  '#009688', // Teal
  '#4caf50', // Green
  '#8bc34a', // Light Green
  '#cddc39', // Lime
  '#ffeb3b', // Yellow
  '#ffc107', // Amber
  '#ff9800', // Orange
  '#ff5722', // Deep Orange
];

const ExpenseByCategoryChart: React.FC = () => {
  const { trackingCycles, activeTrackingCycle, loading: cyclesLoading } = useTrackingCycleContext();
  const [selectedCycleId, setSelectedCycleId] = useState<number | undefined>(undefined);
  const [expenses, setExpenses] = useState<ExpenseByCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleCycleChange = (event: any) => {
    const value = event.target.value;
    setSelectedCycleId(value === 'all' ? undefined : value);
  };

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Box
          sx={{
            bgcolor: 'background.paper',
            p: 2,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
          }}
        >
          <Typography variant="body2" fontWeight="bold">
            {data.categoryName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Amount: {formatCurrency(data.amount)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Percentage: {formatPercentage(data.percentage)}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  if (cyclesLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Expenses by Category
        </Typography>

        {/* Tracking Cycle Selector */}
        <Box mb={3}>
          <FormControl fullWidth>
            <InputLabel id="expense-cycle-select-label">Tracking Cycle</InputLabel>
            <Select
              labelId="expense-cycle-select-label"
              id="expense-cycle-select"
              value={selectedCycleId || 'all'}
              label="Tracking Cycle"
              onChange={handleCycleChange}
            >
              <MenuItem value="all">All Time</MenuItem>
              {trackingCycles.map((cycle) => (
                <MenuItem key={cycle.id} value={cycle.id}>
                  {cycle.name} ({format(new Date(cycle.startDate), 'MMM d, yyyy')} - {format(new Date(cycle.endDate), 'MMM d, yyyy')})
                  {cycle.isActive && ' (Active)'}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
            <CircularProgress />
          </Box>
        )}

        {/* Chart */}
        {!loading && expenses.length > 0 && (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={expenses}
                dataKey="amount"
                nameKey="categoryName"
                cx="50%"
                cy="50%"
                outerRadius={120}
                label={(entry) => `${entry.categoryName}: ${formatPercentage(entry.percentage)}`}
                labelLine={true}
              >
                {expenses.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value, entry: any) => `${value} (${formatCurrency(entry.payload.amount)})`}
              />
            </PieChart>
          </ResponsiveContainer>
        )}

        {/* Empty State */}
        {!loading && expenses.length === 0 && (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
            <Typography variant="body1" color="text.secondary">
              No expense data available for the selected period
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ExpenseByCategoryChart;
