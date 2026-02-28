import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { useUserStats } from '../hooks';

interface UserStatsProps {
  userId: number;
  onClose: () => void;
}

export const UserStats: React.FC<UserStatsProps> = ({ userId, onClose }) => {
  const { stats, loading, error } = useUserStats(userId);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const calculateBalance = () => {
    if (!stats) return 0;
    return stats.totalIncome - stats.totalExpense;
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>User Statistics</DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {stats && !loading && (
          <div className="space-y-6 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {/* Total Transactions */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center mb-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-primary mr-2"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                    <span className="text-sm text-muted-foreground">Total Transactions</span>
                  </div>
                  <p className="text-2xl font-bold">{stats.totalTransactions}</p>
                </CardContent>
              </Card>

              {/* Total Income */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center mb-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-green-600 mr-2"
                    >
                      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                      <polyline points="16 7 22 7 22 13" />
                    </svg>
                    <span className="text-sm text-muted-foreground">Total Income</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalIncome)}</p>
                </CardContent>
              </Card>

              {/* Total Expense */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center mb-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-red-600 mr-2"
                    >
                      <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
                      <polyline points="16 17 22 17 22 11" />
                    </svg>
                    <span className="text-sm text-muted-foreground">Total Expense</span>
                  </div>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(stats.totalExpense)}</p>
                </CardContent>
              </Card>

              {/* Net Balance */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center mb-2">
                    <span className="text-sm text-muted-foreground">Net Balance</span>
                  </div>
                  <p className={`text-2xl font-bold ${calculateBalance() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(calculateBalance())}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-4">Transaction Date Range</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="border-2">
                  <CardContent className="p-4">
                    <div className="flex items-center mb-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-muted-foreground mr-2"
                      >
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      <span className="text-sm text-muted-foreground">First Transaction</span>
                    </div>
                    <p className="text-base font-medium">{formatDate(stats.firstTransactionDate)}</p>
                  </CardContent>
                </Card>
                <Card className="border-2">
                  <CardContent className="p-4">
                    <div className="flex items-center mb-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-muted-foreground mr-2"
                      >
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      <span className="text-sm text-muted-foreground">Last Transaction</span>
                    </div>
                    <p className="text-base font-medium">{formatDate(stats.lastTransactionDate)}</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end mt-4">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
