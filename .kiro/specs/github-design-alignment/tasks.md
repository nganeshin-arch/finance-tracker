# Implementation Plan - GitHub Design Alignment

- [x] 1. Create date utility functions





  - Create `frontend/src/utils/dateUtils.ts` with date range calculation functions
  - Implement `getDateRange()` for daily, weekly, monthly, and custom modes
  - Implement `navigateDate()` for previous/next period navigation
  - Implement `isInRange()` for date filtering
  - Implement `getDateLabel()` for display formatting
  - Implement `getCalendarMonth()` for calendar grid data
  - _Requirements: 2.2, 2.3, 2.4, 3.1, 3.2_

- [x] 2. Create ViewModeSelector component





  - [x] 2.1 Build view mode tab selector


    - Create `frontend/src/components/ViewModeSelector.tsx`
    - Implement tab buttons for Daily, Weekly, Monthly, Calendar, Custom modes
    - Add icons from lucide-react for each mode
    - Style active and inactive states with Tailwind
    - Make tabs responsive (show icons only on mobile)
    - _Requirements: 2.1, 2.6, 6.3_
  
  - [x] 2.2 Implement date navigation controls

    - Add Previous/Next buttons for non-custom modes
    - Add "Today" quick action button
    - Display formatted date label based on view mode
    - Connect to date utility functions
    - _Requirements: 2.3, 2.5_
  
  - [x] 2.3 Add custom date range picker

    - Show date pickers when Custom mode is selected
    - Use shadcn/ui Calendar component for date selection
    - Display selected date range
    - Validate start date is before end date
    - _Requirements: 2.4_


- [x] 3. Create CalendarView component




  - [x] 3.1 Build calendar month grid


    - Create `frontend/src/components/CalendarView.tsx`
    - Generate 7-column grid (Sun-Sat) with Tailwind
    - Display day numbers and transaction totals
    - Color-code income (green) and expense (red) amounts
    - Handle empty days gracefully
    - _Requirements: 3.1, 3.2, 3.4_
  
  - [x] 3.2 Implement day detail view

    - Add click handler for calendar days
    - Display transaction list for selected day
    - Show transaction details (type, category, amount, description)
    - Add delete functionality for transactions
    - _Requirements: 3.3_
  
  - [x] 3.3 Add month navigation

    - Integrate with ViewModeSelector date navigation
    - Update calendar grid when month changes
    - Maintain selected day state during navigation
    - _Requirements: 3.5_

- [x] 4. Enhance TransactionTable component






  - [x] 4.1 Add search functionality

    - Add search input at top of table
    - Implement real-time filtering by description, category, subcategory
    - Add search icon from lucide-react
    - Style with Tailwind focus states
    - _Requirements: 5.1, 5.2_
  

  - [x] 4.2 Add type filter buttons

    - Create filter buttons for All, Income, Expense, Transfer
    - Style active filter with primary color
    - Update table when filter changes
    - Combine with search filtering
    - _Requirements: 5.3_
  

  - [x] 4.3 Update table styling

    - Add hover-reveal delete button on rows
    - Add color-coded type badges
    - Format amounts with currency and color coding
    - Improve responsive layout for mobile
    - Add empty state message
    - _Requirements: 5.4, 5.5, 5.6, 5.7, 6.4_

- [x] 5. Create UnifiedHomePage component





  - [x] 5.1 Set up page structure and state


    - Create `frontend/src/pages/UnifiedHomePage.tsx`
    - Define state for viewMode, referenceDate, customStartDate, customEndDate
    - Initialize with existing hooks (useTransactions, useConfig, useDashboard)
    - Set up transaction filtering logic based on view mode
    - _Requirements: 1.1, 8.1, 8.2, 8.3_
  

  - [x] 5.2 Build sticky header

    - Create header with logo and app name
    - Add link to admin panel
    - Apply sticky positioning and backdrop blur
    - Style with Tailwind
    - _Requirements: 1.4, 7.2, 7.3, 7.4, 7.5_
  

  - [x] 5.3 Compose main content area

    - Add ViewModeSelector with state handlers
    - Add SummaryCards with filtered transactions
    - Embed TransactionForm (remove dialog wrapper)
    - Add conditional rendering for CalendarView vs TransactionTable
    - Arrange in vertical flow with proper spacing
    - _Requirements: 1.1, 1.5, 4.1, 4.2_
  


  - [x] 5.4 Implement transaction operations

    - Connect form submission to createTransaction
    - Connect delete actions to deleteTransaction
    - Update filtered transactions after operations
    - Show toast notifications for success/error

    - _Requirements: 4.3, 8.4, 8.5_
  

  - [x] 5.5 Add responsive layout

    - Stack summary cards on mobile
    - Make transaction form responsive
    - Ensure calendar and table work on mobile
    - Test on various screen sizes
    - _Requirements: 6.1, 6.2, 6.4, 6.5_

- [x] 6. Update SummaryCards component





  - Modify existing component to accept filtered transactions
  - Add Transfer card (if not already present)
  - Ensure cards update when view mode changes
  - Maintain existing styling and animations
  - _Requirements: 2.7_

- [x] 7. Update TransactionForm component



  - Remove dialog/modal wrapper
  - Display as embedded card component
  - Maintain existing form fields and validation
  - Keep pill-style type selector
  - Ensure responsive grid layout
  - _Requirements: 4.1, 4.2, 4.4, 4.5_

- [x] 8. Update App.tsx routing





  - Update routes to use UnifiedHomePage at "/"
  - Keep AdminPage at "/admin"
  - Remove old DashboardPage and TransactionsPage routes
  - Test navigation between home and admin
  - _Requirements: 1.2, 1.3, 7.1, 7.3_

- [x] 9. Add Transfer transaction type support





  - Update backend to support Transfer type (if not already present)
  - Update frontend types to include Transfer
  - Add Transfer to transaction type selector
  - Update summary calculations to include transfers
  - Style Transfer with appropriate color (blue/purple)
  - _Requirements: 8.1, 8.2, 8.5_

- [x] 10. Clean up unused components





  - Remove old DashboardPage.tsx (keep .new.tsx as reference)
  - Remove old TransactionsPage.tsx (keep .new.tsx as reference)
  - Remove old Layout.tsx if no longer used
  - Update imports across the application
  - Remove unused navigation components
  - _Requirements: 7.1_

- [x] 11. Test and verify functionality





  - Test all view modes (daily, weekly, monthly, calendar, custom)
  - Test date navigation (previous, next, today)
  - Test transaction CRUD operations
  - Test search and filter functionality
  - Test calendar day selection and details
  - Verify summary cards update correctly
  - Test responsive behavior on mobile
  - Test admin panel access
  - _Requirements: 1.1, 2.1, 2.2, 2.3, 2.4, 3.1, 3.3, 4.3, 5.1, 5.2, 6.1, 6.2, 6.3, 6.4, 6.5, 7.2, 8.5_

- [x] 12. Performance optimization





  - Add useMemo for filtered transactions
  - Add useMemo for calendar month data
  - Debounce search input (300ms)
  - Lazy load CalendarView component
  - Test with large transaction datasets
  - _Requirements: 8.1, 8.2_
