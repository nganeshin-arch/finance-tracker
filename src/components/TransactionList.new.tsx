import React, { useState, useMemo } from 'react';
import { Search, Edit, Trash2, Receipt, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Transaction } from '../types';
import { formatDateForDisplay } from '../utils/dateUtils';
import { formatCurrency } from '../utils/formatUtils';

export interface FilterPill {
  id: string;
  label: string;
  value: string;
  type: 'transactionType' | 'category' | 'account' | 'dateRange';
}

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => Promise<void>;
  loading?: boolean;
  filters?: FilterPill[];
  onRemoveFilter?: (filterId: string) => void;
  onClearAllFilters?: () => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onEdit,
  onDelete,
  loading = false,
  filters = [],
  onRemoveFilter,
  onClearAllFilters,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  // Search functionality
  const filteredTransactions = useMemo(() => {
    if (!searchQuery.trim()) return transactions;

    const query = searchQuery.toLowerCase();
    return transactions.filter((transaction) => {
      const searchableFields = [
        transaction.transactionType?.name,
        transaction.category?.name,
        transaction.subCategory?.name,
        transaction.paymentMode?.name,
        transaction.account?.name,
        transaction.description,
        transaction.amount.toString(),
        formatDateForDisplay(transaction.date),
      ];

      return searchableFields.some(
        (field) => field && field.toLowerCase().includes(query)
      );
    });
  }, [transactions, searchQuery]);

  const handleDeleteClick = (id: number) => {
    setTransactionToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (transactionToDelete === null) return;

    setDeleting(true);
    try {
      await onDelete(transactionToDelete);
    } catch (err) {
      console.error('Failed to delete transaction:', err);
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setTransactionToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setTransactionToDelete(null);
  };

  // Sort transactions by date (most recent first)
  const sortedTransactions = useMemo(() => {
    return [...filteredTransactions].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [filteredTransactions]);

  const paginatedTransactions = sortedTransactions.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading && transactions.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loading message="Loading transactions..." />
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-12 text-center">
        <Receipt className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No transactions found
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Create your first transaction to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
        <Input
          type="text"
          placeholder="Search transactions..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(0); // Reset to first page on search
          }}
          className="pl-10 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          aria-label="Search transactions"
        />
      </div>

      {/* Filter Pills */}
      {filters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Active Filters:
          </span>
          {filters.map((filter) => (
            <div
              key={filter.id}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200',
                'border border-gray-300 dark:border-gray-700',
                filter.type === 'transactionType' && 'bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-700',
                filter.type === 'category' && 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700',
                filter.type === 'account' && 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700',
                filter.type === 'dateRange' && 'bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 border-orange-300 dark:border-orange-700'
              )}
            >
              <span>{filter.label}: {filter.value}</span>
              {onRemoveFilter && (
                <button
                  onClick={() => onRemoveFilter(filter.id)}
                  className="hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-0.5 transition-colors"
                  aria-label={`Remove ${filter.label} filter`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
          {onClearAllFilters && filters.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAllFilters}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            >
              Clear All
            </Button>
          )}
        </div>
      )}

      {/* Results count */}
      {searchQuery && (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Found {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* Desktop Table View */}
      <div className="hidden md:block rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" role="table" aria-label="Transactions table">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
              <tr role="row">
                <th 
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider"
                  role="columnheader"
                >
                  Date
                </th>
                <th 
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider"
                  role="columnheader"
                >
                  Type
                </th>
                <th 
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider"
                  role="columnheader"
                >
                  Category
                </th>
                <th 
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider"
                  role="columnheader"
                >
                  Sub-Category
                </th>
                <th 
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider"
                  role="columnheader"
                >
                  Payment Mode
                </th>
                <th 
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider"
                  role="columnheader"
                >
                  Account
                </th>
                <th 
                  scope="col"
                  className="px-4 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider"
                  role="columnheader"
                >
                  Amount
                </th>
                <th 
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider"
                  role="columnheader"
                >
                  Description
                </th>
                <th 
                  scope="col"
                  className="px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider"
                  role="columnheader"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-950 divide-y divide-gray-200 dark:divide-gray-800">
              {paginatedTransactions.map((transaction) => {
                const isIncome = transaction.transactionType?.name.toLowerCase() === 'income';
                const amountColorClass = isIncome
                  ? 'text-green-700 dark:text-green-400'
                  : 'text-red-700 dark:text-red-400';

                return (
                  <tr
                    key={transaction.id}
                    role="row"
                    onMouseEnter={() => setHoveredRow(transaction.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                    className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors duration-150"
                  >
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100" role="cell">
                      {formatDateForDisplay(transaction.date)}
                    </td>
                    <td className="px-4 py-3" role="cell">
                      <span
                        className={cn(
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                          isIncome
                            ? 'bg-green-100 dark:bg-green-950/30 text-green-800 dark:text-green-400'
                            : 'bg-red-100 dark:bg-red-950/30 text-red-800 dark:text-red-400'
                        )}
                        aria-label={`Transaction type: ${transaction.transactionType?.name || 'N/A'}`}
                      >
                        {transaction.transactionType?.name || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100" role="cell">
                      {transaction.category?.name || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100" role="cell">
                      {transaction.subCategory?.name || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100" role="cell">
                      {transaction.paymentMode?.name || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100" role="cell">
                      {transaction.account?.name || 'N/A'}
                    </td>
                    <td 
                      className={cn('px-4 py-3 text-sm text-right font-medium', amountColorClass)} 
                      role="cell"
                      aria-label={`Amount: ${formatCurrency(transaction.amount)}`}
                    >
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400" role="cell">
                      <div className="max-w-[200px] truncate" title={transaction.description || '-'}>
                        {transaction.description || '-'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center" role="cell">
                      <div
                        className={cn(
                          'inline-flex gap-1 transition-opacity duration-200',
                          hoveredRow === transaction.id ? 'opacity-100' : 'opacity-0'
                        )}
                        role="group"
                        aria-label="Transaction actions"
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(transaction.id)}
                          disabled={loading}
                          className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-950 hover:text-blue-700 dark:hover:text-blue-400"
                          aria-label={`Edit transaction from ${formatDateForDisplay(transaction.date)}`}
                        >
                          <Edit className="h-4 w-4" aria-hidden="true" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(transaction.id)}
                          disabled={loading}
                          className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-950 hover:text-red-700 dark:hover:text-red-400"
                          aria-label={`Delete transaction from ${formatDateForDisplay(transaction.date)}`}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4" role="list" aria-label="Transactions list">
        {paginatedTransactions.map((transaction) => {
          const isIncome = transaction.transactionType?.name.toLowerCase() === 'income';
          const amountColorClass = isIncome
            ? 'text-green-700 dark:text-green-400'
            : 'text-red-700 dark:text-red-400';

          return (
            <div
              key={transaction.id}
              role="listitem"
              className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-4 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {formatDateForDisplay(transaction.date)}
                  </p>
                  <span
                    className={cn(
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      isIncome
                        ? 'bg-green-100 dark:bg-green-950/30 text-green-800 dark:text-green-400'
                        : 'bg-red-100 dark:bg-red-950/30 text-red-800 dark:text-red-400'
                    )}
                    aria-label={`Transaction type: ${transaction.transactionType?.name || 'N/A'}`}
                  >
                    {transaction.transactionType?.name || 'N/A'}
                  </span>
                </div>
                <p 
                  className={cn('text-lg font-bold', amountColorClass)}
                  aria-label={`Amount: ${formatCurrency(transaction.amount)}`}
                >
                  {formatCurrency(transaction.amount)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Category</p>
                  <p className="text-gray-900 dark:text-gray-100 font-medium">
                    {transaction.category?.name || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Sub-Category</p>
                  <p className="text-gray-900 dark:text-gray-100 font-medium">
                    {transaction.subCategory?.name || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Payment Mode</p>
                  <p className="text-gray-900 dark:text-gray-100 font-medium">
                    {transaction.paymentMode?.name || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Account</p>
                  <p className="text-gray-900 dark:text-gray-100 font-medium">
                    {transaction.account?.name || 'N/A'}
                  </p>
                </div>
              </div>

              {transaction.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {transaction.description}
                </p>
              )}

              <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-800" role="group" aria-label="Transaction actions">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(transaction.id)}
                  disabled={loading}
                  className="flex-1"
                  aria-label={`Edit transaction from ${formatDateForDisplay(transaction.date)}`}
                >
                  <Edit className="h-4 w-4 mr-2" aria-hidden="true" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteClick(transaction.id)}
                  disabled={loading}
                  className="flex-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                  aria-label={`Delete transaction from ${formatDateForDisplay(transaction.date)}`}
                >
                  <Trash2 className="h-4 w-4 mr-2" aria-hidden="true" />
                  Delete
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {sortedTransactions.length > rowsPerPage && (
        <nav 
          className="flex items-center justify-between border-t border-gray-200 dark:border-gray-800 pt-4"
          aria-label="Pagination"
        >
          <p className="text-sm text-gray-600 dark:text-gray-400" aria-live="polite">
            Showing {page * rowsPerPage + 1} to{' '}
            {Math.min((page + 1) * rowsPerPage, sortedTransactions.length)} of{' '}
            {sortedTransactions.length} transactions
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 0}
              aria-label="Go to previous page"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={(page + 1) * rowsPerPage >= sortedTransactions.length}
              aria-label="Go to next page"
            >
              Next
            </Button>
          </div>
        </nav>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this transaction? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleDeleteCancel}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleting}
            >
              {deleting ? <Loading size="sm" /> : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
