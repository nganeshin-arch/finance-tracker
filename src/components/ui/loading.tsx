import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface LoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

export const Loading: React.FC<LoadingProps> = ({ 
  message = 'Loading...', 
  size = 'md',
  fullScreen = false,
  className
}) => {
  const containerClasses = fullScreen
    ? 'flex flex-col items-center justify-center min-h-screen gap-3 animate-fade-in'
    : 'flex flex-col items-center justify-center p-6 gap-3 animate-fade-in';

  return (
    <div
      className={cn(containerClasses, className)}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <Loader2 
        className={cn('animate-spin text-primary', sizeClasses[size])} 
        aria-hidden="true"
      />
      {message && (
        <p className="text-sm text-muted-foreground animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
};

// Skeleton loading components for different content types
interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-muted transition-all duration-300',
        className
      )}
      role="status"
      aria-label="Loading content"
      {...props}
    />
  );
};

// Card skeleton for dashboard cards
export const CardSkeleton: React.FC = () => {
  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm animate-fade-in">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <Skeleton className="mt-4 h-8 w-32" />
      <Skeleton className="mt-2 h-3 w-20" />
    </div>
  );
};

// Table row skeleton
export const TableRowSkeleton: React.FC = () => {
  return (
    <div className="flex items-center gap-4 border-b p-4">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-16" />
    </div>
  );
};

// Chart skeleton
export const ChartSkeleton: React.FC = () => {
  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <Skeleton className="mb-4 h-6 w-40" />
      <div className="flex items-end justify-between gap-2" style={{ height: '200px' }}>
        {[...Array(7)].map((_, i) => (
          <Skeleton 
            key={i} 
            className="w-full" 
            style={{ height: `${Math.random() * 60 + 40}%` }}
          />
        ))}
      </div>
    </div>
  );
};

// List skeleton
export const ListSkeleton: React.FC<{ items?: number }> = ({ items = 5 }) => {
  return (
    <div className="space-y-3">
      {[...Array(items)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-lg border p-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
};
