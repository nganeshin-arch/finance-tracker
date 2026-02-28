/**
 * Browser Detection Utilities
 * Provides utilities for detecting browser type and version for cross-browser testing
 */

export interface BrowserInfo {
  name: string;
  version: string;
  engine: string;
  isSupported: boolean;
}

/**
 * Detects the current browser and returns detailed information
 */
export function detectBrowser(): BrowserInfo {
  const userAgent = navigator.userAgent;
  const vendor = navigator.vendor;

  // Chrome
  if (/Chrome/.test(userAgent) && /Google Inc/.test(vendor)) {
    const match = userAgent.match(/Chrome\/(\d+)/);
    return {
      name: 'Chrome',
      version: match ? match[1] : 'unknown',
      engine: 'Blink',
      isSupported: true,
    };
  }

  // Firefox
  if (/Firefox/.test(userAgent)) {
    const match = userAgent.match(/Firefox\/(\d+)/);
    return {
      name: 'Firefox',
      version: match ? match[1] : 'unknown',
      engine: 'Gecko',
      isSupported: true,
    };
  }

  // Safari
  if (/Safari/.test(userAgent) && /Apple Computer/.test(vendor)) {
    const match = userAgent.match(/Version\/(\d+)/);
    return {
      name: 'Safari',
      version: match ? match[1] : 'unknown',
      engine: 'WebKit',
      isSupported: true,
    };
  }

  // Edge (Chromium-based)
  if (/Edg/.test(userAgent)) {
    const match = userAgent.match(/Edg\/(\d+)/);
    return {
      name: 'Edge',
      version: match ? match[1] : 'unknown',
      engine: 'Blink',
      isSupported: true,
    };
  }

  // Fallback for unsupported browsers
  return {
    name: 'Unknown',
    version: 'unknown',
    engine: 'unknown',
    isSupported: false,
  };
}

/**
 * Checks if the current browser is supported
 */
export function isBrowserSupported(): boolean {
  const browser = detectBrowser();
  return browser.isSupported;
}

/**
 * Gets a user-friendly browser name
 */
export function getBrowserName(): string {
  return detectBrowser().name;
}

/**
 * Checks for specific browser features
 */
export function checkBrowserFeatures() {
  return {
    flexbox: CSS.supports('display', 'flex'),
    grid: CSS.supports('display', 'grid'),
    customProperties: CSS.supports('--custom', 'value'),
    backdropFilter: CSS.supports('backdrop-filter', 'blur(10px)'),
    webp: document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') === 0,
    intersectionObserver: 'IntersectionObserver' in window,
    resizeObserver: 'ResizeObserver' in window,
    localStorage: (() => {
      try {
        const test = '__test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
      } catch {
        return false;
      }
    })(),
  };
}

/**
 * Logs browser information to console (useful for debugging)
 */
export function logBrowserInfo(): void {
  const browser = detectBrowser();
  const features = checkBrowserFeatures();
  
  console.group('Browser Information');
  console.log('Name:', browser.name);
  console.log('Version:', browser.version);
  console.log('Engine:', browser.engine);
  console.log('Supported:', browser.isSupported);
  console.groupEnd();
  
  console.group('Browser Features');
  Object.entries(features).forEach(([feature, supported]) => {
    console.log(`${feature}:`, supported ? '✓' : '✗');
  });
  console.groupEnd();
}
