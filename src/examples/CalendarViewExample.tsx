import React, { useState } from 'react';
import { CalendarView } from '@/components/CalendarView';
import { ViewModeSelector } from '@/components/ViewModeSelector';
import { ViewMode } from '@/utils/dateUtils';

/**
 * Example usage of CalendarView component
 * 
 * This demonstrates how to use the CalendarView with ViewModeSelector
 * for month navigation and transaction display.
 */
export const CalendarViewExample: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [referenceDate, setReferenceDate] = useState(new Date());
  const [customStartDate, setCustomStartDate] = useState<Date>();
  const [customEndDate, setCustomEndDate] = useState<Date>();

  // Example transactions data
  const exampleTransactions = [
    {
      id: 1,
      date: new Date('2024-02-15'),
      amount: 1500,
      description: 'Salary',
      transactionType: { id: 1, name: 'Income', createdAt: new Date() },
      category: { id: 1, name: 'Salary', transactionTypeId: 1, createdAt: new Date() },
      subCategory: { id: 1, name: 'Monthly', categoryId: 1, createdAt: new Date() },
      transactionTypeId: 1,
      categoryId: 1,
      subCategoryId: 1,
      paymentModeId: 1,
      accountId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      date: new Date('2024-02-15'),
      amount: 50,
      description: 'Groceries',
      transactionType: { id: 2, name: 'Expense', createdAt: new Date() },
      category: { id: 2, name: 'Food', transactionTypeId: 2, createdAt: new Date() },
      subCategory: { id: 2, name: 'Groceries', categoryId: 2, createdAt: new Date() },
      transactionTypeId: 2,
      categoryId: 2,
      subCategoryId: 2,
      paymentModeId: 1,
      accountId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 3,
      date: new Date('2024-02-20'),
      amount: 100,
      description: 'Transfer to savings',
      transactionType: { id: 3, name: 'Transfer', createdAt: new Date() },
      category: { id: 3, name: 'Transfer', transactionTypeId: 3, createdAt: new Date() },
      subCategory: { id: 3, name: 'Savings', categoryId: 3, createdAt: new Date() },
      transactionTypeId: 3,
      categoryId: 3,
      subCategoryId: 3,
      paymentModeId: 1,
      accountId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const handleDelete = (id: number) => {
    console.log('Delete transaction:', id);
    // In real usage, this would call the delete API
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Calendar View Example</h1>
        <p className="text-muted-foreground">
          Interactive calendar showing transactions by day with month navigation
        </p>
      </div>

      {/* View Mode Selector for Month Navigation */}
      <ViewModeSelector
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        referenceDate={referenceDate}
        onDateChange={setReferenceDate}
        customStartDate={customStartDate}
        customEndDate={customEndDate}
        onCustomStartChange={setCustomStartDate}
        onCustomEndChange={setCustomEndDate}
      />

      {/* Calendar View */}
      <CalendarView
        transactions={exampleTransactions}
        referenceDate={referenceDate}
        onDelete={handleDelete}
      />

      {/* Usage Notes */}
      <div className="mt-8 p-4 border rounded-lg bg-muted/50">
        <h2 className="font-semibold mb-2">Usage Notes:</h2>
        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
          <li>Click on any day with transactions to view details</li>
          <li>Use the navigation buttons to move between months</li>
          <li>Green amounts indicate income, red for expenses, blue for transfers</li>
          <li>Hover over transactions in the detail view to reveal the delete button</li>
          <li>Days from previous/next months are shown in muted colors</li>
        </ul>
      </div>
    </div>
  );
};
