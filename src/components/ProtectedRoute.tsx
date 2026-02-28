import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loading } from './ui/loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'user' | 'admin';
}

/**
 * ProtectedRoute component that guards routes requiring authentication
 * 
 * Features:
 * - Checks authentication status before rendering children
 * - Redirects to login if not authenticated
 * - Supports role-based access control
 * - Shows loading state during auth check
 * - Preserves intended destination for post-login redirect
 * 
 * @param children - The component(s) to render if authenticated
 * @param requiredRole - Optional role requirement ('user' or 'admin')
 * 
 * Requirements addressed:
 * - 4.3: Check authentication status before rendering
 * - 5.4: Prevent access to protected routes after logout
 * - 9.4: Protect admin UI routes with role-based guards
 * - 10.1: Redirect unauthenticated users to login page
 * - 10.3: Check authentication status before rendering protected pages
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Show loading state during authentication check
  // Requirement 10.3: Display loading indicator during auth check
  if (isLoading) {
    return <Loading />;
  }

  // Redirect to login if not authenticated
  // Requirement 10.1: Redirect unauthenticated users to login page
  // Requirement 5.4: Prevent access to protected routes after logout
  if (!isAuthenticated) {
    // Save the intended destination to redirect after login
    // Requirement 10.5: Remember intended destination for post-login redirect
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access control if required
  // Requirement 9.4: Protect admin UI routes with role-based guards
  if (requiredRole && user?.role !== requiredRole) {
    // If admin role is required but user doesn't have it, redirect to unauthorized
    if (requiredRole === 'admin') {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // User is authenticated and has required role (if any), render children
  // Requirement 4.3: Check authentication status before rendering
  return <>{children}</>;
};

export default ProtectedRoute;
