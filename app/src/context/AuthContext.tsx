import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authAPI } from '@/services/api';
import type { LoginCredentials, RegisterData, User, UserRole } from '@/types';

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

  const hydrateUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setUser(null);
        return;
      }

      const currentUser = await authAPI.getMe();
      setUser(currentUser);
    } catch (err) {
      console.error('Failed to hydrate user:', err);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    hydrateUser();
  }, [hydrateUser]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setError(null);
    try {
      const { user: authenticatedUser, token } = await authAPI.login(credentials.email, credentials.password);
      localStorage.setItem('token', token);
      setUser(authenticatedUser);
      return true;
    } catch (err: any) {
      setError(err.message || 'Login failed');
      return false;
    }
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    setError(null);
    try {
      const { user: registeredUser, token } = await authAPI.register(data);
      localStorage.setItem('token', token);
      setUser(registeredUser);
      return true;
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
    setError(null);
  }, []);

  const switchRole = useCallback((role: UserRole) => {
    setUser((current) => current ? { ...current, role } : current);
  }, []);

  const updateUser = useCallback((data: Partial<User>) => {
    setUser((current) => current ? { ...current, ...data } : current);
  }, []);

  const value = useMemo<AuthContextType>(() => ({
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isLoading,
    switchRole,
    updateUser,
    error,
  }), [error, isLoading, login, logout, register, switchRole, updateUser, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
