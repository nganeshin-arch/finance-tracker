import React from 'react';
import { 
  Calendar as CalendarIcon, 
  CalendarDays, 
  CalendarRange, 
  Clock, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { ViewMode, getDateLabel, navigateDate } from '@/utils/dateUtils';
import { format } from 'date-fns';

interface ViewModeSelectorProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  referenceDate: Date;
  onDateChange: (date: Date) => void;
  customStartDate?: Date;
  customEndDate?: Date;
  onCustomStartChange: (date: Date) => void;
  onCustomEndChange: (date: Date) => void;
}

const viewModeOptions = [
  { value: 'daily' as ViewMode, label: 'Daily', icon: Clock },
  { value: 'weekly' as ViewMode, label: 'Weekly', icon: CalendarDays },
  { value: 'monthly' as ViewMode, label: 'Monthly', icon: CalendarRange },
  { value: 'calendar' as ViewMode, label: 'Calendar', icon: CalendarIcon },
  { value: 'custom' as ViewMode, label: 'Custom', icon: CalendarRange },
];

export const ViewModeSelector: React.FC<ViewModeSelectorProps> = ({
  viewMode,
  onViewModeChange,
  referenceDate,
  onDateChange,
  customStartDate,
  customEndDate,
  onCustomStartChange,
  onCustomEndChange,
}) => {
  const handlePrevious = () => {
    const newDate = navigateDate(viewMode, referenceDate, 'prev');
    onDateChange(newDate);
  };

  const handleNext = () => {
    const newDate = navigateDate(viewMode, referenceDate, 'next');
    onDateChange(newDate);
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  const dateLabel = getDateLabel(viewMode, referenceDate, customStartDate, customEndDate);
  const showNavigation = viewMode !== 'custom';

  return (
    <div className="space-y-4">
      {/* View Mode Tabs */}
      <div className="flex flex-wrap gap-2">
        {viewModeOptions.map((option) => {
          const Icon = option.icon;
          const isActive = viewMode === option.value;
          
          return (
            <Button
              key={option.value}
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              onClick={() => onViewModeChange(option.value)}
              className={cn(
                'transition-all',
                isActive && 'shadow-md'
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{option.label}</span>
            </Button>
          );
        })}
      </div>

      {/* Date Navigation Controls */}
      {showNavigation && (
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevious}
            aria-label="Previous period"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex-1 text-center">
            <span className="text-sm font-medium">{dateLabel}</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleToday}
            className="hidden sm:inline-flex"
          >
            Today
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={handleNext}
            aria-label="Next period"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Custom Date Range Picker */}
      {viewMode === 'custom' && (
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium">Start Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !customStartDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {customStartDate ? format(customStartDate, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={customStartDate}
                  onSelect={(date) => date && onCustomStartChange(date)}
                  disabled={(date) => 
                    customEndDate ? date > customEndDate : false
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium">End Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !customEndDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {customEndDate ? format(customEndDate, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={customEndDate}
                  onSelect={(date) => date && onCustomEndChange(date)}
                  disabled={(date) => 
                    customStartDate ? date < customStartDate : false
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {customStartDate && customEndDate && (
            <div className="w-full sm:w-auto text-sm text-muted-foreground">
              {dateLabel}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
