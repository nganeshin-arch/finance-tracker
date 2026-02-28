import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authService, { User, AuthResponse } from '../services/authService';

// Auth context type definition
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username?: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

// Create context with undefined default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider props
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider component that manages authentication state
 * Provides login, register, logout, and checkAuth functions to child components
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  /**
   * Check if user is authenticated by verifying existing token
   * Called on app initialization and after login/register
   */
  const checkAuth = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Check if token exists
      const token = authService.getToken();
      if (!token) {
        setUser(null);
        return;
      }

      // Verify token by fetching current user
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      // Token is invalid or expired, clear it
      console.error('[AuthContext] Error checking authentication:', error);
      authService.removeToken();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Login user with email and password
   * @param email - User's email address
   * @param password - User's password
   * @throws Error if login fails
   */
  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      const response: AuthResponse = await authService.login(email, password);
      setUser(response.user);
    } catch (error) {
      console.error('[AuthContext] Login error:', error);
      // Re-throw error to be handled by the component
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Register new user with email and password
   * @param email - User's email address
   * @param password - User's password
   * @param username - Optional username
   * @throws Error if registration fails
   */
  const register = async (email: string, password: string, username?: string): Promise<void> => {
    try {
      setIsLoading(true);
      const response: AuthResponse = await authService.register(email, password, username);
      setUser(response.user);
    } catch (error) {
      console.error('[AuthContext] Registration error:', error);
      // Re-throw error to be handled by the component
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout current user
   * Clears token from localStorage and resets user state
   */
  const logout = (): void => {
    authService.logout();
    setUser(null);
  };

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Compute isAuthenticated based on user state
  const isAuthenticated = user !== null;

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to use auth context
 * @returns AuthContextType
 * @throws Error if used outside of AuthProvider
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
