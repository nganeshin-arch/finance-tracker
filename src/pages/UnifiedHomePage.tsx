import React, { useState, useMemo, lazy, Suspense } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wallet, Settings, LogOut } from 'lucide-react';
import { useTransactions } from '../hooks/useTransactions';
import { useConfig } from '../hooks/useConfig';
import { useAuth } from '../contexts/AuthContext';
import { ViewMode, getDateRange, isInRange } from '../utils/dateUtils';
import { Transaction } from '../types/models';
import { CreateTransactionDTO } from '../types/dtos';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { ViewModeSelector } from '../components/ViewModeSelector';
import { TransactionTable } from '../components/TransactionTable';
import { TransactionForm } from '../components/TransactionForm.new';
import { SummaryCards } from '../components/SummaryCards';
import { DualPieChartLayout } from '../components/DualPieChartLayout';
import { useToast } from '../hooks/useToast';
import { Loading } from '../components/ui/loading';

// Lazy load CalendarView component for better performance
const CalendarView = lazy(() => import('../components/CalendarView').then(module => ({ default: module.CalendarView })));

export const UnifiedHomePage: React.FC = () => {
  // State management for view mode and date filtering
  const [viewMode, setViewMode] = useState<ViewMode>('monthly');
  const [referenceDate, setReferenceDate] = useState<Date>(new Date());
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>(undefined);
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>(undefined);

  // Toast notifications
  const { toast } = useToast();
  
  // Auth context for logout functionality
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  // Initialize existing hooks
  const { 
    transactions, 
    createTransaction,
    deleteTransaction,
    fetchTransactions
  } = useTransactions();
  
  // Config is loaded via context, not needed here directly
  useConfig();

  // Handle logout
  const handleLogout = () => {
    logout();
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out',
    });
    navigate('/login');
  };

  // Handle transaction creation
  const handleCreateTransaction = async (data: CreateTransactionDTO) => {
    try {
      await createTransaction(data);
      toast({
        title: 'Success',
        description: 'Transaction created successfully',
      });
      // Refresh transactions to update the list
      await fetchTransactions();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create transaction',
        variant: 'error',
      });
      throw error; // Re-throw to let form handle it
    }
  };

  // Handle transaction deletion
  const handleDeleteTransaction = async (id: number) => {
    try {
      await deleteTransaction(id);
      toast({
        title: 'Success',
        description: 'Transaction deleted successfully',
      });
      // Refresh transactions to update the list
      await fetchTransactions();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete transaction',
        variant: 'error',
      });
    }
  };

  // Transaction filtering logic based on view mode
  const filteredTransactions = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return [];
    }

    const dateRange = getDateRange(viewMode, referenceDate, customStartDate, customEndDate);
    
    return transactions.filter((transaction: Transaction) => {
      return isInRange(transaction.date.toString(), dateRange.start, dateRange.end);
    });
  }, [transactions, viewMode, referenceDate, customStartDate, customEndDate]);

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          {/* Logo and App Name */}
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Wallet className="h-7 w-7 text-primary" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              My Finance Planner
            </span>
          </Link>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* User info - hidden on mobile */}
            {user && (
              <span className="hidden sm:inline text-sm text-muted-foreground mr-2">
                {user.email}
              </span>
            )}
            
            {/* Admin Panel Link - Only visible for admin users */}
            {user?.role === 'admin' && (
              <Link to="/admin">
                <Button variant="outline" size="sm" className="gap-2">
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Admin Panel</span>
                </Button>
              </Link>
            )}

            {/* Logout Button */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 max-w-7xl">
        {/* View Mode Selector */}
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

        {/* Dashboard Section */}
        <div className="space-y-6">
          {/* Dashboard Header */}
          <div className="flex items-center gap-3 pb-2 border-b-2 border-primary/20">
            <div className="h-8 w-1 bg-primary rounded-full"></div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          </div>

          {/* Summary Cards - Responsive grid: 1 col mobile, 2 cols tablet, 4 cols desktop */}
          <SummaryCards transactions={filteredTransactions} />

          {/* Dual Pie Charts - Income and Expense Category Breakdown */}
          <DualPieChartLayout transactions={filteredTransactions} />
        </div>

        {/* Transaction Form - Embedded, responsive padding */}
        <Card className="border-2 shadow-lg">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="h-6 w-1 bg-primary rounded-full"></div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">Add Transaction</h2>
            </div>
            <TransactionForm
              onSubmit={handleCreateTransaction}
              onCancel={() => {
                // No-op for embedded form
              }}
            />
          </CardContent>
        </Card>

        {/* Transactions Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 pb-2 border-b-2 border-primary/20">
            <div className="h-8 w-1 bg-primary rounded-full"></div>
            <h2 className="text-2xl font-bold text-foreground">Transactions</h2>
          </div>

          {/* Conditional rendering for CalendarView vs TransactionTable - both are responsive */}
          {viewMode === 'calendar' ? (
          <Suspense fallback={<Loading />}>
            <CalendarView
              transactions={filteredTransactions}
              referenceDate={referenceDate}
              onDelete={handleDeleteTransaction}
            />
          </Suspense>
        ) : (
          <TransactionTable
            transactions={filteredTransactions}
            onDelete={handleDeleteTransaction}
          />
          )}
        </div>
      </main>
    </div>
  );
};
