# Design Document

## Overview

This document outlines the technical design for implementing email and password-based authentication in the Personal Finance Management Application. The system will use JWT (JSON Web Tokens) for session management, bcrypt for password hashing, and role-based access control to differentiate between regular users and administrators.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  ┌────────────────┐  ┌──────────────┐  ┌─────────────────┐ │
│  │  Login Page    │  │ Register Page│  │  Protected      │ │
│  │                │  │              │  │  Routes         │ │
│  └────────┬───────┘  └──────┬───────┘  └────────┬────────┘ │
│           │                  │                    │          │
│  ┌────────▼──────────────────▼────────────────────▼───────┐ │
│  │           AuthContext (React Context)                  │ │
│  │  - Current user state                                  │ │
│  │  - Login/Logout functions                              │ │
│  │  - Token management                                    │ │
│  └────────────────────────┬───────────────────────────────┘ │
│                           │                                  │
│  ┌────────────────────────▼───────────────────────────────┐ │
│  │           Auth Service (API calls)                     │ │
│  └────────────────────────┬───────────────────────────────┘ │
└───────────────────────────┼──────────────────────────────────┘
                            │ HTTP/HTTPS
┌───────────────────────────▼──────────────────────────────────┐
│                     Backend (Node.js/Express)                 │
│  ┌──────────────────────────────────────────────────────────┐│
│  │              Auth Routes (/api/auth)                     ││
│  │  POST /register  │  POST /login  │  POST /logout        ││
│  └──────────────────┬───────────────────────────────────────┘│
│                     │                                          │
│  ┌──────────────────▼───────────────────────────────────────┐│
│  │              Auth Controller                             ││
│  │  - Handle registration                                   ││
│  │  - Handle login                                          ││
│  │  - Validate credentials                                  ││
│  └──────────────────┬───────────────────────────────────────┘│
│                     │                                          │
│  ┌──────────────────▼───────────────────────────────────────┐│
│  │              Auth Service                                ││
│  │  - Password hashing (bcrypt)                             ││
│  │  - JWT token generation                                  ││
│  │  - Token verification                                    ││
│  └──────────────────┬───────────────────────────────────────┘│
│                     │                                          │
│  ┌──────────────────▼───────────────────────────────────────┐│
│  │              Auth Repository                             ││
│  │  - User CRUD operations                                  ││
│  │  - Find user by email                                    ││
│  └──────────────────┬───────────────────────────────────────┘│
│                     │                                          │
│  ┌──────────────────▼───────────────────────────────────────┐│
│  │              Middleware                                  ││
│  │  - authenticateToken: Verify JWT                         ││
│  │  - authorizeRole: Check user role                        ││
│  └──────────────────────────────────────────────────────────┘│
└───────────────────────────┬──────────────────────────────────┘
                            │
┌───────────────────────────▼──────────────────────────────────┐
│                    Database (PostgreSQL)                      │
│  ┌──────────────────────────────────────────────────────────┐│
│  │  users table                                             ││
│  │  - id, email, password_hash, role, created_at, etc.      ││
│  └──────────────────────────────────────────────────────────┘│
└───────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### Backend Components

#### 1. Database Schema

**Users Table Update:**
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE NOT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255) NOT NULL;
-- role column already exists: 'user' | 'admin'
```

#### 2. Auth Controller (`backend/src/controllers/authController.ts`)

```typescript
interface RegisterRequest {
  email: string;
  password: string;
  username?: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  user: {
    id: number;
    email: string;
    username: string;
    role: 'user' | 'admin';
  };
}

class AuthController {
  async register(req: Request, res: Response): Promise<void>
  async login(req: Request, res: Response): Promise<void>
  async logout(req: Request, res: Response): Promise<void>
  async getCurrentUser(req: Request, res: Response): Promise<void>
}
```

#### 3. Auth Service (`backend/src/services/authService.ts`)

```typescript
class AuthService {
  async hashPassword(password: string): Promise<string>
  async comparePassword(password: string, hash: string): Promise<boolean>
  async generateToken(userId: number, role: string): Promise<string>
  async verifyToken(token: string): Promise<TokenPayload>
  async createUser(email: string, password: string, role: string): Promise<User>
  async findUserByEmail(email: string): Promise<User | null>
}

interface TokenPayload {
  userId: number;
  role: 'user' | 'admin';
  iat: number;
  exp: number;
}
```

#### 4. Auth Middleware (`backend/src/middleware/authMiddleware.ts`)

```typescript
// Verify JWT token and attach user to request
function authenticateToken(req: Request, res: Response, next: NextFunction): void

// Check if user has required role
function authorizeRole(...roles: string[]): RequestHandler

// Usage example:
// router.get('/admin/users', authenticateToken, authorizeRole('admin'), getUsersHandler)
```

#### 5. Auth Routes (`backend/src/routes/authRoutes.ts`)

```typescript
POST   /api/auth/register    - Register new user
POST   /api/auth/login       - Login user
POST   /api/auth/logout      - Logout user (client-side token removal)
GET    /api/auth/me          - Get current authenticated user
```

### Frontend Components

#### 1. Auth Context (`frontend/src/contexts/AuthContext.tsx`)

```typescript
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

interface User {
  id: number;
  email: string;
  username: string;
  role: 'user' | 'admin';
}
```

#### 2. Auth Service (`frontend/src/services/authService.ts`)

```typescript
class AuthService {
  async register(email: string, password: string): Promise<AuthResponse>
  async login(email: string, password: string): Promise<AuthResponse>
  logout(): void
  async getCurrentUser(): Promise<User>
  getToken(): string | null
  setToken(token: string): void
  removeToken(): void
}
```

#### 3. Login Page (`frontend/src/pages/LoginPage.tsx`)

- Email input field
- Password input field (with show/hide toggle)
- Login button
- Link to registration page
- Error message display
- Loading state
- Responsive design (mobile, tablet, desktop)

#### 4. Register Page (`frontend/src/pages/RegisterPage.tsx`)

- Email input field
- Password input field (with show/hide toggle)
- Confirm password field
- Register button
- Link to login page
- Error message display
- Loading state
- Password strength indicator
- Responsive design

#### 5. Protected Route Component (`frontend/src/components/ProtectedRoute.tsx`)

```typescript
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'user' | 'admin';
}

// Redirects to login if not authenticated
// Redirects to unauthorized if role doesn't match
```

#### 6. Route Guards

Update `App.tsx` to include:
- Public routes (login, register)
- Protected routes (dashboard, transactions, etc.)
- Admin-only routes (admin panel)

## Data Models

### User Model (Updated)

```typescript
interface User {
  id: number;
  username: string;
  email: string;              // NEW
  password_hash?: string;     // NEW (never sent to frontend)
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}
```

### DTOs

```typescript
// Registration DTO
interface RegisterDTO {
  email: string;
  password: string;
  username?: string;
}

// Login DTO
interface LoginDTO {
  email: string;
  password: string;
}

// Auth Response DTO
interface AuthResponseDTO {
  token: string;
  user: {
    id: number;
    email: string;
    username: string;
    role: 'user' | 'admin';
  };
}
```

## Error Handling

### Backend Error Responses

```typescript
// 400 Bad Request - Validation errors
{
  error: 'Validation failed',
  details: {
    email: 'Invalid email format',
    password: 'Password must be at least 8 characters'
  }
}

// 401 Unauthorized - Authentication failed
{
  error: 'Invalid email or password'
}

// 403 Forbidden - Insufficient permissions
{
  error: 'Access denied. Admin role required.'
}

// 409 Conflict - Email already exists
{
  error: 'Email already registered'
}

// 500 Internal Server Error
{
  error: 'An error occurred during authentication'
}
```

### Frontend Error Handling

- Display user-friendly error messages
- Clear form on successful submission
- Show loading states during API calls
- Handle network errors gracefully
- Redirect to login on 401 errors
- Show toast notifications for errors

## Security Considerations

### Password Security

1. **Hashing**: Use bcrypt with salt rounds = 10
2. **Minimum Length**: 8 characters
3. **No Plain Text**: Never store or log passwords
4. **Secure Transmission**: Always use HTTPS in production

### JWT Security

1. **Secret Key**: Store in environment variable (JWT_SECRET)
2. **Expiration**: 7 days
3. **Storage**: localStorage (with XSS protection)
4. **Transmission**: Authorization header: `Bearer <token>`
5. **Validation**: Verify signature and expiration on every request

### API Security

1. **Rate Limiting**: Limit login attempts (5 per minute per IP)
2. **CORS**: Configure allowed origins
3. **Input Validation**: Validate all inputs
4. **SQL Injection**: Use parameterized queries
5. **XSS Protection**: Sanitize outputs

### Session Management

1. **Token Refresh**: Implement token refresh mechanism (future enhancement)
2. **Logout**: Clear token from localStorage
3. **Concurrent Sessions**: Allow multiple sessions per user
4. **Session Timeout**: 7-day expiration

## Testing Strategy

### Backend Tests

1. **Unit Tests**:
   - Password hashing and comparison
   - JWT token generation and verification
   - Input validation

2. **Integration Tests**:
   - Registration flow
   - Login flow
   - Protected endpoint access
   - Role-based authorization

### Frontend Tests

1. **Component Tests**:
   - Login form validation
   - Register form validation
   - Error message display
   - Loading states

2. **Integration Tests**:
   - Complete login flow
   - Complete registration flow
   - Protected route access
   - Logout functionality

3. **E2E Tests**:
   - User registration and login
   - Admin login and access
   - Session persistence
   - Logout and re-login

## Responsive Design

### Mobile (< 768px)

- Single-column layout
- Full-width form inputs
- Large touch-friendly buttons (min 44px height)
- Stacked form elements
- Simplified navigation

### Tablet (768px - 1023px)

- Centered form with max-width 500px
- Comfortable spacing
- Medium-sized inputs and buttons

### Desktop (≥ 1024px)

- Centered form with max-width 400px
- Optimal spacing and padding
- Hover states for interactive elements
- Side-by-side layout for login/register links

## Implementation Notes

### Environment Variables

```env
# Backend .env
JWT_SECRET=your-secret-key-here
JWT_EXPIRATION=7d
BCRYPT_ROUNDS=10
```

### Database Migration

Create migration file: `009_add_auth_fields_to_users.ts`

```typescript
export async function up(db: Database): Promise<void> {
  await db.run(`
    ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255) NOT NULL DEFAULT '';
  `);
  
  // Create index on email for faster lookups
  await db.run(`
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  `);
}
```

### API Request/Response Flow

**Registration Flow:**
```
1. User submits email + password
2. Frontend validates input
3. POST /api/auth/register
4. Backend validates email format
5. Backend checks if email exists
6. Backend hashes password
7. Backend creates user record
8. Backend generates JWT token
9. Backend returns token + user data
10. Frontend stores token in localStorage
11. Frontend redirects to dashboard
```

**Login Flow:**
```
1. User submits email + password
2. Frontend validates input
3. POST /api/auth/login
4. Backend finds user by email
5. Backend compares password hash
6. Backend generates JWT token
7. Backend returns token + user data
8. Frontend stores token in localStorage
9. Frontend redirects to dashboard
```

**Protected Request Flow:**
```
1. Frontend makes API request
2. Frontend includes token in Authorization header
3. Backend middleware verifies token
4. Backend middleware attaches user to request
5. Backend processes request
6. Backend returns response
```

## Performance Considerations

1. **Password Hashing**: Bcrypt is intentionally slow (good for security)
2. **Token Verification**: Fast operation, minimal overhead
3. **Database Queries**: Index on email column for fast lookups
4. **Caching**: Consider caching user data in memory (future enhancement)
5. **Connection Pooling**: Use existing PostgreSQL connection pool

## Future Enhancements

1. **Password Reset**: Email-based password reset flow
2. **Email Verification**: Verify email addresses on registration
3. **Two-Factor Authentication**: Add 2FA support
4. **OAuth Integration**: Google, Facebook login
5. **Remember Me**: Extended session duration option
6. **Account Lockout**: Lock account after failed login attempts
7. **Password History**: Prevent password reuse
8. **Session Management**: View and revoke active sessions

## Dependencies

### Backend
- `bcrypt`: ^5.1.1 (password hashing)
- `jsonwebtoken`: ^9.0.2 (JWT tokens)
- `express-validator`: ^7.0.1 (input validation)

### Frontend
- `react-router-dom`: ^6.x (routing)
- Existing UI components (Button, Input, Card, etc.)

## Deployment Considerations

1. **Environment Variables**: Ensure JWT_SECRET is set in production
2. **HTTPS**: Enforce HTTPS in production
3. **CORS**: Configure allowed origins
4. **Database Migration**: Run migration before deployment
5. **Seed Admin User**: Create initial admin account
6. **Monitoring**: Log authentication attempts and failures
7. **Backup**: Regular database backups

## Rollback Plan

1. Keep existing user table structure
2. New columns are additive (won't break existing code)
3. Can disable auth routes if issues arise
4. Database migration includes down() function
5. Frontend can be rolled back independently

## Success Criteria

1. Users can register with email and password
2. Users can login with credentials
3. JWT tokens are generated and validated correctly
4. Protected routes require authentication
5. Admin routes require admin role
6. Passwords are securely hashed
7. Sessions persist across page refreshes
8. Logout clears authentication state
9. Error messages are user-friendly
10. UI is responsive on all devices
11. All tests pass
12. No security vulnerabilities
