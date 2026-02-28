# Requirements Document - GitHub Design Alignment

## Introduction

This spec defines the requirements for aligning the current My Money Journal application with the reference design from the GitHub repository (https://github.com/nganeshin-arch/my-money-journal). The goal is to adopt the single-page layout structure, view mode selector, and simplified navigation pattern from the reference design while maintaining the existing backend integration and data models.

## Glossary

- **Application**: The My Money Journal personal finance tracking web application
- **View Mode**: The time-based filtering option (Daily, Weekly, Monthly, Calendar, Custom)
- **Reference Design**: The target UI structure from the GitHub repository
- **Single-Page Layout**: A unified interface where all main features are accessible on one page
- **Calendar View**: A month-grid visualization showing transactions by date
- **Transaction Table**: A list-based view of transactions with search and filter capabilities

## Requirements

### Requirement 1: Single-Page Layout Structure

**User Story:** As a user, I want all main features accessible on a single page, so that I can manage my finances without navigating between multiple pages

#### Acceptance Criteria

1. WHEN THE Application loads, THE Application SHALL display a single-page interface containing summary cards, transaction form, and transaction list
2. THE Application SHALL eliminate separate routes for dashboard and transactions pages
3. THE Application SHALL maintain the admin panel as a separate route for configuration management
4. THE Application SHALL display a sticky header with application branding and logo
5. THE Application SHALL organize content in a vertical flow: header, view selector, summary cards, transaction form, and transaction list

### Requirement 2: View Mode Selector

**User Story:** As a user, I want to filter transactions by different time periods, so that I can analyze my spending patterns across various timeframes

#### Acceptance Criteria

1. THE Application SHALL provide five view mode options: Daily, Weekly, Monthly, Calendar, and Custom
2. WHEN a user selects a view mode, THE Application SHALL filter transactions to match the selected time period
3. WHEN Daily, Weekly, or Monthly mode is active, THE Application SHALL display navigation controls to move between periods
4. WHEN Custom mode is active, THE Application SHALL display date range pickers for start and end dates
5. THE Application SHALL display a "Today" button to quickly return to the current date
6. THE Application SHALL persist the selected view mode during the session
7. THE Application SHALL update summary cards to reflect the filtered transaction data

### Requirement 3: Calendar View

**User Story:** As a user, I want to view my transactions in a calendar format, so that I can see my spending patterns by date

#### Acceptance Criteria

1. WHEN Calendar view mode is selected, THE Application SHALL display transactions in a month-grid layout
2. THE Application SHALL show each day with its total income and expense amounts
3. WHEN a user clicks on a calendar day, THE Application SHALL display transactions for that specific date
4. THE Application SHALL color-code amounts based on transaction type (green for income, red for expense)
5. THE Application SHALL allow navigation between months using previous/next controls

### Requirement 4: Integrated Transaction Form

**User Story:** As a user, I want to add transactions directly from the main page, so that I can quickly record my financial activities

#### Acceptance Criteria

1. THE Application SHALL display the transaction form embedded in the main page layout
2. THE Application SHALL position the form between summary cards and transaction list
3. WHEN a user submits a transaction, THE Application SHALL immediately update the transaction list and summary cards
4. THE Application SHALL maintain the existing form fields and validation rules
5. THE Application SHALL use pill-style buttons for transaction type selection

### Requirement 5: Enhanced Transaction Table

**User Story:** As a user, I want to search and filter transactions efficiently, so that I can find specific transactions quickly

#### Acceptance Criteria

1. THE Application SHALL display a search input at the top of the transaction table
2. WHEN a user types in the search field, THE Application SHALL filter transactions by description, category, or subcategory
3. THE Application SHALL provide filter buttons for All, Income, Expense, and Transfer types
4. WHEN a user hovers over a transaction row, THE Application SHALL reveal a delete button
5. THE Application SHALL display transaction type badges with appropriate color coding
6. THE Application SHALL format amounts with currency symbols and color coding based on type
7. THE Application SHALL display an empty state message when no transactions match the filters

### Requirement 6: Responsive Design

**User Story:** As a user, I want the application to work seamlessly on mobile devices, so that I can manage my finances on the go

#### Acceptance Criteria

1. THE Application SHALL adapt the layout for mobile screens (below 640px width)
2. WHEN viewed on mobile, THE Application SHALL stack summary cards vertically
3. WHEN viewed on mobile, THE Application SHALL display view mode icons without labels
4. WHEN viewed on mobile, THE Application SHALL make the transaction table horizontally scrollable
5. THE Application SHALL maintain touch-friendly button sizes on mobile devices

### Requirement 7: Navigation Simplification

**User Story:** As a user, I want simplified navigation, so that I can focus on my financial data without unnecessary complexity

#### Acceptance Criteria

1. THE Application SHALL remove the main navigation menu from the header
2. THE Application SHALL provide a direct link or button to access the admin panel
3. THE Application SHALL maintain the admin panel route at /admin
4. THE Application SHALL display the application logo and name in the header
5. THE Application SHALL use a sticky header that remains visible during scrolling

### Requirement 8: Data Integration

**User Story:** As a user, I want the new interface to work with my existing data, so that I don't lose any transaction history

#### Acceptance Criteria

1. THE Application SHALL maintain compatibility with the existing backend API
2. THE Application SHALL use the existing transaction, category, and configuration data models
3. THE Application SHALL preserve all existing hooks (useTransactions, useConfig, useDashboard)
4. THE Application SHALL maintain the existing service layer for API communication
5. THE Application SHALL support all existing transaction operations (create, read, update, delete)
