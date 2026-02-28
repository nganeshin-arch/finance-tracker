# Testing Checklist

Use this checklist to verify all features are working correctly after deployment.

## Pre-Deployment Testing

### Backend API Tests

#### Health Check
- [ ] GET `/health` returns 200 status
- [ ] Response includes database connection status

#### Tracking Cycles
- [ ] GET `/api/tracking-cycles` returns all cycles
- [ ] GET `/api/tracking-cycles/active` returns active cycle
- [ ] GET `/api/tracking-cycles/:id` returns specific cycle
- [ ] POST `/api/tracking-cycles` creates new cycle
- [ ] PUT `/api/tracking-cycles/:id` updates cycle
- [ ] DELETE `/api/tracking-cycles/:id` deletes cycle
- [ ] Cannot create overlapping cycles
- [ ] Only one cycle can be active at a time

#### Transactions
- [ ] GET `/api/transactions` returns all transactions
- [ ] GET `/api/transactions?startDate=X&endDate=Y` filters by date
- [ ] GET `/api/transactions?trackingCycleId=X` filters by cycle
- [ ] GET `/api/transactions/:id` returns specific transaction
- [ ] POST `/api/transactions` creates transaction
- [ ] PUT `/api/transactions/:id` updates transaction
- [ ] DELETE `/api/transactions/:id` deletes transaction
- [ ] Validates amount is positive
- [ ] Validates all required fields
- [ ] Associates transaction with active tracking cycle

#### Dashboard
- [ ] GET `/api/dashboard/summary` returns correct totals
- [ ] GET `/api/dashboard/summary?trackingCycleId=X` filters by cycle
- [ ] GET `/api/dashboard/expenses-by-category` returns category breakdown
- [ ] GET `/api/dashboard/monthly-trend` returns trend data
- [ ] Calculations are accurate (income, expenses, net balance)
- [ ] Percentages sum to 100%

#### Configuration - Transaction Types
- [ ] GET `/api/config/types` returns all types
- [ ] POST `/api/config/types` creates new type
- [ ] DELETE `/api/config/types/:id` deletes type
- [ ] Cannot delete type with associated categories

#### Configuration - Categories
- [ ] GET `/api/config/categories` returns all categories
- [ ] GET `/api/config/categories?transactionTypeId=X` filters by type
- [ ] POST `/api/config/categories` creates category
- [ ] PUT `/api/config/categories/:id` updates category
- [ ] DELETE `/api/config/categories/:id` deletes category
- [ ] Cannot delete category with sub-categories
- [ ] Cannot delete category with transactions
- [ ] Category names are unique within transaction type

#### Configuration - Sub-Categories
- [ ] GET `/api/config/subcategories` returns all sub-categories
- [ ] GET `/api/config/subcategories?categoryId=X` filters by category
- [ ] POST `/api/config/subcategories` creates sub-category
- [ ] PUT `/api/config/subcategories/:id` updates sub-category
- [ ] DELETE `/api/config/subcategories/:id` deletes sub-category
- [ ] Cannot delete sub-category with transactions
- [ ] Sub-category names are unique within category

#### Configuration - Payment Modes
- [ ] GET `/api/config/modes` returns all modes
- [ ] POST `/api/config/modes` creates mode
- [ ] DELETE `/api/config/modes/:id` deletes mode
- [ ] Cannot delete mode with transactions
- [ ] Mode names are unique

#### Configuration - Accounts
- [ ] GET `/api/config/accounts` returns all accounts
- [ ] POST `/api/config/accounts` creates account
- [ ] DELETE `/api/config/accounts/:id` deletes account
- [ ] Cannot delete account with transactions
- [ ] Account names are unique

#### Error Handling
- [ ] 400 Bad Request for validation errors
- [ ] 404 Not Found for missing resources
- [ ] 409 Conflict for constraint violations
- [ ] 500 Internal Server Error for unexpected errors
- [ ] Error responses include helpful messages

### Frontend Tests

#### Navigation
- [ ] Navigation bar displays all menu items
- [ ] Active page is highlighted
- [ ] Mobile menu works (hamburger icon)
- [ ] All routes are accessible
- [ ] Browser back/forward buttons work

#### Dashboard Page
- [ ] Summary cards display correct values
- [ ] Income card is green
- [ ] Expense card is red
- [ ] Net balance color changes based on value (green/red)
- [ ] Tracking cycle selector works
- [ ] Expense by category chart displays
- [ ] Chart shows correct percentages
- [ ] Chart tooltips work
- [ ] Monthly trend chart displays
- [ ] Trend chart shows income and expenses
- [ ] Charts are responsive on mobile
- [ ] Loading states display during data fetch
- [ ] Error messages display on API failure

#### Transactions Page
- [ ] Transaction list displays all transactions
- [ ] Income transactions are green
- [ ] Expense transactions are red
- [ ] Date range filter works
- [ ] Quick date filters work (This Month, Last Month, etc.)
- [ ] Clear filter button works
- [ ] Add transaction button opens form
- [ ] Transaction form validates all fields
- [ ] Date picker works
- [ ] Transaction type dropdown works
- [ ] Category dropdown filters by type
- [ ] Sub-category dropdown filters by category
- [ ] Payment mode dropdown works
- [ ] Account dropdown works
- [ ] Amount field validates positive numbers
- [ ] Description field is optional
- [ ] Form submission creates transaction
- [ ] Transaction list updates after creation
- [ ] Edit button opens form with data
- [ ] Form submission updates transaction
- [ ] Delete button shows confirmation
- [ ] Delete confirmation removes transaction
- [ ] Pagination/scroll works for large lists
- [ ] Sorting by columns works
- [ ] Empty state displays when no transactions

#### Admin Page
- [ ] Tab navigation works
- [ ] Transaction Types tab displays
- [ ] Categories tab displays
- [ ] Payment Modes tab displays
- [ ] Accounts tab displays

#### Admin - Transaction Types
- [ ] List displays all types
- [ ] Add form works
- [ ] Delete button shows confirmation
- [ ] Cannot delete type with categories
- [ ] Success message displays after actions

#### Admin - Categories
- [ ] Transaction type selector works
- [ ] Category list filters by type
- [ ] Sub-categories display under categories
- [ ] Add category form works
- [ ] Add sub-category form works
- [ ] Edit category works
- [ ] Edit sub-category works
- [ ] Delete category shows confirmation
- [ ] Cannot delete category with sub-categories
- [ ] Cannot delete category with transactions
- [ ] Delete sub-category shows confirmation
- [ ] Cannot delete sub-category with transactions
- [ ] Validation prevents duplicate names

#### Admin - Payment Modes
- [ ] List displays all modes
- [ ] Add form works
- [ ] Delete button shows confirmation
- [ ] Cannot delete mode with transactions
- [ ] Validation prevents duplicate names

#### Admin - Accounts
- [ ] List displays all accounts
- [ ] Add form works
- [ ] Delete button shows confirmation
- [ ] Cannot delete account with transactions
- [ ] Validation prevents duplicate names

#### Tracking Cycle Manager
- [ ] List displays all cycles
- [ ] Active cycle is highlighted
- [ ] Add cycle form works
- [ ] Date pickers work
- [ ] Validates end date >= start date
- [ ] Prevents overlapping cycles
- [ ] Activate/deactivate toggle works
- [ ] Delete button shows confirmation
- [ ] Delete removes cycle

#### UI/UX
- [ ] Loading spinners display during async operations
- [ ] Success toast notifications display
- [ ] Error toast notifications display
- [ ] Confirmation dialogs work
- [ ] Forms show inline validation errors
- [ ] Disabled states work during processing
- [ ] Responsive design works on mobile
- [ ] Responsive design works on tablet
- [ ] Responsive design works on desktop
- [ ] Color contrast is sufficient
- [ ] Keyboard navigation works
- [ ] Focus indicators are visible
- [ ] ARIA labels are present

### Database Tests

#### Schema
- [ ] All tables exist
- [ ] All columns have correct types
- [ ] All constraints are in place
- [ ] All indexes exist
- [ ] Foreign keys are configured
- [ ] Check constraints work

#### Seed Data
- [ ] Transaction types are seeded
- [ ] Categories are seeded
- [ ] Sub-categories are seeded
- [ ] Payment modes are seeded
- [ ] Accounts are seeded

#### Data Integrity
- [ ] Cannot insert invalid data
- [ ] Foreign key constraints prevent orphaned records
- [ ] Unique constraints prevent duplicates
- [ ] Check constraints validate data
- [ ] Cascading deletes work correctly

### Integration Tests

#### End-to-End Flows
- [ ] Create tracking cycle → Create transaction → View on dashboard
- [ ] Create category → Create sub-category → Use in transaction
- [ ] Create transaction → Edit → Delete
- [ ] Filter transactions → View filtered dashboard
- [ ] Create multiple transactions → View trends

#### Data Consistency
- [ ] Dashboard totals match transaction sums
- [ ] Category percentages are accurate
- [ ] Monthly trends show correct data
- [ ] Filtering works consistently across pages
- [ ] Real-time updates work across components

---

## Post-Deployment Testing

### Production Environment

#### Deployment Verification
- [ ] Application is accessible at production URL
- [ ] SSL certificate is valid (HTTPS)
- [ ] Health check endpoint responds
- [ ] Database connection is working
- [ ] Environment variables are set correctly

#### Performance
- [ ] Page load time < 3 seconds
- [ ] API response time < 1 second
- [ ] Charts render smoothly
- [ ] No console errors
- [ ] No console warnings (production)

#### Security
- [ ] CORS is configured correctly
- [ ] No sensitive data in client code
- [ ] Database credentials are secure
- [ ] HTTPS is enforced
- [ ] Security headers are set

#### Monitoring
- [ ] Error tracking is configured
- [ ] Logging is working
- [ ] Uptime monitoring is active
- [ ] Database backups are scheduled

#### Browser Compatibility
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

#### Mobile Testing
- [ ] Responsive layout works
- [ ] Touch interactions work
- [ ] Forms are usable
- [ ] Charts are readable
- [ ] Navigation is accessible

---

## Regression Testing

Run this checklist after any major changes or updates:

### Critical Paths
- [ ] User can create a transaction
- [ ] User can view dashboard
- [ ] User can filter transactions
- [ ] Admin can manage categories
- [ ] Tracking cycles work correctly

### Data Migration
- [ ] Existing data is preserved
- [ ] New migrations run successfully
- [ ] No data loss
- [ ] Relationships are maintained

### Backward Compatibility
- [ ] API endpoints still work
- [ ] Frontend still connects to backend
- [ ] Database schema is compatible

---

## Load Testing (Optional)

### Performance Benchmarks
- [ ] 100 concurrent users
- [ ] 1000 transactions in database
- [ ] 10,000 transactions in database
- [ ] Dashboard loads in < 2 seconds
- [ ] API responds in < 500ms

### Stress Testing
- [ ] Multiple simultaneous requests
- [ ] Large data imports
- [ ] Rapid CRUD operations
- [ ] Connection pool limits

---

## Automated Testing (Future)

### Unit Tests
- [ ] Service layer functions
- [ ] Repository methods
- [ ] Utility functions
- [ ] Validation logic

### Integration Tests
- [ ] API endpoints
- [ ] Database operations
- [ ] Error handling

### E2E Tests
- [ ] Critical user flows
- [ ] Form submissions
- [ ] Navigation
- [ ] Data persistence

---

## Sign-Off

### Development
- [ ] All features implemented
- [ ] Code reviewed
- [ ] Documentation complete
- [ ] Tests passing

### Staging
- [ ] Deployed to staging
- [ ] All tests passing
- [ ] Performance acceptable
- [ ] No critical bugs

### Production
- [ ] Deployed to production
- [ ] Smoke tests passing
- [ ] Monitoring active
- [ ] Backup verified
- [ ] Rollback plan ready

---

**Tested By**: _______________  
**Date**: _______________  
**Environment**: _______________  
**Version**: _______________  
**Status**: ☐ Pass ☐ Fail  
**Notes**: _______________
