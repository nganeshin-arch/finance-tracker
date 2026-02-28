# Design Document - GitHub Design Alignment

## Overview

This design document outlines the architectural approach for aligning the My Money Journal application with the reference design from the GitHub repository. The solution adopts a single-page layout pattern with integrated view modes, calendar visualization, and simplified navigation while maintaining full compatibility with the existing backend infrastructure.

## Architecture

### High-Level Structure

```
App.tsx
├── AppProvider (existing context)
├── Router
    ├── / → UnifiedHomePage (new)
    └── /admin → AdminPage (existing)
```

### Component Hierarchy

```
UnifiedHomePage
├── Header (sticky)
│   ├── Logo
│   └── Admin Link
├── ViewModeSelector
│   ├── Mode Tabs (Daily/Weekly/Monthly/Calendar/Custom)
│   ├── Date Navigation (for non-custom modes)
│   └── Date Range Picker (for custom mode)
├── SummaryCards
│   ├── Income Card
│   ├── Expense Card
│   ├── Transfer Card (new)
│   └── Balance Card
├── TransactionForm (embedded)
│   ├── Type Selector (pills)
│   ├── Form Fields
│   └── Submit Button
└── TransactionView (conditional)
    ├── CalendarView (when mode = calendar)
    │   ├── Month Grid
    │   └── Day Details
    └── TransactionTable (default)
        ├── Search Bar
        ├── Type Filters
        └── Transaction Rows
```

## Components and Interfaces

### 1. UnifiedHomePage Component

**Purpose:** Main container component that orchestrates all features on a single page

**State Management:**
```typescript
interface HomePageState {
  viewMode: ViewMode;
  referenceDate: Date;
  customStartDate: Date;
  customEndDate: Date;
  transactions: Transaction[];
  filteredTransactions: Transaction[];
}

type ViewMode = 'daily' | 'weekly' | 'monthly' | 'calendar' | 'custom';
```

**Key Responsibilities:**
- Manage view mode and date range state
- Filter transactions based on selected view mode
- Coordinate data flow between child components
- Handle transaction CRUD operations

**Integration Points:**
- Uses `useTransactions` hook for transaction data
- Uses `useConfig` hook for categories and configuration
- Uses `useDashboard` hook for summary calculations

### 2. ViewModeSelector Component

**Purpose:** Provides UI for selecting time-based view modes and navigating dates

**Props:**
```typescript
interface ViewModeSelectorProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  referenceDate: Date;
  onDateChange: (date: Date) => void;
  customStartDate?: Date;
  customEndDate?: Date;
  onCustomStartChange: (date: Date) => void;
  onCustomEndChange: (date: Date) => void;
}
```

**Features:**
- Tab-based mode selection with icons
- Previous/Next navigation buttons
- "Today" quick action button
- Date range pickers for custom mode
- Responsive layout (icons only on mobile)

**Date Calculation Logic:**
- Daily: Start/end of selected day
- Weekly: Start of week (Monday) to end of week (Sunday)
- Monthly: Start/end of selected month
- Custom: User-selected date range
- Calendar: Full month view

### 3. CalendarView Component

**Purpose:** Display transactions in a month-grid calendar format

**Props:**
```typescript
interface CalendarViewProps {
  transactions: Transaction[];
  referenceDate: Date;
  onDelete: (id: number) => void;
}
```

**Structure:**
- 7-column grid (Sun-Sat)
- Each cell shows date, income total, expense total
- Click to expand day details
- Color-coded amounts (green/red)
- Empty state for days without transactions

**Day Cell Data:**
```typescript
interface DayData {
  date: Date;
  income: number;
  expense: number;
  transfers: number;
  transactions: Transaction[];
}
```

### 4. Enhanced TransactionTable Component

**Purpose:** Display transactions in a searchable, filterable table format

**Props:**
```typescript
interface TransactionTableProps {
  transactions: Transaction[];
  onDelete: (id: number) => void;
}
```

**Local State:**
```typescript
interface TableState {
  searchTerm: string;
  filterType: 'All' | 'Income' | 'Expense' | 'Transfer';
}
```

**Features:**
- Real-time search across description, category, subcategory
- Type filter buttons (All/Income/Expense/Transfer)
- Hover-reveal delete button
- Color-coded type badges
- Formatted currency display
- Empty state message

### 5. Integrated TransactionForm Component

**Purpose:** Embedded form for adding transactions directly on the main page

**Changes from Current:**
- Remove dialog/modal wrapper
- Display as a card in the page flow
- Maintain existing form logic and validation
- Use pill-style type selector
- Keep responsive grid layout

### 6. Header Component

**Purpose:** Simplified sticky header with branding

**Structure:**
```typescript
<header className="sticky top-0 z-10 bg-card/80 backdrop-blur-sm border-b">
  <div className="container">
    <Logo />
    <AppName />
    <AdminLink />
  </div>
</header>
```

**Features:**
- Sticky positioning
- Backdrop blur effect
- Logo with icon
- Link to admin panel

## Data Models

### ViewMode Type
```typescript
type ViewMode = 'daily' | 'weekly' | 'monthly' | 'calendar' | 'custom';
```

### Date Range Interface
```typescript
interface DateRange {
  start: Date;
  end: Date;
}
```

### Transaction Type Extension
```typescript
// Add 'Transfer' to existing TransactionType
type TransactionType = 'Income' | 'Expense' | 'Transfer';
```

## Utility Functions

### Date Utilities (new file: `utils/dateUtils.ts`)

```typescript
// Calculate date range based on view mode
function getDateRange(mode: ViewMode, referenceDate: Date): DateRange;

// Navigate to previous/next period
function navigateDate(mode: ViewMode, current: Date, direction: 'prev' | 'next'): Date;

// Check if date is within range
function isInRange(date: string, start: Date, end: Date): boolean;

// Format date label for display
function getDateLabel(mode: ViewMode, date: Date): string;

// Get calendar month data
function getCalendarMonth(date: Date, transactions: Transaction[]): DayData[];
```

### Transaction Filtering

```typescript
// Filter transactions by date range
function filterByDateRange(
  transactions: Transaction[],
  start: Date,
  end: Date
): Transaction[];

// Filter transactions by search term
function filterBySearch(
  transactions: Transaction[],
  searchTerm: string
): Transaction[];

// Filter transactions by type
function filterByType(
  transactions: Transaction[],
  type: TransactionType | 'All'
): Transaction[];
```

## Error Handling

### Date Validation
- Validate custom date range (start must be before end)
- Handle invalid date inputs gracefully
- Default to current date on errors

### Transaction Operations
- Maintain existing error handling from hooks
- Display toast notifications for success/error
- Preserve error boundaries

### Empty States
- No transactions in selected period
- No search results
- No transactions in calendar day

## Testing Strategy

### Unit Tests
- Date utility functions (range calculation, navigation)
- Filter functions (search, type, date range)
- Calendar month data generation
- View mode state transitions

### Component Tests
- ViewModeSelector mode switching
- CalendarView day selection
- TransactionTable search and filter
- Form submission and validation

### Integration Tests
- Full page transaction flow (add → display → filter → delete)
- View mode changes with transaction filtering
- Calendar view with transaction data
- Search and filter combinations

### E2E Tests
- Complete user journey: select view → add transaction → search → delete
- Mobile responsive behavior
- Admin panel navigation
- Data persistence across view changes

## Performance Considerations

### Optimization Strategies
1. **Memoization**: Use `useMemo` for filtered transactions and calendar data
2. **Lazy Loading**: Load calendar view component only when selected
3. **Debouncing**: Debounce search input (300ms)
4. **Virtual Scrolling**: Consider for large transaction lists (>100 items)

### Bundle Size
- Remove unused Material-UI components (already done)
- Tree-shake date utilities
- Code-split calendar view

## Migration Strategy

### Phase 1: Create New Components
- Build ViewModeSelector
- Build CalendarView
- Build date utility functions
- Update TransactionTable with search/filter

### Phase 2: Create UnifiedHomePage
- Compose all components
- Implement state management
- Connect to existing hooks
- Add routing

### Phase 3: Update App Structure
- Update App.tsx routing
- Remove old Dashboard and Transactions pages
- Update navigation links
- Test all functionality

### Phase 4: Cleanup
- Remove unused components
- Update documentation
- Verify all features work
- Performance testing

## Accessibility

### Keyboard Navigation
- Tab through view mode selector
- Arrow keys for date navigation
- Enter to select calendar day
- Escape to close expanded views

### Screen Reader Support
- ARIA labels for view mode buttons
- Announce date range changes
- Table headers for transaction table
- Calendar grid semantics

### Visual Accessibility
- Maintain color contrast ratios
- Don't rely solely on color for type indication
- Focus indicators on all interactive elements
- Responsive text sizing

## Browser Compatibility

- Support same browsers as current app (Chrome, Firefox, Safari, Edge)
- Test date picker on all browsers
- Verify calendar grid layout
- Test sticky header behavior

## Future Enhancements

### Potential Additions
1. Export transactions for selected date range
2. Recurring transaction templates
3. Budget tracking per period
4. Comparison between periods
5. Transaction categories chart for selected period
6. Mobile app-like gestures for date navigation
