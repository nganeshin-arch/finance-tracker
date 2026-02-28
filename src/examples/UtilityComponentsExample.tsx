import React, { useState } from 'react';
import {
  Loading,
  Skeleton,
  CardSkeleton,
  TableRowSkeleton,
  ChartSkeleton,
  ListSkeleton,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui';
import { useToastNotification } from '@/hooks/useToastNotification';

/**
 * Example component demonstrating the usage of utility components
 * This file can be used as a reference for implementing loading states and notifications
 */
export const UtilityComponentsExample: React.FC = () => {
  const [showLoading, setShowLoading] = useState(false);
  const [showSkeletons, setShowSkeletons] = useState(false);
  const { showSuccess, showError, showWarning, showInfo } = useToastNotification();

  return (
    <div className="container mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">Utility Components Examples</h1>

      {/* Toast Notifications Section */}
      <Card>
        <CardHeader>
          <CardTitle>Toast Notifications</CardTitle>
          <CardDescription>
            Click the buttons below to see different toast notification styles
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button
            onClick={() => showSuccess('Transaction saved successfully!')}
            variant="default"
          >
            Show Success Toast
          </Button>
          <Button
            onClick={() => showError('Failed to save transaction. Please try again.')}
            variant="destructive"
          >
            Show Error Toast
          </Button>
          <Button
            onClick={() => showWarning('This action cannot be undone.')}
            variant="outline"
          >
            Show Warning Toast
          </Button>
          <Button
            onClick={() => showInfo('New features are available!')}
            variant="secondary"
          >
            Show Info Toast
          </Button>
        </CardContent>
      </Card>

      {/* Loading Spinner Section */}
      <Card>
        <CardHeader>
          <CardTitle>Loading Spinners</CardTitle>
          <CardDescription>
            Different sizes and configurations of loading spinners
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Button onClick={() => setShowLoading(!showLoading)}>
              Toggle Loading States
            </Button>
          </div>

          {showLoading && (
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <p className="text-sm font-medium mb-2">Small Loading</p>
                <Loading size="sm" message="Loading..." />
              </div>

              <div className="border rounded-lg p-4">
                <p className="text-sm font-medium mb-2">Medium Loading (Default)</p>
                <Loading size="md" message="Processing your request..." />
              </div>

              <div className="border rounded-lg p-4">
                <p className="text-sm font-medium mb-2">Large Loading</p>
                <Loading size="lg" message="Initializing application..." />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Skeleton Loading Section */}
      <Card>
        <CardHeader>
          <CardTitle>Skeleton Loading States</CardTitle>
          <CardDescription>
            Skeleton components for different content types
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Button onClick={() => setShowSkeletons(!showSkeletons)}>
              Toggle Skeleton States
            </Button>
          </div>

          {showSkeletons && (
            <div className="space-y-6">
              <div>
                <p className="text-sm font-medium mb-2">Basic Skeleton</p>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Card Skeleton</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <CardSkeleton />
                  <CardSkeleton />
                  <CardSkeleton />
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Table Row Skeleton</p>
                <div className="border rounded-lg">
                  <TableRowSkeleton />
                  <TableRowSkeleton />
                  <TableRowSkeleton />
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Chart Skeleton</p>
                <ChartSkeleton />
              </div>

              <div>
                <p className="text-sm font-medium mb-2">List Skeleton</p>
                <ListSkeleton items={3} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Usage in Real Components</CardTitle>
          <CardDescription>
            How to use these components in your application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
            <code>{`// In your component
import { Loading, CardSkeleton } from '@/components/ui';
import { useToastNotification } from '@/hooks/useToastNotification';

function MyComponent() {
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError } = useToastNotification();

  // Show loading state
  if (loading) {
    return <Loading message="Loading data..." />;
  }

  // Or use skeletons for better UX
  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  // Show notifications
  const handleSave = async () => {
    try {
      await saveData();
      showSuccess('Data saved successfully!');
    } catch (error) {
      showError('Failed to save data');
    }
  };

  return <div>Your content here</div>;
}`}</code>
          </pre>
        </CardContent>
      </Card>
    </div>
  );
};
