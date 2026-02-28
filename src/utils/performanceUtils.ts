/**
 * Performance optimization utilities
 */

/**
 * Lazy load images with Intersection Observer
 * @param imageElement - The image element to lazy load
 */
export const lazyLoadImage = (imageElement: HTMLImageElement): void => {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            observer.unobserve(img);
          }
        }
      });
    });

    imageObserver.observe(imageElement);
  } else {
    // Fallback for browsers that don't support IntersectionObserver
    if (imageElement.dataset.src) {
      imageElement.src = imageElement.dataset.src;
    }
  }
};

/**
 * Debounce function to limit the rate at which a function can fire
 * @param func - The function to debounce
 * @param wait - The number of milliseconds to delay
 * @returns Debounced function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
};

/**
 * Throttle function to ensure a function is called at most once in a specified time period
 * @param func - The function to throttle
 * @param limit - The time limit in milliseconds
 * @returns Throttled function
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};

/**
 * Preload critical resources
 * @param urls - Array of resource URLs to preload
 * @param type - Resource type (script, style, image, font)
 */
export const preloadResources = (
  urls: string[],
  type: 'script' | 'style' | 'image' | 'font' = 'script'
): void => {
  urls.forEach((url) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    link.as = type;
    if (type === 'font') {
      link.crossOrigin = 'anonymous';
    }
    document.head.appendChild(link);
  });
};

/**
 * Check if the user prefers reduced motion
 * @returns boolean indicating if reduced motion is preferred
 */
export const prefersReducedMotion = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Measure and log performance metrics
 */
export const measurePerformance = (): void => {
  if ('performance' in window && 'getEntriesByType' in performance) {
    // Get navigation timing
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (navigation) {
      console.log('Performance Metrics:');
      console.log(`DNS Lookup: ${navigation.domainLookupEnd - navigation.domainLookupStart}ms`);
      console.log(`TCP Connection: ${navigation.connectEnd - navigation.connectStart}ms`);
      console.log(`Request Time: ${navigation.responseStart - navigation.requestStart}ms`);
      console.log(`Response Time: ${navigation.responseEnd - navigation.responseStart}ms`);
      console.log(`DOM Processing: ${navigation.domComplete - navigation.domInteractive}ms`);
      console.log(`Load Complete: ${navigation.loadEventEnd - navigation.loadEventStart}ms`);
      console.log(`Total Load Time: ${navigation.loadEventEnd - navigation.fetchStart}ms`);
    }

    // Get resource timing
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const totalResourceSize = resources.reduce((acc, resource) => {
      return acc + (resource.transferSize || 0);
    }, 0);
    
    console.log(`Total Resources: ${resources.length}`);
    console.log(`Total Transfer Size: ${(totalResourceSize / 1024).toFixed(2)} KB`);
  }
};
