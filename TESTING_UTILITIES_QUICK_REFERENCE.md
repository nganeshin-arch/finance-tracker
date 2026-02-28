# Testing Utilities Quick Reference

## Quick Start

### Access the Browser Test Page
Navigate to: `http://localhost:3000/browser-test`

### Run Automated Checks
```bash
npm run test:browsers
```

## Browser Console Commands

Open browser DevTools console and run these commands:

### Browser Information
```javascript
// Import utilities (in module context)
import { logBrowserInfo } from './utils/browserDetection';
logBrowserInfo();

// Output:
// Browser Information
//   Name: Chrome
//   Version: 120
//   Engine: Blink
//   Supported: true
// Browser Features
//   flexbox: ✓
//   grid: ✓
//   ...
```

### Responsive Design Info
```javascript
import { logResponsiveInfo } from './utils/responsiveTest';
logResponsiveInfo();

// Output:
// Responsive Design Information
//   Viewport: 1920x1080
//   Breakpoint: 2xl
//   Touch Device: false
//   Pixel Ratio: 1
//   Orientation: landscape
```

### CSS Compatibility
```javascript
import { logCSSCompatibility } from './utils/cssCompatibility';
logCSSCompatibility();

// Output:
// CSS Feature Support
//   ✓ Flexbox: true
//   ✓ Grid: true
//   ✓ Backdrop Filter: true
//   ...
```

### Validate Touch Targets
```javascript
import { validateTouchTargets } from './utils/responsiveTest';
validateTouchTargets();

// Output:
// ✓ All touch targets meet minimum size requirements
// OR
// Found 3 touch target violations (< 44px):
//   - BUTTON: 32.0x32.0px <button>
```

### Log All Information
```javascript
// From the Browser Test Page, click "Log All Info" button
// Or run all three commands above
```

## Testing Checklist

### Quick Browser Test (5 minutes per browser)

1. **Load Application**
   - [ ] No console errors
   - [ ] Page loads completely
   - [ ] No layout issues

2. **Test Navigation**
   - [ ] All links work
   - [ ] Page transitions smooth
   - [ ] Back/forward buttons work

3. **Test Core Features**
   - [ ] Dashboard displays data
   - [ ] Forms submit correctly
   - [ ] Charts render properly

4. **Test Responsive**
   - [ ] Resize window (mobile → desktop)
   - [ ] No horizontal scrolling
   - [ ] All content accessible

### Full Browser Test (30 minutes per browser)

Follow the complete checklist in `CROSS_BROWSER_TESTING.md`

## Common Issues & Solutions

### Issue: Backdrop blur not working
**Browser:** Safari < 9, Firefox < 103
**Solution:** Check browser version, consider fallback styles

### Issue: Date picker looks different
**Browser:** Safari
**Solution:** Expected behavior - Safari uses native date picker

### Issue: Animations stuttering
**Browser:** Any
**Solution:** Check performance tab, reduce animation complexity

### Issue: Touch targets too small
**Browser:** Mobile browsers
**Solution:** Run `validateTouchTargets()` to identify violations

## Browser DevTools Shortcuts

### Chrome DevTools
- Open: `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Opt+I` (Mac)
- Device Mode: `Ctrl+Shift+M` (Windows) / `Cmd+Shift+M` (Mac)
- Console: `Ctrl+Shift+J` (Windows) / `Cmd+Opt+J` (Mac)

### Firefox DevTools
- Open: `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Opt+I` (Mac)
- Responsive Mode: `Ctrl+Shift+M` (Windows) / `Cmd+Opt+M` (Mac)

### Safari Web Inspector
- Open: `Cmd+Opt+I` (Mac)
- Enable: Safari → Preferences → Advanced → Show Develop menu

### Edge DevTools
- Open: `F12` or `Ctrl+Shift+I`
- Device Mode: `Ctrl+Shift+M`

## Responsive Testing Breakpoints

| Breakpoint | Width | Device Type |
|------------|-------|-------------|
| mobile | < 640px | Phones |
| sm | 640px - 767px | Large phones |
| md | 768px - 1023px | Tablets |
| lg | 1024px - 1279px | Small laptops |
| xl | 1280px - 1535px | Laptops |
| 2xl | ≥ 1536px | Desktops |

## Performance Targets

| Metric | Target | Critical |
|--------|--------|----------|
| First Contentful Paint | < 1.8s | < 3s |
| Largest Contentful Paint | < 2.5s | < 4s |
| Time to Interactive | < 3.8s | < 7.3s |
| Total Blocking Time | < 200ms | < 600ms |
| Cumulative Layout Shift | < 0.1 | < 0.25 |
| Lighthouse Score | ≥ 90 | ≥ 70 |

## Accessibility Quick Checks

### Keyboard Navigation
1. Press `Tab` - Should move through interactive elements
2. Press `Shift+Tab` - Should move backwards
3. Press `Enter` - Should activate buttons/links
4. Press `Esc` - Should close modals/dialogs

### Screen Reader Testing
- **Windows:** NVDA (free) or JAWS
- **Mac:** VoiceOver (built-in, `Cmd+F5`)
- **Linux:** Orca

### Color Contrast
Use browser DevTools or online tools:
- Chrome DevTools: Inspect element → Accessibility pane
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

## Files Reference

| File | Purpose |
|------|---------|
| `src/utils/browserDetection.ts` | Browser detection utilities |
| `src/utils/responsiveTest.ts` | Responsive testing utilities |
| `src/utils/cssCompatibility.ts` | CSS feature testing |
| `src/components/BrowserCompatibilityChecker.tsx` | Browser warning component |
| `src/pages/BrowserTestPage.tsx` | Interactive test page |
| `CROSS_BROWSER_TESTING.md` | Complete testing guide |
| `BROWSER_TEST_RESULTS.md` | Test results template |
| `CROSS_BROWSER_IMPLEMENTATION.md` | Implementation details |
| `.browserslistrc` | Supported browsers config |

## Support

For issues or questions:
1. Check `CROSS_BROWSER_TESTING.md` for detailed guidance
2. Review `CROSS_BROWSER_IMPLEMENTATION.md` for technical details
3. Use the `/browser-test` page for interactive testing
4. Check browser console for errors and warnings
