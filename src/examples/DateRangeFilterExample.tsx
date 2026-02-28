import React, { useState } from 'react';
import { DateRangeFilter } from '@/components/DateRangeFilter.new';

/**
 * Example usage of the DateRangeFilter component
 * 
 * This example demonstrates:
 * 1. Basic integration with state management
 * 2. Handling filter changes
 * 3. Handling clear action
 * 4. Displaying selected date range
 */
export const DateRangeFilterExample: React.FC = () => {
  const [dateRange, setDateRange] = useState<{
    startDate: string | null;
    endDate: string | null;
  }>({
    startDate: null,
    endDate: null,
  });

  const handleFilterChange = (startDate: string, endDate: string) => {
    console.log('Filter applied:', { startDate, endDate });
    setDateRange({ startDate, endDate });
    
    // In a real application, you would:
    // 1. Update your data fetching logic
    // 2. Call an API with the date range
    // 3. Update your transaction list
    // Example:
    // fetchTransactions({ startDate, endDate });
  };

  const handleClear = () => {
    console.log('Filter cleared');
    setDateRange({ startDate: null, endDate: null });
    
    // In a real application, you would:
    // 1. Reset your data to show all transactions
    // 2. Call an API without date filters
    // Example:
    // fetchTransactions();
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
        DateRangeFilter Component Example
      </h1>

      {/* The DateRangeFilter Component */}
      <DateRangeFilter
        onFilterChange={handleFilterChange}
        onClear={handleClear}
      />

      {/* Display Current Selection */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
          Current Selection
        </h2>
        {dateRange.startDate && dateRange.endDate ? (
          <div className="space-y-2">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-medium">Start Date:</span> {dateRange.startDate}
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-medium">End Date:</span> {dateRange.endDate}
            </p>
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                ✓ Date range filter is active. Transactions would be filtered between these dates.
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No date range selected. All transactions would be shown.
          </p>
        )}
      </div>

      {/* Usage Instructions */}
      <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
          How to Use
        </h2>
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li className="flex items-start">
            <span className="mr-2">1.</span>
            <span>Click on "Pick a date" buttons to open the calendar and select start/end dates</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">2.</span>
            <span>Or use the quick filter buttons for common date ranges</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">3.</span>
            <span>Click "Apply" to apply the filter (or quick filters apply automatically)</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">4.</span>
            <span>Click "Clear" to remove the date filter</span>
          </li>
        </ul>
      </div>

      {/* Integration Example */}
      <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
          Integration Example
        </h2>
        <pre className="text-xs bg-gray-50 dark:bg-gray-900 p-3 rounded overflow-x-auto">
          <code>{`import { DateRangeFilter } from '@/components/DateRangeFilter';

function TransactionsPage() {
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: ''
  });

  const handleFilterChange = (startDate: string, endDate: string) => {
    setFilters({ startDate, endDate });
    // Fetch filtered transactions
    fetchTransactions({ startDate, endDate });
  };

  const handleClear = () => {
    setFilters({ startDate: '', endDate: '' });
    // Fetch all transactions
    fetchTransactions();
  };

  return (
    <div>
      <DateRangeFilter
        onFilterChange={handleFilterChange}
        onClear={handleClear}
      />
      <TransactionList filters={filters} />
    </div>
  );
}`}</code>
        </pre>
      </div>
    </div>
  );
};

export default DateRangeFilterExample;
