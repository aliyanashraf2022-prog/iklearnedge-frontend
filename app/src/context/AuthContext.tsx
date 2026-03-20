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
  updateUser: (data: Partial<User>) => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      // FIX: Handle nested response structure
      if (response.data && response.data.user) {
        setUser(response.data.user);
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
      
      // FIX: Handle nested API response structure (response.data.data)
      const responseData = response.data || response;
      
      if (responseData.token && responseData.user) {
        localStorage.setItem('token', responseData.token);
        setUser(responseData.user);
        return true;
      } else if (responseData.data && responseData.data.token && responseData.data.user) {
        // Handle double-nested structure { data: { user, token } }
        localStorage.setItem('token', responseData.data.token);
        setUser(responseData.data.user);
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
      
      // FIX: Handle nested API response structure
      const responseData = response.data || response;
      
      if (responseData.token && responseData.user) {
        localStorage.setItem('token', responseData.token);
        setUser(responseData.user);
        return true;
      } else if (responseData.data && responseData.data.token && responseData.data.user) {
        localStorage.setItem('token', responseData.data.token);
        setUser(responseData.data.user);
        return true;
      } else {
        throw new Error('Registration failed');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Registration failed';
      setError(errorMessage);
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

  const updateUser = useCallback((data: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      // Also update stored user if you store it separately, but token is the main thing
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
      updateUser,
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