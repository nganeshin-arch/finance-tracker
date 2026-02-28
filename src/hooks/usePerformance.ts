import { useEffect } from 'react';

/**
 * Hook to monitor and report performance metrics
 * Only runs in development mode
 */
export const usePerformance = (componentName: string) => {
  useEffect(() => {
    if (import.meta.env.DEV) {
      const startTime = performance.now();

      return () => {
        const endTime = performance.now();
        const renderTime = endTime - startTime;
        
        if (renderTime > 16) { // More than one frame (60fps)
          console.warn(
            `[Performance] ${componentName} took ${renderTime.toFixed(2)}ms to render`
          );
        }
      };
    }
  }, [componentName]);
};

/**
 * Hook to measure component mount time
 */
export const useMountTime = (componentName: string) => {
  useEffect(() => {
    if (import.meta.env.DEV) {
      const mountTime = performance.now();
      console.log(`[Mount] ${componentName} mounted at ${mountTime.toFixed(2)}ms`);
    }
  }, [componentName]);
};
