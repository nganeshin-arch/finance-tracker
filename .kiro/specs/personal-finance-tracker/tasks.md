# Implementation Plan

- [x] 1. Set up project structure and initialize repositories





  - Create backend project with Express.js and TypeScript
  - Create frontend project with React and TypeScript using Create React App or Vite
  - Set up PostgreSQL database
  - Configure environment variables for both frontend and backend
  - Initialize Git repository with .gitignore files
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

- [x] 2. Implement database schema and migrations





  - [x] 2.1 Create database migration files for all tables


    - Write migration for tracking_cycles table
    - Write migration for transaction_types table
    - Write migration for categories table
    - Write migration for sub_categories table
    - Write migration for payment_modes table
    - Write migration for accounts table
    - Write migration for transactions table
    - Write migration for indexes
    - _Requirements: 1.1, 1.5, 1.6, 2.1, 2.2, 2.3, 2.4, 2.5_
  

  - [x] 2.2 Create seed data for initial configuration

    - Seed default transaction types (Income, Expense)
    - Seed common categories for income and expense
    - Seed common sub-categories
    - Seed common payment modes (Cash, Credit Card, Debit Card, UPI, Bank Transfer)
    - Seed sample accounts
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 3. Build backend API foundation






  - [x] 3.1 Set up Express server with middleware

    - Configure Express app with CORS, body-parser, and error handling
    - Create custom error classes (ValidationError, NotFoundError, ConflictError)
    - Implement global error handling middleware
    - Set up database connection pool
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_
  

  - [x] 3.2 Create TypeScript interfaces and types

    - Define all data model interfaces
    - Define DTO interfaces for requests and responses
    - Define filter and query parameter types
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 4. Implement tracking cycle management




  - [x] 4.1 Create tracking cycle repository


    - Implement CRUD operations for tracking cycles
    - Implement query to get active tracking cycle
    - Implement validation to prevent overlapping cycles
    - _Requirements: 5.5, 7.1, 7.2, 7.3, 7.4, 7.5_
  
  - [x] 4.2 Create tracking cycle service layer


    - Implement business logic for creating tracking cycles
    - Implement logic to activate/deactivate cycles
    - Implement validation for date ranges
    - _Requirements: 5.5, 7.1, 7.2, 7.3, 7.4, 7.5_
  
  - [x] 4.3 Create tracking cycle API endpoints


    - Implement GET /api/tracking-cycles
    - Implement GET /api/tracking-cycles/active
    - Implement GET /api/tracking-cycles/:id
    - Implement POST /api/tracking-cycles
    - Implement PUT /api/tracking-cycles/:id
    - Implement DELETE /api/tracking-cycles/:id
    - _Requirements: 5.5, 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 5. Implement configuration management APIs






  - [x] 5.1 Create repositories for configuration entities

    - Implement transaction types repository
    - Implement categories repository with type filtering
    - Implement sub-categories repository with category filtering
    - Implement payment modes repository
    - Implement accounts repository
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 10.1, 10.2, 10.3, 10.4, 10.5, 11.1, 11.2, 11.3, 11.4, 11.5_
  

  - [x] 5.2 Create service layer for configuration management

    - Implement validation for unique names
    - Implement logic to check for dependencies before deletion
    - Implement cascading queries for categories and sub-categories
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 10.1, 10.2, 10.3, 10.4, 10.5, 11.1, 11.2, 11.3, 11.4, 11.5, 12.1, 12.2, 12.3, 12.4, 12.5_
  

  - [x] 5.3 Create configuration API endpoints

    - Implement transaction types endpoints (GET, POST, DELETE)
    - Implement categories endpoints (GET, POST, PUT, DELETE)
    - Implement sub-categories endpoints (GET, POST, PUT, DELETE)
    - Implement payment modes endpoints (GET, POST, DELETE)
    - Implement accounts endpoints (GET, POST, DELETE)
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 10.1, 10.2, 10.3, 10.4, 10.5, 11.1, 11.2, 11.3, 11.4, 11.5, 12.1, 12.2, 12.3, 12.4, 12.5_

- [x] 6. Implement transaction management APIs




  - [x] 6.1 Create transaction repository


    - Implement create transaction with all required fields
    - Implement get transactions with filtering (date range, tracking cycle, type, category, account)
    - Implement get transaction by ID with populated relations
    - Implement update transaction
    - Implement delete transaction
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 4.1, 4.2, 4.3, 4.4, 4.5, 7.1, 7.2, 7.3, 7.4, 7.5_
  
  - [x] 6.2 Create transaction service layer


    - Implement validation for transaction data (amount > 0, required fields)
    - Implement validation for foreign key references
    - Implement logic to associate transaction with tracking cycle
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 2.1, 2.2, 2.3, 2.4, 2.5_
  
  - [x] 6.3 Create transaction API endpoints


    - Implement POST /api/transactions
    - Implement GET /api/transactions with query parameters
    - Implement GET /api/transactions/:id
    - Implement PUT /api/transactions/:id
    - Implement DELETE /api/transactions/:id
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 4.1, 4.2, 4.3, 4.4, 4.5, 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 7. Implement dashboard analytics APIs




  - [x] 7.1 Create dashboard repository with aggregation queries


    - Implement query for total income by period/cycle
    - Implement query for total expenses by period/cycle
    - Implement query for expenses grouped by category
    - Implement query for monthly trend data
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4, 6.5, 8.1, 8.2, 8.3, 8.4, 8.5_
  

  - [x] 7.2 Create dashboard service layer

    - Implement calculation for net balance
    - Implement calculation for category percentages
    - Implement logic to format monthly trend data
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4, 6.5, 8.1, 8.2, 8.3, 8.4, 8.5_
  

  - [x] 7.3 Create dashboard API endpoints

    - Implement GET /api/dashboard/summary
    - Implement GET /api/dashboard/expenses-by-category
    - Implement GET /api/dashboard/monthly-trend
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4, 6.5, 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 8. Set up frontend project structure





  - Create folder structure (components, pages, services, types, utils, hooks)
  - Install and configure Material-UI
  - Install and configure React Router
  - Install and configure React Hook Form and Yup
  - Install and configure date-fns or Day.js
  - Install and configure Recharts or Chart.js
  - Set up API client with axios
  - Create TypeScript interfaces matching backend DTOs
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

- [x] 9. Implement frontend state management





  - Set up React Context for global state
  - Create context for configuration data (types, categories, modes, accounts)
  - Create context for tracking cycles
  - Create custom hooks for API calls
  - Implement error handling and loading states
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 10. Build tracking cycle management UI





  - [x] 10.1 Create MonthlyTrackingCycleManager component

    - Implement form to create new tracking cycle with date pickers
    - Implement list view of all tracking cycles
    - Implement active cycle indicator
    - Implement validation to prevent overlapping dates
    - Implement delete functionality with confirmation
    - _Requirements: 5.5, 7.1, 7.2, 7.3, 7.4, 7.5, 13.1, 13.2, 13.3, 13.4, 13.5_
  
  - [x] 10.2 Integrate tracking cycle manager with API


    - Connect to tracking cycle endpoints
    - Implement real-time updates after create/update/delete
    - Handle API errors with user-friendly messages
    - _Requirements: 5.5, 7.1, 7.2, 7.3, 7.4, 7.5, 13.3_

- [x] 11. Build transaction management UI




  - [x] 11.1 Create TransactionForm component


    - Implement date picker for transaction date
    - Implement dropdown for transaction type
    - Implement cascading dropdowns for category (filtered by type)
    - Implement cascading dropdowns for sub-category (filtered by category)
    - Implement dropdown for payment mode
    - Implement dropdown for account
    - Implement number input for amount
    - Implement text area for description
    - Implement form validation with Yup schema
    - Display inline error messages
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 2.1, 2.2, 2.3, 2.4, 2.5, 13.1, 13.2, 13.3, 13.4, 13.5_
  
  - [x] 11.2 Create TransactionList component


    - Implement table/list view with all transaction fields
    - Implement visual distinction for income (green) and expense (red)
    - Implement edit and delete action buttons
    - Implement pagination or infinite scroll
    - Implement empty state message
    - Implement sorting by columns
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 4.1, 4.2, 4.3, 4.4, 4.5, 13.1, 13.2, 13.3, 13.4, 13.5_
  

  - [x] 11.3 Create DateRangeFilter component

    - Implement start date picker
    - Implement end date picker
    - Implement validation (end >= start)
    - Implement quick select buttons (This Month, Last Month, etc.)
    - Implement clear filter button
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 13.1, 13.2, 13.3, 13.4, 13.5_
  
  - [x] 11.4 Create Transactions page integrating all components


    - Integrate TransactionForm for create/edit
    - Integrate TransactionList for display
    - Integrate DateRangeFilter for filtering
    - Implement modal or drawer for transaction form
    - Implement real-time list updates after create/edit/delete
    - Handle API errors with toast notifications
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 4.1, 4.2, 4.3, 4.4, 4.5, 7.1, 7.2, 7.3, 7.4, 7.5, 13.1, 13.2, 13.3, 13.4, 13.5_

- [x] 12. Build dashboard UI







  - [x] 12.1 Create DashboardSummary component


    - Implement tracking cycle selector dropdown
    - Implement Total Income card with green styling
    - Implement Total Expenses card with red styling
    - Implement Net Balance card with conditional color (green/red)
    - Display cycle date range
    - Implement responsive grid layout
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 13.1, 13.2, 13.3, 13.4, 13.5_
  
  - [x] 12.2 Create ExpenseByCategoryChart component


    - Implement tracking cycle selector dropdown
    - Implement pie or donut chart using Recharts/Chart.js
    - Display category names, amounts, and percentages
    - Implement interactive tooltips
    - Implement legend
    - Make chart responsive
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 13.1, 13.2, 13.3, 13.4, 13.5_
  

  - [x] 12.3 Create MonthlyTrendChart component

    - Implement line or bar chart using Recharts/Chart.js
    - Display income series in green
    - Display expense series in red
    - Implement X-axis with month labels
    - Implement Y-axis with amount values
    - Implement interactive tooltips
    - Implement zoom/pan capabilities (optional)
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 13.1, 13.2, 13.3, 13.4, 13.5_
  
  - [x] 12.4 Create Dashboard page integrating all components


    - Integrate DashboardSummary at the top
    - Integrate ExpenseByCategoryChart
    - Integrate MonthlyTrendChart
    - Implement responsive layout (stack on mobile, side-by-side on desktop)
    - Implement loading states for async data
    - Handle API errors with user-friendly messages
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4, 6.5, 8.1, 8.2, 8.3, 8.4, 8.5, 13.1, 13.2, 13.3, 13.4, 13.5_

- [x] 13. Build admin configuration UI




  - [x] 13.1 Create ConfigurationManager component


    - Implement generic list view for configuration items
    - Implement add new item form
    - Implement inline edit or modal edit
    - Implement delete with confirmation dialog
    - Display validation errors
    - Prevent deletion when items are in use
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 11.1, 11.2, 11.3, 11.4, 11.5, 12.1, 12.2, 12.3, 12.4, 12.5, 13.1, 13.2, 13.3, 13.4, 13.5_
  

  - [x] 13.2 Create CategoryManager component

    - Implement transaction type selector
    - Implement tree view or nested list for categories and sub-categories
    - Implement add category form
    - Implement add sub-category form (with parent category selection)
    - Implement edit and delete actions
    - Implement validation for unique names
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 10.1, 10.2, 10.3, 10.4, 10.5, 12.1, 12.2, 12.3, 12.4, 12.5, 13.1, 13.2, 13.3, 13.4, 13.5_
  

  - [x] 13.3 Create AdminPanel component with tabs

    - Implement tab navigation for different configuration types
    - Create tab for Transaction Types using ConfigurationManager
    - Create tab for Categories using CategoryManager
    - Create tab for Payment Modes using ConfigurationManager
    - Create tab for Accounts using ConfigurationManager
    - Implement responsive layout
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 10.1, 10.2, 10.3, 10.4, 10.5, 11.1, 11.2, 11.3, 11.4, 11.5, 12.1, 12.2, 12.3, 12.4, 12.5, 13.1, 13.2, 13.3, 13.4, 13.5_

- [x] 14. Implement navigation and routing





  - Create main navigation bar with links to Dashboard, Transactions, Admin
  - Implement React Router with routes for each page
  - Implement active state indication for current page
  - Implement mobile-friendly hamburger menu
  - Create layout component with sticky header
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

- [x] 15. Implement UI/UX enhancements





  - Apply Material-UI theme with custom color scheme (blue, green, red)
  - Implement loading spinners for async operations
  - Implement toast notifications for success/error messages
  - Implement confirmation dialogs for destructive actions
  - Add ARIA labels for accessibility
  - Ensure keyboard navigation support
  - Test and adjust color contrast ratios
  - Implement responsive design for mobile, tablet, and desktop
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

- [x] 16. Connect frontend to backend APIs





  - Implement API client service with base URL configuration
  - Create API methods for all endpoints
  - Implement request/response interceptors for error handling
  - Configure CORS on backend for frontend origin
  - Test all API integrations end-to-end
  - Implement optimistic UI updates where appropriate
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.2, 7.3, 7.4, 7.5, 8.1, 8.2, 8.3, 8.4, 8.5, 13.3_

- [x] 17. Deployment and documentation





  - Create README with setup instructions
  - Document API endpoints with examples
  - Create environment variable templates (.env.example)
  - Set up Docker configuration (optional)
  - Deploy backend to hosting service
  - Deploy frontend to hosting service or CDN
  - Configure production database
  - Test deployed application end-to-end
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.2, 7.3, 7.4, 7.5, 8.1, 8.2, 8.3, 8.4, 8.5, 9.1, 9.2, 9.3, 9.4, 9.5, 10.1, 10.2, 10.3, 10.4, 10.5, 11.1, 11.2, 11.3, 11.4, 11.5, 12.1, 12.2, 12.3, 12.4, 12.5, 13.1, 13.2, 13.3, 13.4, 13.5_
