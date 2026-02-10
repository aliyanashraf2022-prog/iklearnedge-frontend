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
      const data = await authAPI.getMe();
      if (data.user) {
        setUser(data.user);
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
      const data = await authAPI.login(credentials.email, credentials.password);
      if (data.token && data.user) {
        localStorage.setItem('token', data.token);
        setUser(data.user);
        return true;
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
      console.error('Login error:', err);
    }
    return false;
  }, []);

  const register = useCallback(async (data: RegisterData): Promise<boolean> => {
    setError(null);
    try {
      const response = await authAPI.register(data);
      if (response.token && response.user) {
        localStorage.setItem('token', response.token);
        setUser(response.user);
        return true;
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      console.error('Registration error:', err);
    }
    return false;
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
