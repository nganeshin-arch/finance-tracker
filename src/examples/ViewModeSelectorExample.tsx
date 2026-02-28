import React, { useState } from 'react';
import { ViewModeSelector } from '@/components/ViewModeSelector';
import { ViewMode } from '@/utils/dateUtils';

/**
 * Example usage of ViewModeSelector component
 * 
 * This component demonstrates how to integrate the ViewModeSelector
 * into your page with proper state management.
 */
export const ViewModeSelectorExample: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('daily');
  const [referenceDate, setReferenceDate] = useState<Date>(new Date());
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>();
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">ViewModeSelector Example</h1>
        <p className="text-muted-foreground">
          Select different view modes and navigate through dates
        </p>
      </div>

      <div className="bg-card border rounded-lg p-6">
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
      </div>

      <div className="bg-muted rounded-lg p-4 space-y-2">
        <h2 className="font-semibold">Current State:</h2>
        <pre className="text-sm">
          {JSON.stringify(
            {
              viewMode,
              referenceDate: referenceDate.toISOString(),
              customStartDate: customStartDate?.toISOString(),
              customEndDate: customEndDate?.toISOString(),
            },
            null,
            2
          )}
        </pre>
      </div>
    </div>
  );
};
