# Implementation Plan

- [x] 1. Set up backend authentication infrastructure





  - Create database migration to add email and password_hash columns to users table
  - Add email index for faster lookups
  - Install required npm packages (bcrypt, jsonwebtoken, express-validator)
  - Create JWT_SECRET environment variable in backend .env
  - _Requirements: 1.3, 6.1, 6.2_

- [x] 2. Implement backend auth service





  - Create `backend/src/services/authService.ts` with password hashing functions
  - Implement JWT token generation with 7-day expiration
  - Implement JWT token verification function
  - Add bcrypt password comparison function
  - _Requirements: 1.3, 2.4, 3.1, 6.1, 6.4_

- [x] 3. Implement backend auth repository





  - Create `backend/src/repositories/authRepository.ts`
  - Implement findUserByEmail function
  - Implement createUser function with email and hashed password
  - Ensure password_hash is never returned in queries
  - _Requirements: 1.1, 2.1, 6.3_

- [x] 4. Create backend auth controller





  - Create `backend/src/controllers/authController.ts`
  - Implement register endpoint handler with email validation
  - Implement login endpoint handler with credential verification
  - Implement getCurrentUser endpoint handler
  - Add input validation using express-validator
  - _Requirements: 1.1, 1.2, 1.4, 2.1, 2.2, 2.3, 7.1, 7.2, 7.3_

- [x] 5. Implement authentication middleware





  - Create `backend/src/middleware/authMiddleware.ts`
  - Implement authenticateToken middleware to verify JWT
  - Implement authorizeRole middleware for role-based access
  - Add error handling for invalid/expired tokens
  - _Requirements: 3.4, 4.4, 8.1, 8.2, 8.3, 8.4, 9.1, 9.2_

- [x] 6. Create backend auth routes





  - Create `backend/src/routes/authRoutes.ts`
  - Add POST /api/auth/register route
  - Add POST /api/auth/login route
  - Add GET /api/auth/me route with authenticateToken middleware
  - Integrate routes into main Express app
  - _Requirements: 1.1, 2.1, 4.2_

- [x] 7. Update existing backend routes with authentication





  - Add authenticateToken middleware to all transaction routes
  - Add authenticateToken middleware to dashboard routes
  - Add authenticateToken and authorizeRole('admin') to config routes
  - Update route handlers to use req.user for user-specific data
  - _Requirements: 8.1, 8.5, 9.3_

- [x] 8. Create frontend auth service





  - Create `frontend/src/services/authService.ts`
  - Implement register API call
  - Implement login API call
  - Implement getCurrentUser API call
  - Add token storage functions (localStorage)
  - Add token retrieval for API requests
  - _Requirements: 1.4, 2.1, 4.1, 4.2, 5.1_

- [x] 9. Create frontend auth context




  - Create `frontend/src/contexts/AuthContext.tsx`
  - Implement AuthProvider with user state
  - Add login function that calls authService
  - Add register function that calls authService
  - Add logout function that clears token
  - Add checkAuth function to verify existing token
  - Add isLoading state for async operations
  - _Requirements: 2.5, 4.1, 4.2, 4.3, 5.1, 5.2, 5.3_

- [x] 10. Update API service to include auth token




  - Modify `frontend/src/services/api.ts`
  - Add Authorization header with JWT token to all requests
  - Add response interceptor to handle 401 errors
  - Redirect to login on authentication failure
  - _Requirements: 4.4, 4.5, 8.1_

- [x] 11. Create login page component








  - Create `frontend/src/pages/LoginPage.tsx`
  - Add email input field with validation
  - Add password input field with show/hide toggle
  - Add login button with loading state
  - Add link to registration page
  - Display error messages from API
  - Implement responsive design (mobile, tablet, desktop)
  - _Requirements: 2.1, 2.2, 2.3, 7.1, 7.3, 11.1, 11.2, 11.3, 11.4, 11.5_

- [x] 12. Create registration page component







  - Create `frontend/src/pages/RegisterPage.tsx`
  - Add email input field with validation
  - Add password input field with show/hide toggle
  - Add confirm password field
  - Add register button with loading state
  - Add link to login page
  - Display error messages from API
  - Implement responsive design (mobile, tablet, desktop)
  - _Requirements: 1.1, 1.2, 1.4, 1.5, 7.2, 11.1, 11.2, 11.3, 11.4, 11.5_

- [x] 13. Create protected route component





  - Create `frontend/src/components/ProtectedRoute.tsx`
  - Check authentication status before rendering
  - Redirect to login if not authenticated
  - Support role-based access control
  - Show loading state during auth check
  - _Requirements: 4.3, 5.4, 9.4, 10.1, 10.3_

- [x] 14. Update app routing with authentication





  - Modify `frontend/src/App.tsx`
  - Wrap app with AuthProvider
  - Add public routes for login and register
  - Wrap existing routes with ProtectedRoute
  - Add role check for admin routes
  - Implement redirect logic after login
  - _Requirements: 4.5, 5.5, 9.4, 9.5, 10.1, 10.2, 10.5_

- [x] 15. Add logout functionality to UI





  - Update header/navigation component
  - Add logout button for authenticated users
  - Call logout function from AuthContext
  - Redirect to login page after logout
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 16. Run database migration





  - Execute migration to add email and password_hash columns
  - Verify columns are created successfully
  - Create email index
  - Test migration rollback
  - _Requirements: 1.1, 6.1_

- [x] 17. Create seed script for admin user





  - Create script to generate initial admin account
  - Hash admin password using bcrypt
  - Insert admin user into database
  - Document admin credentials for first login
  - _Requirements: 3.1, 3.2_

- [x] 18. Add form validation





  - Implement email format validation on frontend
  - Implement password length validation (min 8 characters)
  - Add password confirmation matching
  - Show validation errors inline
  - Prevent submission with invalid data
  - _Requirements: 1.5, 6.5, 7.2_

- [x] 19. Implement error handling





  - Add try-catch blocks in all auth functions
  - Return user-friendly error messages
  - Log errors for debugging
  - Handle network errors gracefully
  - Display toast notifications for errors
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 20. Test authentication flow end-to-end




  - Test user registration with valid data
  - Test user registration with duplicate email
  - Test user login with correct credentials
  - Test user login with incorrect credentials
  - Test session persistence across page refresh
  - Test logout functionality
  - Test protected route access without auth
  - Test admin route access with user role
  - Test admin route access with admin role
  - Test responsive design on mobile, tablet, desktop
  - _Requirements: All requirements_
