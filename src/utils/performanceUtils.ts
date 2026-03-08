/**
 * Performance optimization utilities for GPU-accelerated animations
 * and efficient event handling
 * 
 * Validates: Requirements 12.1, 12.2, 12.5
 */

/**
 * Debounce function to limit the rate of function execution
 * Used for scroll and resize event handlers to improve performance
 * 
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 * @param immediate - Execute immediately on first call
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    
    const callNow = immediate && !timeout;
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func(...args);
  };
}

/**
 * Throttle function to limit function execution to once per interval
 * Used for scroll and resize event handlers that need regular updates
 * 
 * @param func - Function to throttle
 * @param limit - Time limit in milliseconds
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Request animation frame wrapper for smooth animations
 * Ensures animations run at optimal frame rate
 */
export function requestAnimationFrameWrapper(callback: () => void): number {
  return requestAnimationFrame(callback);
}

/**
 * Cancel animation frame wrapper
 */
export function cancelAnimationFrameWrapper(id: number): void {
  cancelAnimationFrame(id);
}

/**
 * GPU-accelerated animation helper
 * Applies will-change property before animation and removes it after
 * 
 * @param element - DOM element to animate
 * @param properties - CSS properties that will change
 * @param duration - Animation duration in milliseconds
 */
export function optimizeForAnimation(
  element: HTMLElement,
  properties: string[] = ['transform', 'opacity'],
  duration: number = 300
): void {
  // Apply will-change hint
  element.style.willChange = properties.join(', ');
  
  // Remove will-change after animation completes
  setTimeout(() => {
    element.style.willChange = 'auto';
  }, duration + 50); // Add small buffer
}

/**
 * Apply will-change hints to elements before animations
 * and clean them up after to optimize memory usage
 */
export function applyWillChangeHints(elements: HTMLElement[], properties: string[] = ['transform', 'opacity']): void {
  elements.forEach(element => {
    element.style.willChange = properties.join(', ');
  });
}

/**
 * Remove will-change hints from elements after animations complete
 * to free up GPU memory
 */
export function removeWillChangeHints(elements: HTMLElement[]): void {
  elements.forEach(element => {
    element.style.willChange = 'auto';
  });
}

/**
 * Intersection Observer for scroll-triggered animations
 * More performant than scroll event listeners
 */
export function createScrollObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
): IntersectionObserver {
  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '0px 0px -10% 0px', // Trigger slightly before element enters viewport
    threshold: 0.1,
    ...options
  };
  
  return new IntersectionObserver(callback, defaultOptions);
}

/**
 * Optimized scroll handler for smooth scroll animations
 * Uses requestAnimationFrame for better performance
 */
export function createOptimizedScrollHandler(
  callback: (scrollY: number) => void
): () => void {
  let ticking = false;
  
  const updateCallback = () => {
    callback(window.scrollY);
    ticking = false;
  };
  
  return () => {
    if (!ticking) {
      requestAnimationFrame(updateCallback);
      ticking = true;
    }
  };
}

/**
 * Optimized resize handler for responsive animations
 * Uses requestAnimationFrame and debouncing
 */
export function createOptimizedResizeHandler(
  callback: (width: number, height: number) => void,
  debounceMs: number = 100
): () => void {
  let ticking = false;
  
  const updateCallback = () => {
    callback(window.innerWidth, window.innerHeight);
    ticking = false;
  };
  
  const debouncedUpdate = debounce(updateCallback, debounceMs);
  
  return () => {
    if (!ticking) {
      requestAnimationFrame(debouncedUpdate);
      ticking = true;
    }
  };
}

/**
 * Check if user prefers reduced motion
 * Used to disable or reduce animations for accessibility
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Apply GPU-accelerated transform with fallback
 * Ensures consistent cross-browser performance
 */
export function applyGPUTransform(
  element: HTMLElement,
  transform: string
): void {
  element.style.transform = transform;
  element.style.webkitTransform = transform; // Safari fallback
  
  // Force GPU acceleration
  if (!element.style.willChange) {
    element.style.willChange = 'transform';
  }
}

/**
 * Measure CSS bundle size (for development/monitoring)
 * Helps ensure bundle stays under 100KB compressed
 */
export function measureCSSBundleSize(): Promise<number> {
  return new Promise((resolve) => {
    const stylesheets = Array.from(document.styleSheets);
    let totalSize = 0;
    
    stylesheets.forEach((stylesheet) => {
      try {
        if (stylesheet.href) {
          // For external stylesheets, estimate size
          fetch(stylesheet.href)
            .then(response => response.text())
            .then(text => {
              totalSize += new Blob([text]).size;
              resolve(totalSize);
            })
            .catch(() => resolve(totalSize));
        } else if (stylesheet.cssRules) {
          // For inline styles, calculate size
          const cssText = Array.from(stylesheet.cssRules)
            .map(rule => rule.cssText)
            .join('');
          totalSize += new Blob([cssText]).size;
        }
      } catch (e) {
        // Cross-origin stylesheets may throw errors
        console.warn('Could not measure stylesheet size:', e);
      }
    });
    
    resolve(totalSize);
  });
}

/**
 * Font loading optimization
 * Preloads critical fonts and applies font-display: swap
 */
export function optimizeFontLoading(fonts: string[]): void {
  fonts.forEach(fontUrl => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = fontUrl;
    link.as = 'font';
    link.type = 'font/woff2';
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
}

/**
 * Performance monitoring for animations
 * Tracks frame rate and animation performance
 */
export class AnimationPerformanceMonitor {
  private frameCount = 0;
  private lastTime = performance.now();
  private fps = 0;
  
  start(): void {
    this.measure();
  }
  
  private measure(): void {
    const currentTime = performance.now();
    this.frameCount++;
    
    if (currentTime - this.lastTime >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
      this.frameCount = 0;
      this.lastTime = currentTime;
      
      // Log performance warnings
      if (this.fps < 30) {
        console.warn(`Low animation FPS detected: ${this.fps}fps`);
      }
    }
    
    requestAnimationFrame(() => this.measure());
  }
  
  getFPS(): number {
    return this.fps;
  }
}