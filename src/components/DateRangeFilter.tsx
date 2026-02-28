import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  ButtonGroup,
  Paper,
  Typography,
  Alert,
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import FilterListIcon from '@mui/icons-material/FilterList';
import { formatDateForInput } from '../utils/dateUtils';
import { startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear } from 'date-fns';

interface DateRangeFilterProps {
  onFilterChange: (startDate: string, endDate: string) => void;
  onClear: () => void;
}

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  onFilterChange,
  onClear,
}) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState<string | null>(null);

  const validateAndApply = () => {
    setError(null);

    if (!startDate || !endDate) {
      setError('Both start and end dates are required');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      setError('End date must be on or after start date');
      return;
    }

    onFilterChange(startDate, endDate);
  };

  const handleClear = () => {
    setStartDate('');
    setEndDate('');
    setError(null);
    onClear();
  };

  const handleQuickSelect = (type: string) => {
    const today = new Date();
    let start: Date;
    let end: Date;

    switch (type) {
      case 'thisMonth':
        start = startOfMonth(today);
        end = endOfMonth(today);
        break;
      case 'lastMonth':
        const lastMonth = subMonths(today, 1);
        start = startOfMonth(lastMonth);
        end = endOfMonth(lastMonth);
        break;
      case 'last3Months':
        start = startOfMonth(subMonths(today, 2));
        end = endOfMonth(today);
        break;
      case 'last6Months':
        start = startOfMonth(subMonths(today, 5));
        end = endOfMonth(today);
        break;
      case 'thisYear':
        start = startOfYear(today);
        end = endOfYear(today);
        break;
      default:
        return;
    }

    const startStr = formatDateForInput(start);
    const endStr = formatDateForInput(end);

    setStartDate(startStr);
    setEndDate(endStr);
    setError(null);
    onFilterChange(startStr, endStr);
  };

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <FilterListIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6">Filter by Date Range</Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box
        sx={{
          display: 'flex',
          gap: 2,
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'flex-start' },
          mb: 2,
        }}
      >
        <TextField
          label="Start Date"
          type="date"
          value={startDate}
          onChange={(e) => {
            setStartDate(e.target.value);
            setError(null);
          }}
          InputLabelProps={{ shrink: true }}
          sx={{ flex: 1 }}
        />

        <TextField
          label="End Date"
          type="date"
          value={endDate}
          onChange={(e) => {
            setEndDate(e.target.value);
            setError(null);
          }}
          InputLabelProps={{ shrink: true }}
          sx={{ flex: 1 }}
        />

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            onClick={validateAndApply}
            disabled={!startDate || !endDate}
            startIcon={<FilterListIcon />}
          >
            Apply
          </Button>
          <Button
            variant="outlined"
            onClick={handleClear}
            startIcon={<ClearIcon />}
          >
            Clear
          </Button>
        </Box>
      </Box>

      <Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Quick Select:
        </Typography>
        <ButtonGroup
          variant="outlined"
          size="small"
          sx={{
            flexWrap: 'wrap',
            gap: 1,
            '& .MuiButtonGroup-grouped': {
              border: 1,
              borderColor: 'divider',
            },
          }}
        >
          <Button onClick={() => handleQuickSelect('thisMonth')}>This Month</Button>
          <Button onClick={() => handleQuickSelect('lastMonth')}>Last Month</Button>
          <Button onClick={() => handleQuickSelect('last3Months')}>Last 3 Months</Button>
          <Button onClick={() => handleQuickSelect('last6Months')}>Last 6 Months</Button>
          <Button onClick={() => handleQuickSelect('thisYear')}>This Year</Button>
        </ButtonGroup>
      </Box>
    </Paper>
  );
};
