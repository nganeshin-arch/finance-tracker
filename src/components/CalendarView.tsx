import React, { useState, useMemo } from 'react';
import { format, isSameMonth } from 'date-fns';
import { Trash2 } from 'lucide-react';
import { Transaction } from '@/types/models';
import { getCalendarMonth, DayData } from '@/utils/dateUtils';
import { formatCurrency } from '@/utils/formatUtils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface CalendarViewProps {
  transactions: Transaction[];
  referenceDate: Date;
  onDelete: (id: number) => void;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const CalendarView: React.FC<CalendarViewProps> = ({
  transactions,
  referenceDate,
  onDelete,
}) => {
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);

  // Generate calendar month data with transaction totals
  const calendarDays = useMemo(() => {
    // Transform transactions to include type name for filtering
    const transformedTransactions = transactions.map(t => ({
      ...t,
      type: t.transactionType?.name || 'Unknown'
    }));
    return getCalendarMonth(referenceDate, transformedTransactions);
  }, [referenceDate, transactions]);

  const handleDayClick = (dayData: DayData) => {
    if (dayData.transactions.length > 0) {
      setSelectedDay(dayData);
    }
  };

  const handleCloseDetails = () => {
    setSelectedDay(null);
  };

  return (
    <div className="space-y-4">
      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-4">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-muted-foreground py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((dayData, index) => {
              const isCurrentMonth = isSameMonth(dayData.date, referenceDate);
              const hasTransactions = dayData.transactions.length > 0;
              const isSelected = selectedDay?.date.getTime() === dayData.date.getTime();

              return (
                <button
                  key={index}
                  onClick={() => handleDayClick(dayData)}
                  disabled={!hasTransactions}
                  className={cn(
                    'min-h-[80px] p-2 rounded-lg border transition-all',
                    'flex flex-col items-start justify-start',
                    'hover:border-primary hover:shadow-sm',
                    isCurrentMonth ? 'bg-card' : 'bg-muted/30',
                    !isCurrentMonth && 'text-muted-foreground',
                    hasTransactions && 'cursor-pointer',
                    !hasTransactions && 'cursor-default opacity-60',
                    isSelected && 'border-primary bg-primary/5'
                  )}
                >
                  {/* Day Number */}
                  <span className={cn(
                    'text-sm font-medium mb-1',
                    !isCurrentMonth && 'text-muted-foreground'
                  )}>
                    {format(dayData.date, 'd')}
                  </span>

                  {/* Transaction Totals */}
                  {hasTransactions && (
                    <div className="w-full space-y-0.5 text-xs">
                      {dayData.income > 0 && (
                        <div className="text-green-600 dark:text-green-400 font-medium">
                          +{formatCurrency(dayData.income)}
                        </div>
                      )}
                      {dayData.expense > 0 && (
                        <div className="text-red-600 dark:text-red-400 font-medium">
                          -{formatCurrency(dayData.expense)}
                        </div>
                      )}
                      {dayData.transfers > 0 && (
                        <div className="text-blue-600 dark:text-blue-400 font-medium">
                          ↔{formatCurrency(dayData.transfers)}
                        </div>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Day Details View */}
      {selectedDay && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {format(selectedDay.date, 'MMMM d, yyyy')}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCloseDetails}
              >
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {selectedDay.transactions.map((transaction: any) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors group"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        'px-2 py-0.5 rounded text-xs font-medium',
                        transaction.type === 'Income' && 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                        transaction.type === 'Expense' && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                        transaction.type === 'Transfer' && 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      )}>
                        {transaction.type}
                      </span>
                      <span className="text-sm font-medium">
                        {transaction.category?.name}
                      </span>
                      {transaction.subCategory && (
                        <span className="text-xs text-muted-foreground">
                          • {transaction.subCategory.name}
                        </span>
                      )}
                    </div>
                    {transaction.description && (
                      <p className="text-sm text-muted-foreground">
                        {transaction.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      'text-lg font-semibold',
                      transaction.type === 'Income' && 'text-green-600 dark:text-green-400',
                      transaction.type === 'Expense' && 'text-red-600 dark:text-red-400',
                      transaction.type === 'Transfer' && 'text-blue-600 dark:text-blue-400'
                    )}>
                      {transaction.type === 'Income' && '+'}
                      {transaction.type === 'Expense' && '-'}
                      {transaction.type === 'Transfer' && '↔'}
                      {formatCurrency(transaction.amount)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => onDelete(transaction.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
