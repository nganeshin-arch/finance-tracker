import React, { useState } from 'react';
import { Calendar as CalendarIcon, Filter, X } from 'lucide-react';
import { format } from 'date-fns';
import { startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface DateRangeFilterProps {
  onFilterChange: (startDate: string, endDate: string) => void;
  onClear: () => void;
}

type QuickFilterType = 'thisMonth' | 'lastMonth' | 'last3Months' | 'last6Months' | 'thisYear';

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  onFilterChange,
  onClear,
}) => {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [startOpen, setStartOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);

  const formatDateForAPI = (date: Date): string => {
    return format(date, 'yyyy-MM-dd');
  };

  const validateAndApply = () => {
    setError(null);

    if (!startDate || !endDate) {
      setError('Both start and end dates are required');
      return;
    }

    if (endDate < startDate) {
      setError('End date must be on or after start date');
      return;
    }

    onFilterChange(formatDateForAPI(startDate), formatDateForAPI(endDate));
  };

  const handleClear = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setError(null);
    onClear();
  };

  const handleQuickSelect = (type: QuickFilterType) => {
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
    }

    setStartDate(start);
    setEndDate(end);
    setError(null);
    onFilterChange(formatDateForAPI(start), formatDateForAPI(end));
  };

  const quickFilters: { label: string; value: QuickFilterType }[] = [
    { label: 'This Month', value: 'thisMonth' },
    { label: 'Last Month', value: 'lastMonth' },
    { label: 'Last 3 Months', value: 'last3Months' },
    { label: 'Last 6 Months', value: 'last6Months' },
    { label: 'This Year', value: 'thisYear' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 md:p-6 mb-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Filter by Date Range
        </h3>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Date Pickers */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        {/* Start Date Picker */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Start Date
          </label>
          <Popover open={startOpen} onOpenChange={setStartOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !startDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, 'PPP') : 'Pick a date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={(date) => {
                  setStartDate(date);
                  setStartOpen(false);
                  setError(null);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* End Date Picker */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            End Date
          </label>
          <Popover open={endOpen} onOpenChange={setEndOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !endDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, 'PPP') : 'Pick a date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={(date) => {
                  setEndDate(date);
                  setEndOpen(false);
                  setError(null);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 sm:items-end">
          <Button
            onClick={validateAndApply}
            disabled={!startDate || !endDate}
            className="flex-1 sm:flex-none"
          >
            <Filter className="mr-2 h-4 w-4" />
            Apply
          </Button>
          <Button
            variant="outline"
            onClick={handleClear}
            className="flex-1 sm:flex-none"
          >
            <X className="mr-2 h-4 w-4" />
            Clear
          </Button>
        </div>
      </div>

      {/* Quick Filter Buttons */}
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Quick Select:</p>
        <div className="flex flex-wrap gap-2">
          {quickFilters.map((filter) => (
            <Button
              key={filter.value}
              variant="outline"
              size="sm"
              onClick={() => handleQuickSelect(filter.value)}
              className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 dark:hover:bg-blue-900/20 dark:hover:text-blue-300 dark:hover:border-blue-700 transition-colors"
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};
