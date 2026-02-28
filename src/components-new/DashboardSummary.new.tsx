import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loading } from '@/components/ui/loading';
import { cn } from '@/lib/utils';
import { useTrackingCycleContext } from '../contexts/TrackingCycleContext';
import { dashboardService } from '../services';
import { DashboardSummary as DashboardSummaryType } from '../types';
import { formatCurrency } from '../utils/formatUtils';
import { format } from 'date-fns';

const DashboardSummary: React.FC = () => {
  const { trackingCycles, activeTrackingCycle, loading: cyclesLoading } = useTrackingCycleContext();
  const [selectedCycleId, setSelectedCycleId] = useState<number | undefined>(undefined);
  const [summary, setSummary] = useState<DashboardSummaryType | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Set default to active cycle when available
  useEffect(() => {
    if (activeTrackingCycle && selectedCycleId === undefined) {
      setSelectedCycleId(activeTrackingCycle.id);
    }
  }, [activeTrackingCycle, selectedCycleId]);

  // Fetch summary data when cycle changes
  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await dashboardService.getSummary(selectedCycleId);
        setSummary(data);
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Failed to fetch dashboard summary';
        setError(errorMessage);
        console.error('Error fetching dashboard summary:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [selectedCycleId]);

  const handleCycleChange = (value: string) => {
    setSelectedCycleId(value === 'all' ? undefined : Number(value));
  };

  if (cyclesLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loading message="Loading tracking cycles..." />
      </div>
    );
  }

  const cards = summary ? [
    {
      label: 'Total Income',
      value: summary.totalIncome,
      icon: TrendingUp,
      variant: 'income' as const,
      bgClass: 'bg-green-50 dark:bg-green-950/20',
      borderClass: 'border-l-4 border-l-green-500',
      textClass: 'text-green-700 dark:text-green-400',
      iconClass: 'text-green-600 dark:text-green-400',
    },
    {
      label: 'Total Expenses',
      value: summary.totalExpenses,
      icon: TrendingDown,
      variant: 'expense' as const,
      bgClass: 'bg-red-50 dark:bg-red-950/20',
      borderClass: 'border-l-4 border-l-red-500',
      textClass: 'text-red-700 dark:text-red-400',
      iconClass: 'text-red-600 dark:text-red-400',
    },
    {
      label: 'Net Balance',
      value: summary.netBalance,
      icon: Wallet,
      variant: 'balance' as const,
      bgClass: summary.netBalance >= 0 
        ? 'bg-blue-50 dark:bg-blue-950/20'
        : 'bg-orange-50 dark:bg-orange-950/20',
      borderClass: summary.netBalance >= 0 
        ? 'border-l-4 border-l-blue-500'
        : 'border-l-4 border-l-orange-500',
      textClass: summary.netBalance >= 0 
        ? 'text-blue-700 dark:text-blue-400'
        : 'text-orange-700 dark:text-orange-400',
      iconClass: summary.netBalance >= 0 
        ? 'text-blue-600 dark:text-blue-400'
        : 'text-orange-600 dark:text-orange-400',
    },
  ] : [];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Tracking Cycle Selector */}
      <div className="w-full sm:w-64">
        <Select
          value={selectedCycleId?.toString() || 'all'}
          onValueChange={handleCycleChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select tracking cycle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            {trackingCycles.map((cycle) => (
              <SelectItem key={cycle.id} value={cycle.id.toString()}>
                <span className="block truncate">
                  {cycle.name} ({format(new Date(cycle.startDate), 'MMM d, yyyy')} -{' '}
                  {format(new Date(cycle.endDate), 'MMM d, yyyy')})
                  {cycle.isActive && ' (Active)'}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Error Display */}
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center min-h-[200px]">
          <Loading message="Loading summary..." />
        </div>
      )}

      {/* Summary Cards */}
      {!loading && summary && (
        <div className="space-y-4">
          {/* Cycle Date Range */}
          <p className="text-sm text-muted-foreground">
            Period: {format(new Date(summary.period.startDate), 'MMM d, yyyy')} -{' '}
            {format(new Date(summary.period.endDate), 'MMM d, yyyy')}
          </p>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {cards.map((card) => {
              const Icon = card.icon;
              return (
                <Card
                  key={card.label}
                  className={cn(
                    'transition-all duration-200 hover:scale-105 hover:shadow-lg cursor-default',
                    card.bgClass,
                    card.borderClass
                  )}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-muted-foreground">
                        {card.label}
                      </span>
                      <Icon className={cn('w-5 h-5', card.iconClass)} />
                    </div>
                    <p className={cn('text-3xl font-bold tracking-tight', card.textClass)}>
                      {formatCurrency(card.value)}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardSummary;
