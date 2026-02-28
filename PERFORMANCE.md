# Performance Optimization Guide

This document outlines the performance optimizations implemented in the Personal Finance Tracker frontend application.

## Implemented Optimizations

### 1. Code Splitting and Lazy Loading

**Route-based Code Splitting:**
- All page components (Dashboard, Transactions, Admin) are lazy-loaded using React's `lazy()` and `Suspense`
- This reduces the initial bundle size and improves Time to Interactive (TTI)

**Implementation:**
```typescript
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const TransactionsPage = lazy(() => import('./pages/TransactionsPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
```

### 2. Bundle Optimization

**Vite Build Configuration:**
- Manual chunk splitting for better caching
- Vendor chunks separated by category (React, UI components, Charts, Forms, Utils)
- Terser minification with console.log removal in production
- Tree-shaking enabled for unused code elimination

**Chunk Strategy:**
- `react-vendor`: React core libraries
- `ui-vendor`: Radix UI components
- `chart-vendor`: Recharts library
- `form-vendor`: Form handling libraries
- `utils`: Utility libraries

### 3. CSS Optimization

**Tailwind CSS Configuration:**
- Content paths optimized for accurate purging
- Safelist for dynamic classes that must be preserved
- Custom design tokens reduce CSS duplication
- Dark mode configured for efficient class toggling

### 4. Performance Utilities

**Created utilities for:**
- Image lazy loading with Intersection Observer
- Debounce and throttle functions for event handlers
- Resource preloading
- Performance measurement and monitoring

**Location:** `src/utils/performanceUtils.ts`

### 5. Performance Monitoring

**Development Tools:**
- `usePerformance` hook for component render time monitoring
- `useMountTime` hook for component mount tracking
- Performance metrics logging in development mode

**Location:** `src/hooks/usePerformance.ts`

## Performance Targets

Based on Requirements 1.5 and 5.x, we aim for:

- **Bundle Size Reduction:** 25%+ compared to Material-UI version
- **Initial Load Time:** 20%+ faster than previous version
- **Lighthouse Performance Score:** 90+
- **First Contentful Paint (FCP):** < 2.0s
- **Largest Contentful Paint (LCP):** < 2.5s
- **Cumulative Layout Shift (CLS):** < 0.1
- **Total Blocking Time (TBT):** < 300ms

## Running Performance Audits

### Build and Analyze Bundle

```bash
# Build the application
npm run build

# Analyze bundle with visualizer (if installed)
npm run analyze
```

### Run Lighthouse Audit

```bash
# Build and preview the application
npm run build
npm run preview

# In another terminal, run Lighthouse
npm run lighthouse
```

Or use Chrome DevTools:
1. Open Chrome DevTools (F12)
2. Go to "Lighthouse" tab
3. Select "Performance" category
4. Click "Generate report"

### Manual Performance Testing

1. **Network Throttling:**
   - Open Chrome DevTools > Network tab
   - Set throttling to "Fast 3G" or "Slow 3G"
   - Reload the page and measure load times

2. **CPU Throttling:**
   - Open Chrome DevTools > Performance tab
   - Set CPU throttling to "4x slowdown"
   - Record and analyze performance

3. **Bundle Size Analysis:**
   - Check `dist/` folder after build
   - Compare chunk sizes
   - Identify large dependencies

## Best Practices for Maintaining Performance

### 1. Component Optimization

- Use `React.memo()` for expensive components
- Implement proper dependency arrays in `useEffect` and `useCallback`
- Avoid inline function definitions in render
- Use `useMemo()` for expensive calculations

### 2. Image Optimization

- Use WebP format when possible
- Implement lazy loading for images below the fold
- Provide appropriate image sizes for different viewports
- Use the `loading="lazy"` attribute

### 3. Code Splitting

- Lazy load non-critical components
- Split large components into smaller chunks
- Use dynamic imports for heavy libraries

### 4. CSS Optimization

- Avoid unused Tailwind classes
- Use Tailwind's purge feature effectively
- Minimize custom CSS
- Use CSS containment when appropriate

### 5. JavaScript Optimization

- Minimize third-party dependencies
- Use tree-shaking compatible libraries
- Avoid large polyfills when possible
- Implement code splitting for routes

## Monitoring Performance in Production

### Key Metrics to Track

1. **Core Web Vitals:**
   - Largest Contentful Paint (LCP)
   - First Input Delay (FID)
   - Cumulative Layout Shift (CLS)

2. **Custom Metrics:**
   - Time to Interactive (TTI)
   - First Contentful Paint (FCP)
   - Total Blocking Time (TBT)

3. **Resource Metrics:**
   - Bundle size
   - Number of requests
   - Cache hit rate

### Tools for Production Monitoring

- Google Analytics with Web Vitals
- Sentry Performance Monitoring
- New Relic Browser
- Chrome User Experience Report (CrUX)

## Troubleshooting Performance Issues

### Large Bundle Size

1. Run bundle analyzer: `npm run analyze`
2. Identify large dependencies
3. Consider alternatives or lazy loading
4. Check for duplicate dependencies

### Slow Initial Load

1. Check network waterfall in DevTools
2. Verify code splitting is working
3. Ensure critical CSS is inlined
4. Check for render-blocking resources

### Poor Runtime Performance

1. Use React DevTools Profiler
2. Check for unnecessary re-renders
3. Verify proper memoization
4. Look for memory leaks

## Future Optimization Opportunities

1. **Service Worker:** Implement for offline support and caching
2. **HTTP/2 Server Push:** Push critical resources
3. **Preconnect/Prefetch:** Optimize third-party connections
4. **Image CDN:** Use CDN for image optimization
5. **Component Library:** Consider lighter alternatives if needed

## Resources

- [Web.dev Performance](https://web.dev/performance/)
- [Vite Performance Guide](https://vitejs.dev/guide/performance.html)
- [React Performance Optimization](https://react.dev/learn/render-and-commit)
- [Tailwind CSS Optimization](https://tailwindcss.com/docs/optimizing-for-production)
