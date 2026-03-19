import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { User, UserRole, LoginCredentials, RegisterData } from '@/types';
import { authAPI } from '@/services/api';

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  switchRole: (role: UserRole) => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Clear token on window close/unload - forces logout when browser closes
  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.removeItem('token');
      setUser(null);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserProfile();
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await authAPI.getMe();
      // Handle API response: { success, data: { user } }
      const responseData = response.data || response;
      if (responseData.user) {
        setUser(responseData.user);
      } else if (response.user) {
        setUser(response.user);
      }
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      localStorage.removeItem('token');
    } finally {
      setIsLoading(false);
    }
  };

  const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    setError(null);
    try {
      const response = await authAPI.login(credentials.email, credentials.password);
      
      // Handle API response structure: { success, data: { user, token } }
      const responseData = response.data || response;
      
      if (responseData.data?.user && responseData.data?.token) {
        localStorage.setItem('token', responseData.data.token);
        setUser(responseData.data.user);
        return true;
      } else if (responseData.user && responseData.token) {
        localStorage.setItem('token', responseData.token);
        setUser(responseData.user);
        return true;
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Login failed';
      setError(errorMessage);
      console.error('Login error:', err);
      return false;
    }
  }, []);

  const register = useCallback(async (data: RegisterData): Promise<boolean> => {
    setError(null);
    try {
      const response = await authAPI.register(data);
      
      // Handle API response structure: { success, data: { user, token } }
      const responseData = response.data || response;
      
      if (responseData.data?.user && responseData.data?.token) {
        localStorage.setItem('token', responseData.data.token);
        setUser(responseData.data.user);
        return true;
      } else if (responseData.user && responseData.token) {
        localStorage.setItem('token', responseData.token);
        setUser(responseData.user);
        return true;
      } else {
        throw new Error('Registration failed');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Registration failed';
      console.error('Registration error:', err);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
    setError(null);
  }, []);

  const switchRole = useCallback((role: UserRole) => {
    if (user) {
      setUser({ ...user, role });
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      isAuthenticated: !!user,
      isLoading,
      switchRole,
      error
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};