import React, { useState, useMemo, lazy, Suspense } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Settings, LogOut } from 'lucide-react';
import { useTransactions } from '../hooks/useTransactions';
import { useConfig } from '../hooks/useConfig';
import { useAuth } from '../contexts/AuthContext';
import { useUserPreferences } from '../hooks/useUserPreferences';
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
import { UserSettings } from '../components/UserSettings';
import { useToast } from '../hooks/useToast';
import { Loading } from '../components/ui/loading';
import { Skeleton } from '../components/ui/loading';

// Skeleton component for SummaryCards loading state
const SummaryCardsSkeleton: React.FC = () => {
  return (
    <div className="dashboard-grid dashboard-grid-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div 
          key={i} 
          className="rounded-lg border bg-card p-6 shadow-sm animate-fade-in-up"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24 animate-shimmer" />
            <Skeleton className="h-8 w-8 rounded-full animate-shimmer" />
          </div>
          <Skeleton className="mt-4 h-8 w-32 animate-shimmer" />
          <div className="mt-2 flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-full animate-shimmer" />
            <Skeleton className="h-3 w-16 animate-shimmer" />
          </div>
        </div>
      ))}
    </div>
  );
};

// Skeleton component for DualPieChartLayout loading state
const DualPieChartSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[...Array(2)].map((_, i) => (
        <div 
          key={i} 
          className="rounded-lg border bg-card p-6 shadow-sm animate-fade-in-up"
          style={{ animationDelay: `${i * 150}ms` }}
        >
          <Skeleton className="mb-4 h-6 w-32 animate-shimmer" />
          <div className="flex items-center justify-center" style={{ height: '200px' }}>
            <Skeleton className="h-32 w-32 rounded-full animate-shimmer" />
          </div>
          <div className="mt-4 space-y-2">
            {[...Array(3)].map((_, j) => (
              <div key={j} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-3 w-3 rounded-full animate-shimmer" />
                  <Skeleton className="h-3 w-20 animate-shimmer" />
                </div>
                <Skeleton className="h-3 w-12 animate-shimmer" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// Skeleton component for TransactionTable loading state
const TransactionTableSkeleton: React.FC = () => {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div 
          key={i} 
          className="flex items-center gap-4 rounded-lg border p-4 animate-fade-in-up"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <Skeleton className="h-4 w-24 animate-shimmer" />
          <Skeleton className="h-4 w-32 animate-shimmer" />
          <Skeleton className="h-4 w-20 animate-shimmer" />
          <Skeleton className="h-4 w-24 animate-shimmer" />
          <Skeleton className="h-8 w-16 animate-shimmer" />
        </div>
      ))}
    </div>
  );
};

// Lazy load CalendarView component for better performance
const CalendarView = lazy(() => import('../components/CalendarView').then(module => ({ default: module.CalendarView })));

export const UnifiedHomePage: React.FC = () => {
  // State management for view mode and date filtering
  const [viewMode, setViewMode] = useState<ViewMode>('monthly');
  const [referenceDate, setReferenceDate] = useState<Date>(new Date());
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>(undefined);
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>(undefined);
  const [showSettings, setShowSettings] = useState(false);

  // State for scroll animations and loading states
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasInitialData, setHasInitialData] = useState(false);

  // Toast notifications
  const { toast } = useToast();

  // Auth context for logout functionality
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  // User preferences for custom monthly ranges
  const { preferences } = useUserPreferences();

  // Initialize existing hooks with loading state
  const {
    transactions,
    loading: transactionsLoading,
    createTransaction,
    deleteTransaction,
    fetchTransactions
  } = useTransactions();

  // Config is loaded via context, not needed here directly
  useConfig();

  // Set loaded state after component mounts for stagger animations
  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Track when initial data is loaded
  React.useEffect(() => {
    if (!transactionsLoading && transactions.length >= 0) {
      const timer = setTimeout(() => setHasInitialData(true), 200);
      return () => clearTimeout(timer);
    }
  }, [transactionsLoading, transactions]);

  // Smooth scroll to section function
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      });
    }
  };

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

    const dateRange = getDateRange(
      viewMode, 
      referenceDate, 
      customStartDate, 
      customEndDate,
      preferences?.monthlyStartDate
    );

    return transactions.filter((transaction: Transaction) => {
      return isInRange(transaction.date.toString(), dateRange.start, dateRange.end);
    });
  }, [transactions, viewMode, referenceDate, customStartDate, customEndDate, preferences?.monthlyStartDate]);

  // Previous period transactions for trend calculation
  const previousPeriodTransactions = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return [];
    }

    // Calculate previous period date range
    let previousReferenceDate: Date;

    switch (viewMode) {
      case 'daily':
        previousReferenceDate = new Date(referenceDate);
        previousReferenceDate.setDate(previousReferenceDate.getDate() - 1);
        break;
      case 'weekly':
        previousReferenceDate = new Date(referenceDate);
        previousReferenceDate.setDate(previousReferenceDate.getDate() - 7);
        break;
      case 'monthly':
      case 'calendar':
        previousReferenceDate = new Date(referenceDate);
        previousReferenceDate.setMonth(previousReferenceDate.getMonth() - 1);
        break;
      case 'custom':
        if (customStartDate && customEndDate) {
          const daysDiff = Math.ceil((customEndDate.getTime() - customStartDate.getTime()) / (1000 * 60 * 60 * 24));
          previousReferenceDate = new Date(customStartDate);
          previousReferenceDate.setDate(previousReferenceDate.getDate() - daysDiff);
        } else {
          previousReferenceDate = new Date(referenceDate);
          previousReferenceDate.setMonth(previousReferenceDate.getMonth() - 1);
        }
        break;
      default:
        previousReferenceDate = new Date(referenceDate);
        previousReferenceDate.setMonth(previousReferenceDate.getMonth() - 1);
    }

    const previousDateRange = getDateRange(
      viewMode, 
      previousReferenceDate,
      customStartDate ? new Date(customStartDate.getTime() - (customEndDate ? (customEndDate.getTime() - customStartDate.getTime()) : 30 * 24 * 60 * 60 * 1000)) : undefined,
      customStartDate ? customStartDate : undefined,
      preferences?.monthlyStartDate
    );

    return transactions.filter((transaction: Transaction) => {
      return isInRange(transaction.date.toString(), previousDateRange.start, previousDateRange.end);
    });
  }, [transactions, viewMode, referenceDate, customStartDate, customEndDate]);

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header with Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          {/* Logo and App Name - ExpenseIQ Branding */}
          <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
            <div className="relative">
              <span className="text-3xl expenseiq-logo tracking-tight">
                <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                  Expense
                </span>
                <span className="bg-gradient-to-r from-primary/70 via-primary/50 to-primary/40 bg-clip-text text-transparent">
                  IQ
                </span>
              </span>
              <div className="text-xs text-muted-foreground mt-0.5 expenseiq-tagline">
                Smart Personal Finance
              </div>
            </div>
          </Link>

          {/* Navigation Links - Hidden on mobile, visible on tablet+ */}
          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={() => scrollToSection('dashboard-section')}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 hover:scale-105 active:scale-95"
            >
              Dashboard
            </button>
            <button
              onClick={() => scrollToSection('add-transaction-section')}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 hover:scale-105 active:scale-95"
            >
              Add Transaction
            </button>
            <button
              onClick={() => scrollToSection('transactions-section')}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 hover:scale-105 active:scale-95"
            >
              Transactions
            </button>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* User info - hidden on mobile */}
            {user && (
              <span className="hidden sm:inline text-sm text-muted-foreground mr-2">
                {user.email}
              </span>
            )}

            {/* User Settings Button */}
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </Button>

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

      {/* Main Content with Scroll Animations */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 max-w-7xl">
        {/* User Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">User Settings</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettings(false)}
                >
                  ×
                </Button>
              </div>
              <div className="p-4">
                <UserSettings onClose={() => setShowSettings(false)} />
              </div>
            </div>
          </div>
        )}

        {/* View Mode Selector - Full width across all breakpoints */}
        <div className="mb-6 sm:mb-8">
          <Card
            variant="premium"
            className={`shadow-lg hover:shadow-xl transition-all duration-300 ${
              isLoaded
                ? 'motion-safe:animate-fade-in opacity-100 translate-y-0'
                : 'opacity-0 translate-y-4'
            }`}
            style={{ animationDelay: '0ms' }}
          >
            <CardContent className="p-4 sm:p-6">
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
            </CardContent>
          </Card>
        </div>

        {/* Responsive Layout: Stacked on mobile, side-by-side on desktop */}
        <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-5 lg:gap-8">

          {/* Dashboard Section - Takes 3 columns on desktop, full width on mobile/tablet */}
          <section 
            id="dashboard-section" 
            className="lg:col-span-3"
          >
            <Card
              variant="premium"
              className={`shadow-lg hover:shadow-xl transition-all duration-300 h-full ${
                isLoaded
                  ? 'motion-safe:animate-fade-in opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-4'
              }`}
              style={{ animationDelay: '100ms' }}
            >
              <CardContent className="p-6 sm:p-8 space-y-6">
                {/* Dashboard Header */}
                <div className="flex items-center gap-3 pb-4 border-b-2 border-primary/20">
                  <div className="h-8 w-1 bg-gradient-to-b from-primary to-primary/70 rounded-full"></div>
                  <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                    Dashboard
                  </h1>
                </div>

                {/* Summary Cards - Enhanced with trend indicators, gradient accents, and staggered animation */}
                <div
                  className={`space-y-2 ${
                    isLoaded
                      ? 'motion-safe:animate-fade-in opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-4'
                  }`}
                  style={{ animationDelay: '200ms' }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-muted-foreground">Financial Overview</h2>
                    <div className="text-xs text-muted-foreground/70">
                      Key financial metrics and trends
                    </div>
                  </div>
                  {transactionsLoading ? (
                    <SummaryCardsSkeleton />
                  ) : (
                    <div className={`transition-all duration-500 ${hasInitialData ? 'animate-fade-in opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                      <SummaryCards
                        transactions={filteredTransactions}
                        previousTransactions={previousPeriodTransactions}
                        isLoading={transactionsLoading}
                      />
                    </div>
                  )}
                </div>

                {/* Dual Pie Charts - Enhanced with spacing and staggered animation */}
                <div
                  className={`space-y-2 ${
                    isLoaded
                      ? 'motion-safe:animate-fade-in opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-4'
                  }`}
                  style={{ animationDelay: '300ms' }}
                >
                  <h2 className="text-lg font-semibold text-muted-foreground mb-4">Category Breakdown</h2>
                  {transactionsLoading ? (
                    <DualPieChartSkeleton />
                  ) : (
                    <div className={`transition-all duration-500 ${hasInitialData ? 'animate-fade-in opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                      <DualPieChartLayout transactions={filteredTransactions} />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Transaction Form Section - Takes 2 columns on desktop, full width on mobile/tablet */}
          <section 
            id="add-transaction-section" 
            className="lg:col-span-2"
          >
            <Card
              variant="premium"
              className={`shadow-lg hover:shadow-xl transition-all duration-300 h-full ${
                isLoaded
                  ? 'motion-safe:animate-fade-in opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-4'
              }`}
              style={{ animationDelay: '400ms' }}
            >
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6 sm:mb-8">
                  <div className="h-6 w-1 bg-gradient-to-b from-primary to-primary/70 rounded-full"></div>
                  <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                    Add Transaction
                  </h2>
                </div>
                <TransactionForm
                  onSubmit={handleCreateTransaction}
                  onCancel={() => {
                    // No-op for embedded form
                  }}
                />
              </CardContent>
            </Card>
          </section>

        </div>

        {/* Transactions Section - Full width below the main layout */}
        <section 
          id="transactions-section" 
          className="mt-6 lg:mt-8"
        >
          <Card
            variant="premium"
            className={`shadow-lg hover:shadow-xl transition-all duration-300 ${
              isLoaded
                ? 'motion-safe:animate-fade-in opacity-100 translate-y-0'
                : 'opacity-0 translate-y-4'
            }`}
            style={{ animationDelay: '500ms' }}
          >
            <CardContent className="p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b-2 border-primary/20">
                <div className="h-8 w-1 bg-gradient-to-b from-primary to-primary/70 rounded-full"></div>
                <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  Transactions
                </h2>
              </div>

              {/* Conditional rendering for CalendarView vs TransactionTable with fade-in animation */}
              <div
                className={`transition-all duration-300 ${
                  isLoaded
                    ? 'motion-safe:animate-fade-in opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-4'
                }`}
                style={{ animationDelay: '600ms' }}
              >
                {transactionsLoading ? (
                  <TransactionTableSkeleton />
                ) : (
                  <div className={`transition-all duration-500 ${hasInitialData ? 'animate-fade-in opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
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
                )}
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
