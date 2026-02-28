import { 
  format, 
  parseISO, 
  isValid, 
  startOfDay, 
  endOfDay, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth,
  addDays,
  addWeeks,
  addMonths,
  subDays,
  subWeeks,
  subMonths,
  isWithinInterval,
  getDaysInMonth,
  getDay
} from 'date-fns';

/**
 * Format a date to YYYY-MM-DD string for API
 */
export const formatDateForAPI = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

/**
 * Parse ISO date string to Date object
 */
export const parseDate = (dateString: string): Date => {
  return parseISO(dateString);
};

/**
 * Format date for display (e.g., "Jan 15, 2024")
 */
export const formatDateForDisplay = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'MMM dd, yyyy');
};

/**
 * Format date for input fields (YYYY-MM-DD)
 */
export const formatDateForInput = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'yyyy-MM-dd');
};

/**
 * Check if a date string is valid
 */
export const isValidDate = (dateString: string): boolean => {
  try {
    const date = parseISO(dateString);
    return isValid(date);
  } catch {
    return false;
  }
};

/**
 * Get current date as YYYY-MM-DD string
 */
export const getCurrentDate = (): string => {
  return formatDateForAPI(new Date());
};

// Types for view mode functionality
export type ViewMode = 'daily' | 'weekly' | 'monthly' | 'calendar' | 'custom';

export interface DateRange {
  start: Date;
  end: Date;
}

export interface DayData {
  date: Date;
  income: number;
  expense: number;
  transfers: number;
  transactions: any[]; // Will be typed as Transaction[] in actual usage
}

/**
 * Calculate date range based on view mode and reference date
 */
export const getDateRange = (mode: ViewMode, referenceDate: Date, customStart?: Date, customEnd?: Date): DateRange => {
  switch (mode) {
    case 'daily':
      return {
        start: startOfDay(referenceDate),
        end: endOfDay(referenceDate)
      };
    
    case 'weekly':
      return {
        start: startOfWeek(referenceDate, { weekStartsOn: 1 }), // Monday
        end: endOfWeek(referenceDate, { weekStartsOn: 1 }) // Sunday
      };
    
    case 'monthly':
      return {
        start: startOfMonth(referenceDate),
        end: endOfMonth(referenceDate)
      };
    
    case 'calendar':
      return {
        start: startOfMonth(referenceDate),
        end: endOfMonth(referenceDate)
      };
    
    case 'custom':
      if (!customStart || !customEnd) {
        // Default to current month if custom dates not provided
        return {
          start: startOfMonth(referenceDate),
          end: endOfMonth(referenceDate)
        };
      }
      return {
        start: startOfDay(customStart),
        end: endOfDay(customEnd)
      };
    
    default:
      return {
        start: startOfDay(referenceDate),
        end: endOfDay(referenceDate)
      };
  }
};

/**
 * Navigate to previous or next period based on view mode
 */
export const navigateDate = (mode: ViewMode, currentDate: Date, direction: 'prev' | 'next'): Date => {
  switch (mode) {
    case 'daily':
      return direction === 'next' 
        ? addDays(currentDate, 1) 
        : subDays(currentDate, 1);
    
    case 'weekly':
      return direction === 'next'
        ? addWeeks(currentDate, 1)
        : subWeeks(currentDate, 1);
    
    case 'monthly':
    case 'calendar':
      return direction === 'next'
        ? addMonths(currentDate, 1)
        : subMonths(currentDate, 1);
    
    case 'custom':
      // For custom mode, navigation doesn't apply
      return currentDate;
    
    default:
      return currentDate;
  }
};

/**
 * Check if a date string is within a date range
 */
export const isInRange = (dateString: string, start: Date, end: Date): boolean => {
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) {
      return false;
    }
    return isWithinInterval(date, { start, end });
  } catch {
    return false;
  }
};

/**
 * Get formatted label for display based on view mode
 */
export const getDateLabel = (mode: ViewMode, date: Date, customStart?: Date, customEnd?: Date): string => {
  switch (mode) {
    case 'daily':
      return format(date, 'MMMM d, yyyy');
    
    case 'weekly': {
      const weekStart = startOfWeek(date, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
      return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
    }
    
    case 'monthly':
    case 'calendar':
      return format(date, 'MMMM yyyy');
    
    case 'custom':
      if (customStart && customEnd) {
        return `${format(customStart, 'MMM d, yyyy')} - ${format(customEnd, 'MMM d, yyyy')}`;
      }
      return format(date, 'MMMM yyyy');
    
    default:
      return format(date, 'MMMM d, yyyy');
  }
};

/**
 * Get calendar month data with transaction totals for each day
 */
export const getCalendarMonth = (referenceDate: Date, transactions: any[]): DayData[] => {
  const monthStart = startOfMonth(referenceDate);
  const monthEnd = endOfMonth(referenceDate);
  const daysInMonth = getDaysInMonth(referenceDate);
  
  // Get the day of week for the first day (0 = Sunday, 6 = Saturday)
  const firstDayOfWeek = getDay(monthStart);
  
  // Calculate how many days from previous month to show
  const daysFromPrevMonth = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // Adjust for Monday start
  
  const calendarDays: DayData[] = [];
  
  // Add days from previous month
  for (let i = daysFromPrevMonth; i > 0; i--) {
    const date = subDays(monthStart, i);
    calendarDays.push(createDayData(date, transactions));
  }
  
  // Add days from current month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), day);
    calendarDays.push(createDayData(date, transactions));
  }
  
  // Add days from next month to complete the grid (up to 42 days total for 6 weeks)
  const remainingDays = 42 - calendarDays.length;
  for (let i = 1; i <= remainingDays; i++) {
    const date = addDays(monthEnd, i);
    calendarDays.push(createDayData(date, transactions));
  }
  
  return calendarDays;
};

/**
 * Helper function to create day data with transaction totals
 */
const createDayData = (date: Date, transactions: any[]): DayData => {
  const dateString = formatDateForAPI(date);
  
  // Filter transactions for this specific day
  const dayTransactions = transactions.filter(t => {
    const transactionDate = formatDateForAPI(parseISO(t.date));
    return transactionDate === dateString;
  });
  
  // Calculate totals by type
  const income = dayTransactions
    .filter(t => t.type === 'Income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const expense = dayTransactions
    .filter(t => t.type === 'Expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const transfers = dayTransactions
    .filter(t => t.type === 'Transfer')
    .reduce((sum, t) => sum + t.amount, 0);
  
  return {
    date,
    income,
    expense,
    transfers,
    transactions: dayTransactions
  };
};
