import React, { useState, useMemo, useEffect } from 'react';
import { Search, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Transaction } from '../types/models';
import { formatDateForDisplay } from '../utils/dateUtils';
import { formatCurrency } from '../utils/formatUtils';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';

interface TransactionTableProps {
  transactions: Transaction[];
  onDelete: (id: number) => void;
}

type FilterType = 'All' | 'Income' | 'Expense' | 'Transfer';

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  onDelete,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('All');

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Filter transactions based on debounced search term and type filter
  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    // Apply search filter with debounced term
    if (debouncedSearchTerm.trim()) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter((transaction) => {
        const description = transaction.description?.toLowerCase() || '';
        const category = transaction.category?.name.toLowerCase() || '';
        const subCategory = transaction.subCategory?.name.toLowerCase() || '';
        
        return (
          description.includes(searchLower) ||
          category.includes(searchLower) ||
          subCategory.includes(searchLower)
        );
      });
    }

    // Apply type filter
    if (filterType !== 'All') {
      filtered = filtered.filter((transaction) => {
        const typeName = transaction.transactionType?.name || '';
        return typeName.toLowerCase() === filterType.toLowerCase();
      });
    }

    return filtered;
  }, [transactions, debouncedSearchTerm, filterType]);

  // Get badge variant based on transaction type
  const getTypeBadgeVariant = (typeName: string): 'success' | 'destructive' | 'info' => {
    const lowerType = typeName.toLowerCase();
    if (lowerType === 'income') return 'success';
    if (lowerType === 'expense') return 'destructive';
    return 'info'; // Transfer
  };

  // Get amount color class based on transaction type
  const getAmountColorClass = (typeName: string): string => {
    const lowerType = typeName.toLowerCase();
    if (lowerType === 'income') return 'text-green-600 dark:text-green-400';
    if (lowerType === 'expense') return 'text-red-600 dark:text-red-400';
    return 'text-blue-600 dark:text-blue-400'; // Transfer
  };

  return (
    <Card variant="interactive" className="shadow-md hover:shadow-lg transition-all duration-300">
      <CardContent className="p-6">
        {/* Search and Filter Section */}
        <div className="mb-6 space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by description, category, or subcategory..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              aria-label="Search transactions"
            />
            {searchTerm !== debouncedSearchTerm && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                Searching...
              </span>
            )}
          </div>

          {/* Type Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            {(['All', 'Income', 'Expense', 'Transfer'] as FilterType[]).map((type) => (
              <Button
                key={type}
                variant={filterType === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType(type)}
              >
                {type}
              </Button>
            ))}
          </div>
        </div>

        {/* Transaction Table */}
        {filteredTransactions.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">
              {searchTerm || filterType !== 'All'
                ? 'No transactions match your filters'
                : 'No transactions found'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Sub-Category
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Payment Mode
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Account
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Description
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => {
                  const typeName = transaction.transactionType?.name || 'N/A';
                  
                  return (
                    <tr
                      key={transaction.id}
                      className="group border-b transition-colors hover:bg-muted/50"
                    >
                      <td className="px-4 py-3 text-sm font-medium">
                        <div className="min-w-[90px] whitespace-nowrap">
                          {format(new Date(transaction.date), 'dd MMM yyyy')}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={getTypeBadgeVariant(typeName)}>
                          {typeName}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {transaction.category?.name || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {transaction.subCategory?.name || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {transaction.paymentMode?.name || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {transaction.account?.name || 'N/A'}
                      </td>
                      <td className={`px-4 py-3 text-right text-sm font-medium ${getAmountColorClass(typeName)}`}>
                        {formatCurrency(transaction.amount)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="max-w-[200px] truncate">
                          {transaction.description || '-'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(transaction.id)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          aria-label="Delete transaction"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
