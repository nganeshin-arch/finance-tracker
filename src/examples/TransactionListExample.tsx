/**
 * TransactionList Example
 * 
 * This example demonstrates how to use the new TransactionList component
 * with search functionality and filter pills.
 */

import React, { useState } from 'react';
import { TransactionList, FilterPill } from '@/components/TransactionList.new';
import { Transaction } from '../types';

export const TransactionListExample: React.FC = () => {
  // Sample transaction data
  const [transactions] = useState<Transaction[]>([
    {
      id: 1,
      date: new Date('2024-02-15'),
      transactionTypeId: 1,
      categoryId: 1,
      subCategoryId: 1,
      paymentModeId: 1,
      accountId: 1,
      amount: 5000,
      description: 'Monthly salary',
      createdAt: new Date(),
      updatedAt: new Date(),
      transactionType: { id: 1, name: 'Income', createdAt: new Date() },
      category: { id: 1, name: 'Salary', transactionTypeId: 1, createdAt: new Date() },
      subCategory: { id: 1, name: 'Regular', categoryId: 1, createdAt: new Date() },
      paymentMode: { id: 1, name: 'Bank Transfer', createdAt: new Date() },
      account: { id: 1, name: 'Checking Account', createdAt: new Date() },
    },
    {
      id: 2,
      date: new Date('2024-02-14'),
      transactionTypeId: 2,
      categoryId: 2,
      subCategoryId: 2,
      paymentModeId: 2,
      accountId: 1,
      amount: 150,
      description: 'Grocery shopping at Whole Foods',
      createdAt: new Date(),
      updatedAt: new Date(),
      transactionType: { id: 2, name: 'Expense', createdAt: new Date() },
      category: { id: 2, name: 'Food', transactionTypeId: 2, createdAt: new Date() },
      subCategory: { id: 2, name: 'Groceries', categoryId: 2, createdAt: new Date() },
      paymentMode: { id: 2, name: 'Credit Card', createdAt: new Date() },
      account: { id: 1, name: 'Checking Account', createdAt: new Date() },
    },
    {
      id: 3,
      date: new Date('2024-02-13'),
      transactionTypeId: 2,
      categoryId: 3,
      subCategoryId: 3,
      paymentModeId: 2,
      accountId: 1,
      amount: 50,
      description: 'Gas station fill-up',
      createdAt: new Date(),
      updatedAt: new Date(),
      transactionType: { id: 2, name: 'Expense', createdAt: new Date() },
      category: { id: 3, name: 'Transportation', transactionTypeId: 2, createdAt: new Date() },
      subCategory: { id: 3, name: 'Fuel', categoryId: 3, createdAt: new Date() },
      paymentMode: { id: 2, name: 'Credit Card', createdAt: new Date() },
      account: { id: 1, name: 'Checking Account', createdAt: new Date() },
    },
  ]);

  // Filter state
  const [filters, setFilters] = useState<FilterPill[]>([
    {
      id: 'type-1',
      label: 'Type',
      value: 'Expense',
      type: 'transactionType',
    },
    {
      id: 'date-1',
      label: 'Date Range',
      value: 'Feb 2024',
      type: 'dateRange',
    },
  ]);

  const [loading, setLoading] = useState(false);

  // Handlers
  const handleEdit = (id: number) => {
    console.log('Edit transaction:', id);
    // In real app, open edit form/drawer
  };

  const handleDelete = async (id: number) => {
    console.log('Delete transaction:', id);
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    // In real app, call API and update state
  };

  const handleRemoveFilter = (filterId: string) => {
    setFilters(filters.filter(f => f.id !== filterId));
    console.log('Removed filter:', filterId);
  };

  const handleClearAllFilters = () => {
    setFilters([]);
    console.log('Cleared all filters');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Transaction List Example
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Demonstrating the new TransactionList component with search and filters
        </p>
      </div>

      {/* Example 1: With Filters */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          With Filter Pills
        </h2>
        <TransactionList
          transactions={transactions}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={loading}
          filters={filters}
          onRemoveFilter={handleRemoveFilter}
          onClearAllFilters={handleClearAllFilters}
        />
      </div>

      {/* Example 2: Without Filters */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Without Filters (Basic Usage)
        </h2>
        <TransactionList
          transactions={transactions}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={loading}
        />
      </div>

      {/* Example 3: Empty State */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Empty State
        </h2>
        <TransactionList
          transactions={[]}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={false}
        />
      </div>

      {/* Example 4: Loading State */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Loading State
        </h2>
        <TransactionList
          transactions={[]}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={true}
        />
      </div>

      {/* Code Examples */}
      <div className="space-y-4 mt-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Usage Examples
        </h2>
        
        <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
          <pre className="text-sm text-gray-100">
{`// Basic usage
<TransactionList
  transactions={transactions}
  onEdit={handleEdit}
  onDelete={handleDelete}
  loading={loading}
/>

// With filters
<TransactionList
  transactions={transactions}
  onEdit={handleEdit}
  onDelete={handleDelete}
  loading={loading}
  filters={filters}
  onRemoveFilter={handleRemoveFilter}
  onClearAllFilters={handleClearAllFilters}
/>

// Filter pill structure
const filters: FilterPill[] = [
  {
    id: 'type-1',
    label: 'Type',
    value: 'Income',
    type: 'transactionType'
  },
  {
    id: 'category-1',
    label: 'Category',
    value: 'Food',
    type: 'category'
  },
  {
    id: 'account-1',
    label: 'Account',
    value: 'Checking',
    type: 'account'
  },
  {
    id: 'date-1',
    label: 'Date Range',
    value: 'Jan 2024',
    type: 'dateRange'
  }
];`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default TransactionListExample;
