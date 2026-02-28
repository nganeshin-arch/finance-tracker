import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { TransactionForm } from '../components/TransactionForm.new';
import { TransactionList } from '../components/TransactionList.new';
import { DateRangeFilter } from '../components/DateRangeFilter.new';
import { useTransactions } from '../hooks/useTransactions';
import { useConfirm } from '../hooks/useConfirm';
import { CreateTransactionDTO, Transaction, TransactionFilters } from '../types';
import { getErrorMessage } from '../utils/errorHandler';
import { Button } from '../components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '../components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { useToast } from '../hooks/useToast';

export const TransactionsPage: React.FC = () => {
  const [filters, setFilters] = useState<TransactionFilters>({});
  const {
    transactions,
    loading,
    error,
    fetchTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  } = useTransactions(filters);

  const { toast } = useToast();
  const { confirm, confirmState, handleCancel } = useConfirm();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>(
    undefined
  );

  const handleOpenDrawer = () => {
    setEditingTransaction(undefined);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setEditingTransaction(undefined);
  };

  const handleEdit = (id: number) => {
    const transaction = transactions.find((t) => t.id === id);
    if (transaction) {
      setEditingTransaction(transaction);
      setDrawerOpen(true);
    }
  };

  const handleSubmit = async (data: CreateTransactionDTO) => {
    try {
      if (editingTransaction) {
        await updateTransaction(editingTransaction.id, data);
        toast({
          title: 'Success',
          description: 'Transaction updated successfully',
          variant: 'default',
        });
      } else {
        await createTransaction(data);
        toast({
          title: 'Success',
          description: 'Transaction created successfully',
          variant: 'default',
        });
      }
      handleCloseDrawer();
    } catch (err) {
      toast({
        title: 'Error',
        description: getErrorMessage(err),
        variant: 'error',
      });
      throw err;
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = await confirm({
      title: 'Delete Transaction',
      message: 'Are you sure you want to delete this transaction? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      severity: 'error',
    });

    if (confirmed) {
      try {
        await deleteTransaction(id);
        toast({
          title: 'Success',
          description: 'Transaction deleted successfully',
          variant: 'default',
        });
      } catch (err) {
        toast({
          title: 'Error',
          description: getErrorMessage(err),
          variant: 'error',
        });
      }
    }
  };

  const handleFilterChange = (startDate: string, endDate: string) => {
    const newFilters: TransactionFilters = {
      startDate,
      endDate,
    };
    setFilters(newFilters);
  };

  const handleClearFilter = () => {
    setFilters({});
  };

  // Refetch transactions when filters change
  useEffect(() => {
    fetchTransactions(filters);
  }, [filters, fetchTransactions]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Page Container with proper spacing and responsive design */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Page Header with action buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Transactions
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Manage your income and expenses
            </p>
          </div>
          <Button
            onClick={handleOpenDrawer}
            className="w-full sm:w-auto h-11 shadow-sm"
            aria-label="Add new transaction"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Transaction
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            className="mb-6 rounded-lg bg-expense-50 dark:bg-expense-950/30 border border-expense-200 dark:border-expense-800 p-4"
            role="alert"
          >
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-expense-600 dark:text-expense-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-expense-800 dark:text-expense-200">
                  Error loading transactions
                </h3>
                <div className="mt-2 text-sm text-expense-700 dark:text-expense-300">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Date Range Filter */}
        <DateRangeFilter
          onFilterChange={handleFilterChange}
          onClear={handleClearFilter}
        />

        {/* Transaction List */}
        <TransactionList
          transactions={transactions}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={loading}
        />

        {/* Transaction Form Drawer (Sheet) */}
        <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
          <SheetContent
            side="right"
            className="w-full sm:max-w-[540px] overflow-y-auto"
            aria-labelledby="transaction-drawer-title"
          >
            <SheetHeader>
              <SheetTitle id="transaction-drawer-title">
                {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
              </SheetTitle>
            </SheetHeader>
            <TransactionForm
              transaction={editingTransaction}
              onSubmit={handleSubmit}
              onCancel={handleCloseDrawer}
            />
          </SheetContent>
        </Sheet>

        {/* Confirm Dialog */}
        <Dialog open={confirmState.open} onOpenChange={(open) => !open && handleCancel()}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {confirmState.severity === 'error' && (
                  <svg
                    className="h-6 w-6 text-expense-600 dark:text-expense-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                    />
                  </svg>
                )}
                {confirmState.title}
              </DialogTitle>
              <DialogDescription>
                {confirmState.message}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={handleCancel}
              >
                {confirmState.cancelText}
              </Button>
              <Button
                variant={confirmState.severity === 'error' ? 'destructive' : 'default'}
                onClick={confirmState.onConfirm}
              >
                {confirmState.confirmText}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default TransactionsPage;
