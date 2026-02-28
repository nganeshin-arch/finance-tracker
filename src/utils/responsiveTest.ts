/**
 * Responsive Design Testing Utilities
 * Provides utilities for testing responsive design across different screen sizes
 */

export interface Breakpoint {
  name: string;
  width: number;
  height: number;
}

/**
 * Standard breakpoints for testing
 * Based on common device sizes and Tailwind CSS breakpoints
 */
export const BREAKPOINTS: Breakpoint[] = [
  { name: 'Mobile Small', width: 320, height: 568 },
  { name: 'Mobile Medium', width: 375, height: 667 },
  { name: 'Mobile Large', width: 414, height: 896 },
  { name: 'Tablet Portrait', width: 768, height: 1024 },
  { name: 'Tablet Landscape', width: 1024, height: 768 },
  { name: 'Desktop Small', width: 1280, height: 720 },
  { name: 'Desktop Medium', width: 1440, height: 900 },
  { name: 'Desktop Large', width: 1920, height: 1080 },
  { name: 'Desktop XL', width: 2560, height: 1440 },
];

/**
 * Gets the current viewport size
 */
export function getViewportSize() {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

/**
 * Determines the current breakpoint based on viewport width
 */
export function getCurrentBreakpoint(): string {
  const width = window.innerWidth;
  
  if (width < 640) return 'mobile';
  if (width < 768) return 'sm';
  if (width < 1024) return 'md';
  if (width < 1280) return 'lg';
  if (width < 1536) return 'xl';
  return '2xl';
}

/**
 * Checks if the viewport matches a specific breakpoint
 */
export function matchesBreakpoint(breakpoint: string): boolean {
  const width = window.innerWidth;
  
  switch (breakpoint) {
    case 'mobile':
      return width < 640;
    case 'sm':
      return width >= 640 && width < 768;
    case 'md':
      return width >= 768 && width < 1024;
    case 'lg':
      return width >= 1024 && width < 1280;
    case 'xl':
      return width >= 1280 && width < 1536;
    case '2xl':
      return width >= 1536;
    default:
      return false;
  }
}

/**
 * Tests if touch events are supported (mobile/tablet detection)
 */
export function isTouchDevice(): boolean {
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    (navigator as any).msMaxTouchPoints > 0
  );
}

/**
 * Gets device pixel ratio for high-DPI displays
 */
export function getDevicePixelRatio(): number {
  return window.devicePixelRatio || 1;
}

/**
 * Checks if the device is in portrait or landscape orientation
 */
export function getOrientation(): 'portrait' | 'landscape' {
  return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
}

/**
 * Logs responsive design information to console
 */
export function logResponsiveInfo(): void {
  const viewport = getViewportSize();
  const breakpoint = getCurrentBreakpoint();
  const isTouch = isTouchDevice();
  const pixelRatio = getDevicePixelRatio();
  const orientation = getOrientation();
  
  console.group('Responsive Design Information');
  console.log('Viewport:', `${viewport.width}x${viewport.height}`);
  console.log('Breakpoint:', breakpoint);
  console.log('Touch Device:', isTouch);
  console.log('Pixel Ratio:', pixelRatio);
  console.log('Orientation:', orientation);
  console.groupEnd();
}

/**
 * Validates that touch targets meet minimum size requirements (44x44px)
 */
export function validateTouchTargets(): void {
  if (!isTouchDevice()) {
    console.log('Not a touch device, skipping touch target validation');
    return;
  }

  const MIN_SIZE = 44;
  const interactiveElements = document.querySelectorAll(
    'button, a, input, select, textarea, [role="button"], [role="link"]'
  );

  const violations: Array<{ element: Element; width: number; height: number }> = [];

  interactiveElements.forEach((element) => {
    const rect = element.getBoundingClientRect();
    if (rect.width < MIN_SIZE || rect.height < MIN_SIZE) {
      violations.push({
        element,
        width: rect.width,
        height: rect.height,
      });
    }
  });

  if (violations.length > 0) {
    console.warn(`Found ${violations.length} touch target violations (< ${MIN_SIZE}px):`);
    violations.forEach(({ element, width, height }) => {
      console.warn(`- ${element.tagName}:`, `${width.toFixed(1)}x${height.toFixed(1)}px`, element);
    });
  } else {
    console.log('✓ All touch targets meet minimum size requirements');
  }
}
