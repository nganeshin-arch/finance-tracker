# API Documentation

Base URL: `http://localhost:5000/api` (development)

All endpoints return JSON responses.

## Table of Contents

- [Authentication](#authentication)
- [Multi-Tenant Data Isolation](#multi-tenant-data-isolation)
- [Admin-Only Endpoints](#admin-only-endpoints)
- [Tracking Cycles](#tracking-cycles)
- [Transactions](#transactions)
- [Dashboard](#dashboard)
- [Configuration](#configuration)
- [Error Responses](#error-responses)
- [Rate Limiting](#rate-limiting)

---

## Tracking Cycles

Manage monthly tracking cycles for organizing transactions.

### Get All Tracking Cycles

```http
GET /api/tracking-cycles
```

**Response**: `200 OK`
```json
[
  {
    "id": 1,
    "name": "January 2024",
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### Get Active Tracking Cycle

```http
GET /api/tracking-cycles/active
```

**Response**: `200 OK`
```json
{
  "id": 1,
  "name": "January 2024",
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Response**: `404 Not Found` (if no active cycle)
```json
{
  "error": "Resource Not Found",
  "message": "No active tracking cycle found"
}
```

### Get Tracking Cycle by ID

```http
GET /api/tracking-cycles/:id
```

**Response**: `200 OK`
```json
{
  "id": 1,
  "name": "January 2024",
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Create Tracking Cycle

```http
POST /api/tracking-cycles
```

**Request Body**:
```json
{
  "name": "February 2024",
  "startDate": "2024-02-01",
  "endDate": "2024-02-29"
}
```

**Response**: `201 Created`
```json
{
  "id": 2,
  "name": "February 2024",
  "startDate": "2024-02-01",
  "endDate": "2024-02-29",
  "isActive": false,
  "createdAt": "2024-02-01T00:00:00.000Z",
  "updatedAt": "2024-02-01T00:00:00.000Z"
}
```

### Update Tracking Cycle

```http
PUT /api/tracking-cycles/:id
```

**Request Body**:
```json
{
  "name": "February 2024 Updated",
  "isActive": true
}
```

**Response**: `200 OK`
```json
{
  "id": 2,
  "name": "February 2024 Updated",
  "startDate": "2024-02-01",
  "endDate": "2024-02-29",
  "isActive": true,
  "createdAt": "2024-02-01T00:00:00.000Z",
  "updatedAt": "2024-02-01T10:30:00.000Z"
}
```

### Delete Tracking Cycle

```http
DELETE /api/tracking-cycles/:id
```

**Response**: `204 No Content`

---

## Transactions

Manage financial transactions (income and expenses).

**Authentication**: Required - All transaction endpoints automatically filter by authenticated user's ID.

**Data Isolation**: Users can only access their own transactions. Attempting to access another user's transaction will result in a 404 error.

### Get All Transactions

```http
GET /api/transactions
```

**Authentication**: Required

**Query Parameters**:
- `startDate` (optional): Filter by start date (YYYY-MM-DD)
- `endDate` (optional): Filter by end date (YYYY-MM-DD)
- `trackingCycleId` (optional): Filter by tracking cycle
- `transactionTypeId` (optional): Filter by transaction type
- `categoryId` (optional): Filter by category
- `accountId` (optional): Filter by account

**Note**: Results are automatically filtered to show only the authenticated user's transactions.

**Example**:
```http
GET /api/transactions?startDate=2024-01-01&endDate=2024-01-31&transactionTypeId=2
Authorization: Bearer <your-jwt-token>
```

**Response**: `200 OK`
```json
[
  {
    "id": 1,
    "userId": 2,
    "trackingCycleId": 1,
    "date": "2024-01-15",
    "transactionTypeId": 2,
    "categoryId": 3,
    "subCategoryId": 5,
    "paymentModeId": 1,
    "accountId": 1,
    "amount": 150.50,
    "description": "Grocery shopping",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z",
    "transactionType": {
      "id": 2,
      "name": "Expense"
    },
    "category": {
      "id": 3,
      "name": "Food & Dining"
    },
    "subCategory": {
      "id": 5,
      "name": "Groceries"
    },
    "paymentMode": {
      "id": 1,
      "name": "Credit Card"
    },
    "account": {
      "id": 1,
      "name": "Main Account"
    }
  }
]
```

**Error**: `401 Unauthorized` (if not authenticated)
```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

### Get Transaction by ID

```http
GET /api/transactions/:id
```

**Authentication**: Required

**Ownership Check**: Returns 404 if transaction doesn't exist or doesn't belong to authenticated user.

**Response**: `200 OK`
```json
{
  "id": 1,
  "userId": 2,
  "trackingCycleId": 1,
  "date": "2024-01-15",
  "transactionTypeId": 2,
  "categoryId": 3,
  "subCategoryId": 5,
  "paymentModeId": 1,
  "accountId": 1,
  "amount": 150.50,
  "description": "Grocery shopping",
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T10:00:00.000Z",
  "transactionType": { "id": 2, "name": "Expense" },
  "category": { "id": 3, "name": "Food & Dining" },
  "subCategory": { "id": 5, "name": "Groceries" },
  "paymentMode": { "id": 1, "name": "Credit Card" },
  "account": { "id": 1, "name": "Main Account" }
}
```

**Error**: `404 Not Found` (if transaction doesn't exist or doesn't belong to user)
```json
{
  "error": "Not Found",
  "message": "Transaction not found"
}
```

### Create Transaction

```http
POST /api/transactions
```

**Authentication**: Required

**Note**: The `userId` is automatically set from the authenticated user's JWT token.

**Request Body**:
```json
{
  "date": "2024-01-15",
  "transactionTypeId": 2,
  "categoryId": 3,
  "subCategoryId": 5,
  "paymentModeId": 1,
  "accountId": 1,
  "amount": 150.50,
  "description": "Grocery shopping"
}
```

**Response**: `201 Created`
```json
{
  "id": 1,
  "userId": 2,
  "trackingCycleId": 1,
  "date": "2024-01-15",
  "transactionTypeId": 2,
  "categoryId": 3,
  "subCategoryId": 5,
  "paymentModeId": 1,
  "accountId": 1,
  "amount": 150.50,
  "description": "Grocery shopping",
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T10:00:00.000Z"
}
```

### Update Transaction

```http
PUT /api/transactions/:id
```

**Authentication**: Required

**Ownership Check**: Returns 404 if transaction doesn't exist or doesn't belong to authenticated user.

**Request Body**:
```json
{
  "amount": 175.75,
  "description": "Grocery shopping - updated"
}
```

**Response**: `200 OK`
```json
{
  "id": 1,
  "userId": 2,
  "trackingCycleId": 1,
  "date": "2024-01-15",
  "transactionTypeId": 2,
  "categoryId": 3,
  "subCategoryId": 5,
  "paymentModeId": 1,
  "accountId": 1,
  "amount": 175.75,
  "description": "Grocery shopping - updated",
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T11:30:00.000Z"
}
```

**Error**: `404 Not Found` (if transaction doesn't exist or doesn't belong to user)
```json
{
  "error": "Not Found",
  "message": "Transaction not found"
}
```

### Delete Transaction

```http
DELETE /api/transactions/:id
```

**Authentication**: Required

**Ownership Check**: Returns 404 if transaction doesn't exist or doesn't belong to authenticated user.

**Response**: `204 No Content`

**Error**: `404 Not Found` (if transaction doesn't exist or doesn't belong to user)
```json
{
  "error": "Not Found",
  "message": "Transaction not found"
}
```

---

## Dashboard

Get aggregated financial data and analytics.

**Authentication**: Required - All dashboard endpoints automatically filter by authenticated user's ID.

**Data Isolation**: Dashboard metrics are calculated exclusively from the authenticated user's transaction data.

### Get Dashboard Summary

```http
GET /api/dashboard/summary
```

**Authentication**: Required

**Query Parameters**:
- `trackingCycleId` (optional): Get summary for specific tracking cycle
- `startDate` (optional): Filter by start date (YYYY-MM-DD)
- `endDate` (optional): Filter by end date (YYYY-MM-DD)

**Note**: Summary is calculated only from the authenticated user's transactions.

**Example**:
```http
GET /api/dashboard/summary?trackingCycleId=1
Authorization: Bearer <your-jwt-token>
```

**Response**: `200 OK`
```json
{
  "totalIncome": 5000.00,
  "totalExpenses": 3250.75,
  "netBalance": 1749.25,
  "period": {
    "startDate": "2024-01-01",
    "endDate": "2024-01-31"
  },
  "trackingCycle": {
    "id": 1,
    "name": "January 2024",
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "isActive": true
  }
}
```

**Error**: `401 Unauthorized` (if not authenticated)
```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

### Get Expenses by Category

```http
GET /api/dashboard/expenses-by-category
```

**Authentication**: Required

**Query Parameters**:
- `trackingCycleId` (optional): Get expenses for specific tracking cycle
- `startDate` (optional): Filter by start date (YYYY-MM-DD)
- `endDate` (optional): Filter by end date (YYYY-MM-DD)

**Note**: Category breakdown is calculated only from the authenticated user's transactions.

**Example**:
```http
GET /api/dashboard/expenses-by-category?trackingCycleId=1
Authorization: Bearer <your-jwt-token>
```

**Response**: `200 OK`
```json
[
  {
    "categoryId": 3,
    "categoryName": "Food & Dining",
    "amount": 850.50,
    "percentage": 26.15
  },
  {
    "categoryId": 4,
    "categoryName": "Transportation",
    "amount": 450.00,
    "percentage": 13.85
  },
  {
    "categoryId": 5,
    "categoryName": "Entertainment",
    "amount": 300.25,
    "percentage": 9.23
  }
]
```

### Get Monthly Trend

```http
GET /api/dashboard/monthly-trend
```

**Authentication**: Required

**Query Parameters**:
- `months` (optional): Number of months to include (default: 6)

**Note**: Monthly trend is calculated only from the authenticated user's transactions.

**Example**:
```http
GET /api/dashboard/monthly-trend?months=12
Authorization: Bearer <your-jwt-token>
```

**Response**: `200 OK`
```json
[
  {
    "month": "2024-01",
    "income": 5000.00,
    "expenses": 3250.75
  },
  {
    "month": "2023-12",
    "income": 4800.00,
    "expenses": 3100.50
  },
  {
    "month": "2023-11",
    "income": 5200.00,
    "expenses": 3400.25
  }
]
```

---

## Configuration

Manage system configuration (transaction types, categories, payment modes, accounts).

**Read Access**: All authenticated users can view configuration data.

**Write Access**: Only admins can create, update, or delete configuration items.

**Shared Data**: Configuration is shared across all users in the system.

### Transaction Types

#### Get All Transaction Types

```http
GET /api/config/types
```

**Authentication**: Required

**Response**: `200 OK`
```json
[
  { "id": 1, "name": "Income", "createdAt": "2024-01-01T00:00:00.000Z" },
  { "id": 2, "name": "Expense", "createdAt": "2024-01-01T00:00:00.000Z" }
]
```

#### Create Transaction Type

```http
POST /api/config/types
```

**Authentication**: Required (Admin only)

**Request Body**:
```json
{
  "name": "Transfer"
}
```

**Response**: `201 Created`

**Error**: `403 Forbidden` (if not admin)

#### Delete Transaction Type

```http
DELETE /api/config/types/:id
```

**Authentication**: Required (Admin only)

**Response**: `204 No Content`

**Error**: `403 Forbidden` (if not admin)

### Categories

#### Get All Categories

```http
GET /api/config/categories
```

**Authentication**: Required

**Query Parameters**:
- `transactionTypeId` (optional): Filter by transaction type

**Example**:
```http
GET /api/config/categories?transactionTypeId=2
```

**Response**: `200 OK`
```json
[
  {
    "id": 3,
    "name": "Food & Dining",
    "transactionTypeId": 2,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "transactionType": {
      "id": 2,
      "name": "Expense"
    }
  }
]
```

#### Create Category

```http
POST /api/config/categories
```

**Authentication**: Required (Admin only)

**Request Body**:
```json
{
  "name": "Healthcare",
  "transactionTypeId": 2
}
```

**Response**: `201 Created`

**Error**: `403 Forbidden` (if not admin)

#### Update Category

```http
PUT /api/config/categories/:id
```

**Authentication**: Required (Admin only)

**Request Body**:
```json
{
  "name": "Health & Wellness"
}
```

**Response**: `200 OK`

**Error**: `403 Forbidden` (if not admin)

#### Delete Category

```http
DELETE /api/config/categories/:id
```

**Authentication**: Required (Admin only)

**Response**: `204 No Content`

**Error**: `409 Conflict` (if category has sub-categories or transactions)

**Error**: `403 Forbidden` (if not admin)

### Sub-Categories

#### Get All Sub-Categories

```http
GET /api/config/subcategories
```

**Authentication**: Required

**Query Parameters**:
- `categoryId` (optional): Filter by category

**Example**:
```http
GET /api/config/subcategories?categoryId=3
```

**Response**: `200 OK`
```json
[
  {
    "id": 5,
    "name": "Groceries",
    "categoryId": 3,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "category": {
      "id": 3,
      "name": "Food & Dining"
    }
  }
]
```

#### Create Sub-Category

```http
POST /api/config/subcategories
```

**Authentication**: Required (Admin only)

**Request Body**:
```json
{
  "name": "Restaurants",
  "categoryId": 3
}
```

**Response**: `201 Created`

**Error**: `403 Forbidden` (if not admin)

#### Update Sub-Category

```http
PUT /api/config/subcategories/:id
```

**Authentication**: Required (Admin only)

**Request Body**:
```json
{
  "name": "Fine Dining"
}
```

**Response**: `200 OK`

**Error**: `403 Forbidden` (if not admin)

#### Delete Sub-Category

```http
DELETE /api/config/subcategories/:id
```

**Authentication**: Required (Admin only)

**Response**: `204 No Content`

**Error**: `409 Conflict` (if sub-category has transactions)

**Error**: `403 Forbidden` (if not admin)

### Payment Modes

#### Get All Payment Modes

```http
GET /api/config/modes
```

**Authentication**: Required

**Response**: `200 OK`
```json
[
  { "id": 1, "name": "Credit Card", "createdAt": "2024-01-01T00:00:00.000Z" },
  { "id": 2, "name": "Cash", "createdAt": "2024-01-01T00:00:00.000Z" },
  { "id": 3, "name": "Debit Card", "createdAt": "2024-01-01T00:00:00.000Z" }
]
```

#### Create Payment Mode

```http
POST /api/config/modes
```

**Authentication**: Required (Admin only)

**Request Body**:
```json
{
  "name": "UPI"
}
```

**Response**: `201 Created`

**Error**: `403 Forbidden` (if not admin)

#### Delete Payment Mode

```http
DELETE /api/config/modes/:id
```

**Authentication**: Required (Admin only)

**Response**: `204 No Content`

**Error**: `403 Forbidden` (if not admin)

### Accounts

#### Get All Accounts

```http
GET /api/config/accounts
```

**Authentication**: Required

**Response**: `200 OK`
```json
[
  { "id": 1, "name": "Main Account", "createdAt": "2024-01-01T00:00:00.000Z" },
  { "id": 2, "name": "Savings Account", "createdAt": "2024-01-01T00:00:00.000Z" }
]
```

#### Create Account

```http
POST /api/config/accounts
```

**Authentication**: Required (Admin only)

**Request Body**:
```json
{
  "name": "Investment Account"
}
```

**Response**: `201 Created`

**Error**: `403 Forbidden` (if not admin)

#### Delete Account

```http
DELETE /api/config/accounts/:id
```

**Authentication**: Required (Admin only)

**Response**: `204 No Content`

**Error**: `403 Forbidden` (if not admin)

---

## Error Responses

### 400 Bad Request

Validation error or invalid request data.

```json
{
  "error": "Validation Error",
  "details": [
    {
      "field": "amount",
      "message": "Amount must be a positive number"
    }
  ]
}
```

### 401 Unauthorized

Authentication required or invalid token.

```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

### 403 Forbidden

User does not have permission to access the resource (e.g., non-admin trying to access admin endpoints).

```json
{
  "error": "Forbidden",
  "message": "Admin access required"
}
```

### 404 Not Found

Resource not found or user does not have access to it.

```json
{
  "error": "Resource Not Found",
  "message": "Transaction with ID 123 not found"
}
```

**Note**: For security reasons, 404 is returned both when a resource doesn't exist and when a user tries to access another user's resource. This prevents information leakage about the existence of resources.

### 409 Conflict

Conflict with existing data (e.g., trying to delete a category with sub-categories).

```json
{
  "error": "Conflict",
  "message": "Cannot delete category with existing sub-categories"
}
```

### 429 Too Many Requests

Rate limit exceeded.

```json
{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Please try again later.",
  "retryAfter": 900
}
```

### 500 Internal Server Error

Unexpected server error.

```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

---

## Authentication

All API endpoints (except `/api/auth/register` and `/api/auth/login`) require authentication via JWT token.

### Authentication Flow

1. Register a new user or login with existing credentials
2. Receive JWT token in response
3. Include token in `Authorization` header for all subsequent requests

**Header Format**:
```
Authorization: Bearer <your-jwt-token>
```

### Authentication Endpoints

#### Register

```http
POST /api/auth/register
```

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response**: `201 Created`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "user"
  }
}
```

#### Login

```http
POST /api/auth/login
```

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response**: `200 OK`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "user"
  }
}
```

**Error**: `401 Unauthorized`
```json
{
  "error": "Authentication Failed",
  "message": "Invalid email or password"
}
```

---

## Multi-Tenant Data Isolation

The application implements strict multi-tenant data isolation to ensure users can only access their own financial data.

### How It Works

1. **User Identification**: Each authenticated request extracts the `user_id` from the JWT token
2. **Automatic Filtering**: All transaction and dashboard queries automatically filter by the authenticated user's ID
3. **Ownership Verification**: Update and delete operations verify that the resource belongs to the requesting user
4. **Shared Configuration**: Configuration data (categories, types, payment modes, accounts) is shared across all users but managed by admins

### Data Isolation Rules

- **Transactions**: Users can only view, create, update, and delete their own transactions
- **Dashboard**: Dashboard metrics and charts are calculated exclusively from the user's own transaction data
- **Configuration**: All users share the same configuration options (managed by admins)
- **User Management**: Only admins can view user lists and statistics

### Security Guarantees

- Database-level filtering with `user_id` column and foreign key constraints
- Middleware-based user context extraction from JWT tokens
- Service-layer enforcement of data isolation
- Repository-level queries that always include `user_id` filtering
- Audit logging of all data access attempts

---

## Admin-Only Endpoints

The following endpoints require admin role (`role: 'admin'` in JWT token).

### User Management

#### Get All Users

```http
GET /api/users
```

**Authentication**: Admin only

**Response**: `200 OK`
```json
[
  {
    "id": 1,
    "email": "admin@example.com",
    "role": "admin",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "transactionCount": 150,
    "lastTransactionDate": "2024-02-28T15:30:00.000Z"
  },
  {
    "id": 2,
    "email": "user@example.com",
    "role": "user",
    "createdAt": "2024-01-15T00:00:00.000Z",
    "transactionCount": 45,
    "lastTransactionDate": "2024-02-27T10:20:00.000Z"
  }
]
```

**Error**: `403 Forbidden` (if not admin)
```json
{
  "error": "Forbidden",
  "message": "Admin access required"
}
```

#### Get User Statistics

```http
GET /api/users/:id/stats
```

**Authentication**: Admin only

**Response**: `200 OK`
```json
{
  "userId": 2,
  "email": "user@example.com",
  "totalTransactions": 45,
  "totalIncome": 15000.00,
  "totalExpense": 8500.50,
  "firstTransactionDate": "2024-01-20T00:00:00.000Z",
  "lastTransactionDate": "2024-02-27T10:20:00.000Z"
}
```

**Note**: Admins can view user statistics but cannot access individual transaction details to protect user privacy.

### Configuration Management

All configuration endpoints require admin role:

- `POST /api/config/types` - Create transaction type
- `DELETE /api/config/types/:id` - Delete transaction type
- `POST /api/config/categories` - Create category
- `PUT /api/config/categories/:id` - Update category
- `DELETE /api/config/categories/:id` - Delete category
- `POST /api/config/subcategories` - Create sub-category
- `PUT /api/config/subcategories/:id` - Update sub-category
- `DELETE /api/config/subcategories/:id` - Delete sub-category
- `POST /api/config/modes` - Create payment mode
- `DELETE /api/config/modes/:id` - Delete payment mode
- `POST /api/config/accounts` - Create account
- `DELETE /api/config/accounts/:id` - Delete account

**Error**: `403 Forbidden` (if not admin)
```json
{
  "error": "Forbidden",
  "message": "Admin access required"
}
```

---

## Rate Limiting

API endpoints are protected with rate limiting to prevent abuse:

- **General endpoints**: 100 requests per 15 minutes per IP
- **Authentication endpoints**: 5 requests per 15 minutes per IP

**Error**: `429 Too Many Requests`
```json
{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Please try again later.",
  "retryAfter": 900
}
```
