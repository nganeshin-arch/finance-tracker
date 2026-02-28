import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Wallet } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { cn } from '../lib/utils';
import { formatCurrency } from '../utils/formatUtils';
import { Transaction } from '../types/models';

interface SummaryCardsProps {
  transactions: Transaction[];
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ transactions }) => {
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
    
    return {
      income,
      expense,
      transfers,
      balance: income - expense
    };
  }, [transactions]);

  const cards = [
    {
      label: 'Income',
      value: summary.income,
      icon: TrendingUp,
      bgClass: 'bg-green-50 dark:bg-green-950/20',
      borderClass: 'border-l-4 border-l-green-500',
      textClass: 'text-green-700 dark:text-green-400',
      iconClass: 'text-green-600 dark:text-green-400',
    },
    {
      label: 'Expenses',
      value: summary.expense,
      icon: TrendingDown,
      bgClass: 'bg-red-50 dark:bg-red-950/20',
      borderClass: 'border-l-4 border-l-red-500',
      textClass: 'text-red-700 dark:text-red-400',
      iconClass: 'text-red-600 dark:text-red-400',
    },
    {
      label: 'Transfers',
      value: summary.transfers,
      icon: DollarSign,
      bgClass: 'bg-blue-50 dark:bg-blue-950/20',
      borderClass: 'border-l-4 border-l-blue-500',
      textClass: 'text-blue-700 dark:text-blue-400',
      iconClass: 'text-blue-600 dark:text-blue-400',
    },
    {
      label: 'Balance',
      value: summary.balance,
      icon: Wallet,
      bgClass: summary.balance >= 0 
        ? 'bg-emerald-50 dark:bg-emerald-950/20'
        : 'bg-orange-50 dark:bg-orange-950/20',
      borderClass: summary.balance >= 0 
        ? 'border-l-4 border-l-emerald-500'
        : 'border-l-4 border-l-orange-500',
      textClass: summary.balance >= 0 
        ? 'text-emerald-700 dark:text-emerald-400'
        : 'text-orange-700 dark:text-orange-400',
      iconClass: summary.balance >= 0 
        ? 'text-emerald-600 dark:text-emerald-400'
        : 'text-orange-600 dark:text-orange-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card
            key={card.label}
            className={cn(
              'transition-transform hover:scale-105',
              card.bgClass,
              card.borderClass
            )}
          >
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                  {card.label}
                </span>
                <Icon className={cn('h-4 w-4 sm:h-5 sm:w-5', card.iconClass)} />
              </div>
              <p className={cn('text-xl sm:text-2xl font-bold', card.textClass)}>
                {formatCurrency(card.value)}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
