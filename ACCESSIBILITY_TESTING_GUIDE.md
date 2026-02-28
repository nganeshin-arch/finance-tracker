# Accessibility Testing Guide

## Quick Start

### Automated Testing

#### 1. In-Browser Testing (Recommended for Development)
```bash
# Start the development server
npm run dev

# Navigate to http://localhost:5173/accessibility-audit
# The page will automatically run accessibility tests and display results
```

#### 2. CLI Testing (Recommended for CI/CD)
```bash
# Terminal 1: Start the development server
npm run dev

# Terminal 2: Run automated tests
npm run test:a11y
```

The CLI test will:
- Test all major pages (Dashboard, Transactions, Admin)
- Generate an HTML report in `frontend/accessibility-reports/`
- Exit with error code if violations are found

### Manual Testing

Use the checklist in the Accessibility Audit page (`/accessibility-audit`) to track manual testing progress.

## Testing Workflow

### During Development

1. **Write accessible code from the start**
   - Use semantic HTML
   - Add ARIA labels where needed
   - Ensure keyboard navigation works
   - Test with keyboard only (no mouse)

2. **Test in browser**
   - Navigate to `/accessibility-audit`
   - Review any violations
   - Fix issues immediately

3. **Verify fixes**
   - Re-run the audit
   - Test with keyboard
   - Check focus indicators

### Before Committing

1. Run automated tests: `npm run test:a11y`
2. Fix any violations found
3. Test keyboard navigation manually
4. Verify focus indicators are visible

### Before Release

1. Run full automated test suite
2. Complete manual testing checklist
3. Test with screen readers (NVDA, JAWS, or VoiceOver)
4. Test at 200% zoom
5. Test with color blindness simulators
6. Review and sign off on accessibility audit

## Common Accessibility Issues and Fixes

### Missing Alt Text
**Issue**: Images without alt attributes
**Fix**: Add descriptive alt text or empty alt for decorative images
```tsx
// Informative image
<img src="chart.png" alt="Monthly expense trend showing increase in January" />

// Decorative image
<img src="decoration.png" alt="" />
```

### Missing Form Labels
**Issue**: Form inputs without associated labels
**Fix**: Use proper label elements or aria-label
```tsx
// Preferred: Visible label
<label htmlFor="email">Email</label>
<input id="email" type="email" />

// Alternative: ARIA label
<input type="email" aria-label="Email address" />
```

### Poor Color Contrast
**Issue**: Text doesn't meet WCAG AA contrast ratio (4.5:1)
**Fix**: Use darker colors or adjust background
```tsx
// Bad: Light gray on white
<p className="text-gray-300">Text</p>

// Good: Dark gray on white
<p className="text-gray-700">Text</p>
```

### Missing Focus Indicators
**Issue**: No visible focus indicator on interactive elements
**Fix**: Ensure focus-visible styles are applied
```tsx
// Tailwind automatically adds focus-visible styles
<button className="focus-visible:ring-2 focus-visible:ring-blue-500">
  Click me
</button>
```

### Keyboard Traps
**Issue**: User can't escape from a component using keyboard
**Fix**: Implement proper focus management
```tsx
// In modals, trap focus but allow Escape to close
<Dialog onEscapeKeyDown={handleClose}>
  {/* content */}
</Dialog>
```

### Missing ARIA Labels
**Issue**: Icon buttons without text labels
**Fix**: Add aria-label
```tsx
// Bad
<button><TrashIcon /></button>

// Good
<button aria-label="Delete transaction">
  <TrashIcon />
</button>
```

### Incorrect Heading Hierarchy
**Issue**: Skipping heading levels (h1 → h3)
**Fix**: Use proper heading order
```tsx
// Bad
<h1>Page Title</h1>
<h3>Section Title</h3>

// Good
<h1>Page Title</h1>
<h2>Section Title</h2>
```

## Keyboard Navigation Testing

### Essential Keyboard Shortcuts

- **Tab**: Move focus forward
- **Shift + Tab**: Move focus backward
- **Enter**: Activate links and buttons
- **Space**: Activate buttons, toggle checkboxes
- **Escape**: Close modals and dropdowns
- **Arrow Keys**: Navigate within menus, tabs, and radio groups

### Testing Checklist

Test each page with keyboard only (no mouse):

#### Dashboard
- [ ] Tab through all interactive elements
- [ ] Focus indicators are visible
- [ ] Can navigate to all links and buttons
- [ ] Charts are keyboard accessible (if interactive)

#### Transactions
- [ ] Can open transaction form with keyboard
- [ ] All form fields are keyboard accessible
- [ ] Date picker works with keyboard
- [ ] Can submit form with Enter
- [ ] Can search and filter with keyboard
- [ ] Can edit/delete transactions with keyboard
- [ ] Table navigation works properly

#### Admin Panel
- [ ] Can switch between tabs with keyboard
- [ ] Can add/edit/delete configuration items
- [ ] Confirmation dialogs are keyboard accessible
- [ ] Can close dialogs with Escape

## Screen Reader Testing

### NVDA (Windows - Free)

1. Download from https://www.nvaccess.org/
2. Install and start NVDA
3. Navigate the app using:
   - **NVDA + Down Arrow**: Read next item
   - **NVDA + Up Arrow**: Read previous item
   - **H**: Jump to next heading
   - **F**: Jump to next form field
   - **B**: Jump to next button
   - **K**: Jump to next link

### JAWS (Windows - Paid)

1. Similar to NVDA but with different shortcuts
2. Use **Insert** key instead of NVDA key
3. Test form navigation and announcements

### VoiceOver (macOS - Built-in)

1. Enable: System Preferences → Accessibility → VoiceOver
2. Start: **Cmd + F5**
3. Navigate using:
   - **VO + Right Arrow**: Next item
   - **VO + Left Arrow**: Previous item
   - **VO + U**: Open rotor
   - **VO + Space**: Activate item

### What to Test

- [ ] All text content is announced
- [ ] Form labels are announced with inputs
- [ ] Error messages are announced
- [ ] Button purposes are clear
- [ ] Link destinations are clear
- [ ] Table headers are announced
- [ ] Dynamic content updates are announced
- [ ] Modal dialogs are announced

## Visual Testing

### Zoom Testing

1. **200% Zoom**
   - Press **Ctrl/Cmd + Plus** to zoom to 200%
   - Verify all content is readable
   - Verify no horizontal scrolling
   - Verify all functionality works

2. **400% Zoom**
   - Zoom to 400%
   - Content should reflow
   - No loss of information

### Color Blindness Testing

Use browser extensions to simulate:
- **Protanopia** (red-blind)
- **Deuteranopia** (green-blind)
- **Tritanopia** (blue-blind)

Recommended extensions:
- **Colorblind - Dalton** (Chrome)
- **Let's get color blind** (Firefox)

Verify:
- [ ] Income/expense distinction is clear without color
- [ ] Charts use patterns or labels in addition to color
- [ ] Error states are indicated by more than just color

### High Contrast Mode

**Windows High Contrast**:
1. Settings → Ease of Access → High Contrast
2. Turn on high contrast
3. Verify all content is visible
4. Verify focus indicators are visible

**Dark Mode**:
1. Toggle dark mode in the app
2. Verify sufficient contrast
3. Verify all colors are readable

## Automated Testing Tools

### Browser Extensions

1. **axe DevTools** (Chrome/Firefox)
   - Install from browser store
   - Open DevTools → axe DevTools tab
   - Click "Scan ALL of my page"
   - Review and fix issues

2. **WAVE** (Chrome/Firefox/Edge)
   - Install from browser store
   - Click WAVE icon
   - Review visual feedback
   - Fix errors and alerts

3. **Lighthouse** (Chrome)
   - Open DevTools → Lighthouse tab
   - Select "Accessibility" category
   - Click "Generate report"
   - Review and fix issues

### Command Line Tools

1. **axe-core** (Integrated)
   ```bash
   npm run test:a11y
   ```

2. **Pa11y** (Optional)
   ```bash
   npm install -g pa11y
   pa11y http://localhost:5173
   ```

3. **Lighthouse CI** (Integrated)
   ```bash
   npm run lighthouse
   ```

## Continuous Integration

### GitHub Actions Example

```yaml
name: Accessibility Tests

on: [push, pull_request]

jobs:
  a11y:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm ci
      - run: npm run build
      - run: npm run preview &
      - run: sleep 5
      - run: npm run test:a11y
```

## Resources

### WCAG Guidelines
- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM WCAG Checklist](https://webaim.org/standards/wcag/checklist)

### Testing Tools
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE](https://wave.webaim.org/)
- [NVDA Screen Reader](https://www.nvaccess.org/)
- [Color Contrast Checker](https://webaim.org/resources/contrastchecker/)

### Learning Resources
- [WebAIM](https://webaim.org/)
- [A11y Project](https://www.a11yproject.com/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [Inclusive Components](https://inclusive-components.design/)

### shadcn/ui Accessibility
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Radix UI Accessibility](https://www.radix-ui.com/primitives/docs/overview/accessibility)

## Troubleshooting

### Tests Fail in CI but Pass Locally
- Ensure dev server is fully started before running tests
- Add appropriate wait times
- Check for environment-specific issues

### Screen Reader Not Announcing Changes
- Verify ARIA live regions are used
- Check that dynamic content has proper roles
- Ensure focus management is correct

### Keyboard Navigation Not Working
- Check for JavaScript errors
- Verify tabindex values are correct
- Ensure event handlers are attached
- Test in different browsers

### Color Contrast Failures
- Use a color contrast checker tool
- Adjust colors to meet WCAG AA (4.5:1)
- Consider using Tailwind's default color palette

## Support

For accessibility questions or issues:
1. Check this guide first
2. Review WCAG guidelines
3. Test with automated tools
4. Consult with accessibility experts if needed

Remember: Accessibility is not a one-time task, it's an ongoing commitment to inclusive design.
