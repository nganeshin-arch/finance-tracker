import React, { useMemo, useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Wallet, Sparkles } from 'lucide-react';
import { StatCard } from './ui/stat-card';
import { DashboardGrid } from './ui/dashboard-grid';
import { formatCurrency } from '../utils/formatUtils';
import { Transaction } from '../types/models';

interface SummaryCardsProps {
  transactions: Transaction[];
  /** Previous period transactions for trend calculation */
  previousTransactions?: Transaction[];
  /** Loading state for smooth transitions */
  isLoading?: boolean;
}

// Helper function to format currency values for StatCard
const formatCurrencyValue = (value: number | string): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return formatCurrency(numValue);
};

export const SummaryCards: React.FC<SummaryCardsProps> = ({ 
  transactions, 
  previousTransactions = [],
  isLoading = false
}) => {
  // State for smooth data transitions
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Set data loaded state when transactions are available
  useEffect(() => {
    if (!isLoading && transactions.length >= 0) {
      const timer = setTimeout(() => setIsDataLoaded(true), 100);
      return () => clearTimeout(timer);
    } else {
      setIsDataLoaded(false);
    }
  }, [isLoading, transactions]);
  // Calculate summary totals from filtered transactions
  const summary = useMemo(() => {
    const income = transactions
      .filter(t => t.transactionType?.name === 'Income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expense = transactions
      .filter(t => t.transactionType?.name === 'Expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const transfers = transactions
      .filter(t => t.transactionType?.name === 'Transfer')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = income - expense;

    // Calculate previous period totals for trend indicators
    const prevIncome = previousTransactions
      .filter(t => t.transactionType?.name === 'Income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const prevExpense = previousTransactions
      .filter(t => t.transactionType?.name === 'Expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const prevTransfers = previousTransactions
      .filter(t => t.transactionType?.name === 'Transfer')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const prevBalance = prevIncome - prevExpense;

    // Calculate trend percentages
    const calculateTrendPercentage = (current: number, previous: number): string => {
      if (previous === 0) return current > 0 ? '+100%' : '0%';
      const change = ((current - previous) / Math.abs(previous)) * 100;
      return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
    };

    return {
      income,
      expense,
      transfers,
      balance,
      trends: {
        income: calculateTrendPercentage(income, prevIncome),
        expense: calculateTrendPercentage(expense, prevExpense),
        transfers: calculateTrendPercentage(transfers, prevTransfers),
        balance: calculateTrendPercentage(balance, prevBalance),
      },
      trendDirections: {
        income: income >= prevIncome ? 'positive' : 'negative',
        expense: expense <= prevExpense ? 'positive' : 'negative', // Lower expenses are positive
        transfers: transfers >= prevTransfers ? 'positive' : transfers < prevTransfers ? 'negative' : 'neutral',
        balance: balance >= prevBalance ? 'positive' : 'negative',
      }
    };
  }, [transactions, previousTransactions]);

  return (
    <div className={`transition-all duration-300 ${isDataLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
      <DashboardGrid columns={4} enableStagger={true} staggerDelay={150}>
        {/* Total Balance - Key metric with gradient accent */}
        <StatCard
          label="Total Balance"
          value={summary.balance}
          icon={summary.balance >= 0 ? Sparkles : Wallet}
          formatValue={formatCurrencyValue}
          trend={summary.trendDirections.balance as "positive" | "negative"}
          trendValue={summary.trends.balance}
          showTrendIcon={true}
          useGradient={true}
          gradientClass={summary.balance >= 0 ? "bg-gradient-income" : "bg-gradient-expense"}
          ariaLabel={`Total balance: ${formatCurrency(summary.balance)}, trend ${summary.trends.balance}`}
        />

        {/* Monthly Income - Key metric with gradient accent */}
        <StatCard
          label="Monthly Income"
          value={summary.income}
          icon={TrendingUp}
          formatValue={formatCurrencyValue}
          trend={summary.trendDirections.income as "positive" | "negative"}
          trendValue={summary.trends.income}
          showTrendIcon={true}
          useGradient={true}
          gradientClass="bg-gradient-income"
          ariaLabel={`Monthly income: ${formatCurrency(summary.income)}, trend ${summary.trends.income}`}
        />
        
        {/* Monthly Expenses - Key metric with gradient accent and overflow protection */}
        <StatCard
          label="Monthly Expenses"
          value={summary.expense}
          icon={TrendingDown}
          formatValue={formatCurrencyValue}
          trend={summary.trendDirections.expense as "positive" | "negative"}
          trendValue={summary.trends.expense}
          showTrendIcon={true}
          useGradient={true}
          gradientClass="bg-gradient-expense"
          ariaLabel={`Monthly expenses: ${formatCurrency(summary.expense)}, trend ${summary.trends.expense}`}
        />
        
        {/* Transfers - Standard styling with trend indicators */}
        <StatCard
          label="Transfers"
          value={summary.transfers}
          icon={DollarSign}
          formatValue={formatCurrencyValue}
          trend={summary.trendDirections.transfers as "positive" | "negative" | "neutral"}
          trendValue={summary.trends.transfers}
          showTrendIcon={true}
          ariaLabel={`Transfers: ${formatCurrency(summary.transfers)}, trend ${summary.trends.transfers}`}
        />
      </DashboardGrid>
    </div>
  );
};
