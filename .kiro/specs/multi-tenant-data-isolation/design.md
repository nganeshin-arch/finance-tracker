# Multi-Tenant Data Isolation - Design Document

## Overview

This document outlines the design for implementing multi-tenant data isolation in the Personal Finance Tracker application. The design ensures that each user can only access their own financial data while sharing common configuration managed by administrators.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (React)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Dashboard  │  │ Transactions │  │ Admin Panel  │ │
│  │   (User)     │  │   (User)     │  │   (Admin)    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  API Layer (Express)                     │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Authentication Middleware                 │  │
│  │         (Extract user_id from JWT)                │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Transaction  │  │    Config    │  │     User     │ │
│  │  Controller  │  │  Controller  │  │  Controller  │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                 Service Layer (Business Logic)           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Transaction  │  │    Config    │  │     User     │ │
│  │   Service    │  │   Service    │  │   Service    │ │
│  │ (User Filter)│  │  (Shared)    │  │  (Admin)     │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              Repository Layer (Data Access)              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Transaction  │  │    Config    │  │     User     │ │
│  │  Repository  │  │  Repository  │  │  Repository  │ │
│  │ (+ user_id)  │  │  (Global)    │  │  (Admin)     │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  Database (PostgreSQL)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ transactions │  │  categories  │  │    users     │ │
│  │ + user_id    │  │   (shared)   │  │              │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User Authentication**: User logs in → JWT token issued with user_id
2. **API Request**: Frontend sends request with JWT token
3. **Middleware**: Extracts user_id from token, attaches to request
4. **Service Layer**: Applies user_id filter to all queries
5. **Database**: Returns only user-specific data
6. **Response**: Frontend displays user's own data

---

## Components and Interfaces

### 1. Database Schema Changes

#### Add user_id to transactions table

```sql
-- Migration: Add user_id column
ALTER TABLE transactions 
ADD COLUMN user_id INTEGER NOT NULL REFERENCES users(id);

-- Create index for performance
CREATE INDEX idx_transactions_user_id ON transactions(user_id);

-- Migrate existing data (assign to admin or first user)
UPDATE transactions 
SET user_id = (SELECT id FROM users WHERE role = 'admin' LIMIT 1)
WHERE user_id IS NULL;
```

#### Users table (already exists)

```sql
-- No changes needed, already has:
-- id, email, password_hash, role, created_at, updated_at
```

#### Configuration tables (no changes)

```sql
-- These remain global/shared:
-- transaction_types
-- categories
-- sub_categories
-- payment_modes
-- accounts
```

---

### 2. Backend Middleware

#### User Context Middleware

```typescript
// backend/src/middleware/userContext.ts

export interface UserContext {
  userId: number;
  email: string;
  role: 'user' | 'admin';
}

export const attachUserContext = (req: Request, res: Response, next: NextFunction) => {
  // Extract user info from JWT (already done by authMiddleware)
  const user = req.user; // Set by authMiddleware
  
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // Attach user context to request
  req.userContext = {
    userId: user.id,
    email: user.email,
    role: user.role
  };
  
  next();
};
```

---

### 3. Repository Layer Updates

#### Transaction Repository

```typescript
// backend/src/repositories/transactionRepository.ts

export class TransactionRepository {
  // Get transactions for specific user
  async findByUserId(userId: number, filters?: TransactionFilters): Promise<Transaction[]> {
    const query = `
      SELECT t.* 
      FROM transactions t
      WHERE t.user_id = $1
      ${filters ? this.buildFilterClause(filters) : ''}
      ORDER BY t.date DESC, t.id DESC
    `;
    
    const result = await pool.query(query, [userId, ...this.buildFilterParams(filters)]);
    return result.rows;
  }
  
  // Create transaction with user_id
  async create(userId: number, data: CreateTransactionDTO): Promise<Transaction> {
    const query = `
      INSERT INTO transactions (
        user_id, transaction_type_id, category_id, sub_category_id,
        account_id, payment_mode_id, amount, date, description
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    
    const values = [
      userId,
      data.transaction_type_id,
      data.category_id,
      data.sub_category_id,
      data.account_id,
      data.payment_mode_id,
      data.amount,
      data.date,
      data.description
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }
  
  // Update transaction (with user_id check)
  async update(userId: number, id: number, data: UpdateTransactionDTO): Promise<Transaction> {
    // First verify ownership
    const existing = await this.findById(id);
    if (!existing || existing.user_id !== userId) {
      throw new Error('Transaction not found or access denied');
    }
    
    // Proceed with update
    const query = `
      UPDATE transactions 
      SET transaction_type_id = $1, category_id = $2, ...
      WHERE id = $3 AND user_id = $4
      RETURNING *
    `;
    
    const result = await pool.query(query, [...values, id, userId]);
    return result.rows[0];
  }
  
  // Delete transaction (with user_id check)
  async delete(userId: number, id: number): Promise<boolean> {
    const query = `
      DELETE FROM transactions 
      WHERE id = $1 AND user_id = $2
    `;
    
    const result = await pool.query(query, [id, userId]);
    return result.rowCount > 0;
  }
}
```

#### Dashboard Repository

```typescript
// backend/src/repositories/dashboardRepository.ts

export class DashboardRepository {
  // Get summary for specific user
  async getSummary(userId: number, startDate: Date, endDate: Date): Promise<DashboardSummary> {
    const query = `
      SELECT 
        SUM(CASE WHEN tt.type = 'income' THEN t.amount ELSE 0 END) as total_income,
        SUM(CASE WHEN tt.type = 'expense' THEN t.amount ELSE 0 END) as total_expense,
        COUNT(*) as transaction_count
      FROM transactions t
      JOIN transaction_types tt ON t.transaction_type_id = tt.id
      WHERE t.user_id = $1 
        AND t.date BETWEEN $2 AND $3
    `;
    
    const result = await pool.query(query, [userId, startDate, endDate]);
    return result.rows[0];
  }
  
  // Get category breakdown for specific user
  async getCategoryBreakdown(userId: number, type: 'income' | 'expense'): Promise<CategoryBreakdown[]> {
    const query = `
      SELECT 
        c.name as category,
        SUM(t.amount) as total
      FROM transactions t
      JOIN transaction_types tt ON t.transaction_type_id = tt.id
      JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = $1 AND tt.type = $2
      GROUP BY c.id, c.name
      ORDER BY total DESC
    `;
    
    const result = await pool.query(query, [userId, type]);
    return result.rows;
  }
}
```

---

### 4. Service Layer Updates

#### Transaction Service

```typescript
// backend/src/services/transactionService.ts

export class TransactionService {
  constructor(private repository: TransactionRepository) {}
  
  async getTransactions(userId: number, filters?: TransactionFilters): Promise<Transaction[]> {
    return this.repository.findByUserId(userId, filters);
  }
  
  async createTransaction(userId: number, data: CreateTransactionDTO): Promise<Transaction> {
    // Validate configuration items exist
    await this.validateConfigurationItems(data);
    
    // Create with user_id
    return this.repository.create(userId, data);
  }
  
  async updateTransaction(userId: number, id: number, data: UpdateTransactionDTO): Promise<Transaction> {
    // Validate configuration items exist
    await this.validateConfigurationItems(data);
    
    // Update with user_id check
    return this.repository.update(userId, id, data);
  }
  
  async deleteTransaction(userId: number, id: number): Promise<boolean> {
    return this.repository.delete(userId, id);
  }
  
  private async validateConfigurationItems(data: any): Promise<void> {
    // Validate that referenced config items exist
    // This ensures data integrity
  }
}
```

---

### 5. Controller Layer Updates

#### Transaction Controller

```typescript
// backend/src/controllers/transactionController.ts

export class TransactionController {
  constructor(private service: TransactionService) {}
  
  async getTransactions(req: Request, res: Response) {
    try {
      const userId = req.userContext.userId; // From middleware
      const filters = this.parseFilters(req.query);
      
      const transactions = await this.service.getTransactions(userId, filters);
      
      res.json({ transactions });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  
  async createTransaction(req: Request, res: Response) {
    try {
      const userId = req.userContext.userId; // From middleware
      const data = req.body;
      
      const transaction = await this.service.createTransaction(userId, data);
      
      res.status(201).json({ transaction });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
  
  async updateTransaction(req: Request, res: Response) {
    try {
      const userId = req.userContext.userId; // From middleware
      const id = parseInt(req.params.id);
      const data = req.body;
      
      const transaction = await this.service.updateTransaction(userId, id, data);
      
      res.json({ transaction });
    } catch (error) {
      if (error.message.includes('not found') || error.message.includes('access denied')) {
        res.status(404).json({ error: 'Transaction not found' });
      } else {
        res.status(400).json({ error: error.message });
      }
    }
  }
  
  async deleteTransaction(req: Request, res: Response) {
    try {
      const userId = req.userContext.userId; // From middleware
      const id = parseInt(req.params.id);
      
      const deleted = await this.service.deleteTransaction(userId, id);
      
      if (!deleted) {
        return res.status(404).json({ error: 'Transaction not found' });
      }
      
      res.json({ message: 'Transaction deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}
```

---

### 6. Admin User Management

#### User Repository

```typescript
// backend/src/repositories/userRepository.ts

export class UserRepository {
  // Get all users (admin only)
  async findAll(): Promise<UserSummary[]> {
    const query = `
      SELECT 
        u.id,
        u.email,
        u.role,
        u.created_at,
        COUNT(t.id) as transaction_count,
        MAX(t.created_at) as last_transaction_date
      FROM users u
      LEFT JOIN transactions t ON u.id = t.user_id
      GROUP BY u.id, u.email, u.role, u.created_at
      ORDER BY u.created_at DESC
    `;
    
    const result = await pool.query(query);
    return result.rows;
  }
  
  // Get user statistics (admin only)
  async getUserStats(userId: number): Promise<UserStats> {
    const query = `
      SELECT 
        COUNT(*) as total_transactions,
        SUM(CASE WHEN tt.type = 'income' THEN t.amount ELSE 0 END) as total_income,
        SUM(CASE WHEN tt.type = 'expense' THEN t.amount ELSE 0 END) as total_expense,
        MIN(t.date) as first_transaction_date,
        MAX(t.date) as last_transaction_date
      FROM transactions t
      JOIN transaction_types tt ON t.transaction_type_id = tt.id
      WHERE t.user_id = $1
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }
}
```

---

## Data Models

### Updated Transaction Model

```typescript
export interface Transaction {
  id: number;
  user_id: number; // NEW: Links transaction to user
  transaction_type_id: number;
  category_id: number;
  sub_category_id: number | null;
  account_id: number;
  payment_mode_id: number;
  amount: number;
  date: Date;
  description: string | null;
  created_at: Date;
  updated_at: Date;
}
```

### User Summary Model (Admin)

```typescript
export interface UserSummary {
  id: number;
  email: string;
  role: 'user' | 'admin';
  created_at: Date;
  transaction_count: number;
  last_transaction_date: Date | null;
}
```

---

## Error Handling

### Authorization Errors

```typescript
// When user tries to access another user's data
{
  status: 403,
  error: 'Forbidden',
  message: 'You do not have permission to access this resource'
}
```

### Not Found Errors

```typescript
// When transaction doesn't exist or doesn't belong to user
{
  status: 404,
  error: 'Not Found',
  message: 'Transaction not found'
}
```

---

## Testing Strategy

### Unit Tests

1. **Repository Tests**: Verify user_id filtering in all queries
2. **Service Tests**: Verify user_id is passed correctly
3. **Controller Tests**: Verify user_id is extracted from request

### Integration Tests

1. **API Tests**: Verify users can only access their own data
2. **Cross-User Tests**: Verify users cannot access other users' data
3. **Admin Tests**: Verify admins can manage configuration but not see user transactions

### E2E Tests

1. **User Flow**: Register → Create transactions → View dashboard
2. **Isolation Test**: Two users create transactions, verify they don't see each other's data
3. **Admin Flow**: Admin creates config → Users use config in transactions

---

## Performance Considerations

### Database Indexes

```sql
-- Primary index on user_id for fast filtering
CREATE INDEX idx_transactions_user_id ON transactions(user_id);

-- Composite index for common queries
CREATE INDEX idx_transactions_user_date ON transactions(user_id, date DESC);

-- Index for dashboard queries
CREATE INDEX idx_transactions_user_type_date ON transactions(user_id, transaction_type_id, date);
```

### Query Optimization

- Always include `user_id` in WHERE clause
- Use indexed columns in JOIN conditions
- Limit result sets with pagination
- Cache configuration data (shared across users)

---

## Security Considerations

### Defense in Depth

1. **JWT Token**: Contains user_id, verified by middleware
2. **Middleware**: Extracts and validates user_id
3. **Service Layer**: Applies user_id filter to all operations
4. **Repository Layer**: Includes user_id in all SQL queries
5. **Database**: Foreign key constraints ensure data integrity

### Audit Logging

```typescript
// Log all data access attempts
logger.info('Transaction access', {
  userId: req.userContext.userId,
  transactionId: req.params.id,
  action: 'read',
  timestamp: new Date()
});
```

---

## Migration Strategy

### Phase 1: Database Migration

1. Add `user_id` column to transactions table
2. Create indexes
3. Migrate existing data (assign to admin)
4. Add foreign key constraint

### Phase 2: Backend Updates

1. Update repositories to include user_id filtering
2. Update services to pass user_id
3. Update controllers to extract user_id from request
4. Add middleware for user context

### Phase 3: Frontend Updates

1. No changes needed (JWT already contains user_id)
2. Verify API responses only contain user's data
3. Update admin panel to show user management

### Phase 4: Testing & Deployment

1. Run all tests
2. Deploy to staging
3. Verify data isolation
4. Deploy to production

---

## Summary

This design implements comprehensive multi-tenant data isolation through:

- **Database-level filtering** with user_id column
- **Middleware-based user context** extraction
- **Service-layer enforcement** of data isolation
- **Repository-level queries** that always filter by user_id
- **Admin configuration management** for shared data
- **Performance optimization** through indexing
- **Security through defense in depth**

The implementation ensures that each user can only access their own financial data while sharing common configuration managed by administrators.
