import api from './api';

// Token storage key
const TOKEN_KEY = 'authToken';

// Auth response interface
export interface AuthResponse {
  token: string;
  user: {
    id: number;
    email: string;
    username: string;
    role: 'user' | 'admin';
  };
}

// User interface
export interface User {
  id: number;
  email: string;
  username: string;
  role: 'user' | 'admin';
}

// Registration request interface
export interface RegisterRequest {
  email: string;
  password: string;
  username?: string;
}

// Login request interface
export interface LoginRequest {
  email: string;
  password: string;
}

class AuthService {
  /**
   * Register a new user
   * @param email - User's email address
   * @param password - User's password
   * @param username - Optional username
   * @returns Promise with auth response containing token and user data
   */
  async register(email: string, password: string, username?: string): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/register', {
        email,
        password,
        username,
      });
      
      // Store token in localStorage
      if (response.data.token) {
        this.setToken(response.data.token);
      }
      
      return response.data;
    } catch (error) {
      console.error('[AuthService] Registration failed:', error);
      throw error;
    }
  }

  /**
   * Login an existing user
   * @param email - User's email address
   * @param password - User's password
   * @returns Promise with auth response containing token and user data
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/login', {
        email,
        password,
      });
      
      // Store token in localStorage
      if (response.data.token) {
        this.setToken(response.data.token);
      }
      
      return response.data;
    } catch (error) {
      console.error('[AuthService] Login failed:', error);
      throw error;
    }
  }

  /**
   * Get current authenticated user
   * @returns Promise with current user data
   */
  async getCurrentUser(): Promise<User> {
    try {
      const response = await api.get<User>('/auth/me');
      return response.data;
    } catch (error) {
      console.error('[AuthService] Failed to get current user:', error);
      throw error;
    }
  }

  /**
   * Logout the current user
   * Removes token from localStorage
   */
  logout(): void {
    this.removeToken();
  }

  /**
   * Get JWT token from localStorage
   * @returns Token string or null if not found
   */
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  /**
   * Store JWT token in localStorage
   * @param token - JWT token to store
   */
  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  /**
   * Remove JWT token from localStorage
   */
  removeToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  }

  /**
   * Check if user is authenticated
   * @returns True if token exists in localStorage
   */
  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }
}

// Export singleton instance
const authService = new AuthService();
export default authService;
