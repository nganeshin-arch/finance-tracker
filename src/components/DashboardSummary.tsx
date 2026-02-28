import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useTrackingCycleContext } from '../contexts/TrackingCycleContext';
import { dashboardService } from '../services';
import { DashboardSummary as DashboardSummaryType } from '../types';
import { formatCurrency } from '../utils/formatUtils';
import { format } from 'date-fns';

const DashboardSummary: React.FC = () => {
  const { trackingCycles, activeTrackingCycle, loading: cyclesLoading } = useTrackingCycleContext();
  const [selectedCycleId, setSelectedCycleId] = useState<number | undefined>(undefined);
  const [summary, setSummary] = useState<DashboardSummaryType | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Set default to active cycle when available
  useEffect(() => {
    if (activeTrackingCycle && selectedCycleId === undefined) {
      setSelectedCycleId(activeTrackingCycle.id);
    }
  }, [activeTrackingCycle, selectedCycleId]);

  // Fetch summary data when cycle changes
  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await dashboardService.getSummary(selectedCycleId);
        setSummary(data);
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Failed to fetch dashboard summary';
        setError(errorMessage);
        console.error('Error fetching dashboard summary:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [selectedCycleId]);

  const handleCycleChange = (event: any) => {
    const value = event.target.value;
    setSelectedCycleId(value === 'all' ? undefined : value);
  };

  if (cyclesLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Tracking Cycle Selector */}
      <Box mb={3}>
        <FormControl fullWidth>
          <InputLabel id="cycle-select-label">Tracking Cycle</InputLabel>
          <Select
            labelId="cycle-select-label"
            id="cycle-select"
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
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      )}

      {/* Summary Cards */}
      {!loading && summary && (
        <>
          {/* Cycle Date Range */}
          <Typography variant="subtitle1" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
            Period: {format(new Date(summary.period.startDate), 'MMM d, yyyy')} - {format(new Date(summary.period.endDate), 'MMM d, yyyy')}
          </Typography>

          <Grid container spacing={3}>
            {/* Total Income Card */}
            <Grid item xs={12} sm={6} md={4}>
              <Card
                sx={{
                  bgcolor: '#e8f5e9',
                  borderLeft: '4px solid #4caf50',
                }}
              >
                <CardContent>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Total Income
                  </Typography>
                  <Typography variant="h4" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                    {formatCurrency(summary.totalIncome)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Total Expenses Card */}
            <Grid item xs={12} sm={6} md={4}>
              <Card
                sx={{
                  bgcolor: '#ffebee',
                  borderLeft: '4px solid #f44336',
                }}
              >
                <CardContent>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Total Expenses
                  </Typography>
                  <Typography variant="h4" sx={{ color: '#f44336', fontWeight: 'bold' }}>
                    {formatCurrency(summary.totalExpenses)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Net Balance Card */}
            <Grid item xs={12} sm={12} md={4}>
              <Card
                sx={{
                  bgcolor: summary.netBalance >= 0 ? '#e8f5e9' : '#ffebee',
                  borderLeft: `4px solid ${summary.netBalance >= 0 ? '#4caf50' : '#f44336'}`,
                }}
              >
                <CardContent>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Net Balance
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      color: summary.netBalance >= 0 ? '#4caf50' : '#f44336',
                      fontWeight: 'bold',
                    }}
                  >
                    {formatCurrency(summary.netBalance)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};

export default DashboardSummary;
