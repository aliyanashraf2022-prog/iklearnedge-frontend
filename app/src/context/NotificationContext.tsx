import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { notificationsAPI } from '@/services/api';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
  addNotification: (notification: Notification) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const POLL_INTERVAL = 30000; // 30 seconds

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const lastFetchRef = useRef<number>(0);

  const fetchNotifications = useCallback(async () => {
    const now = Date.now();
    if (now - lastFetchRef.current < 5000) return;
    lastFetchRef.current = now;

    try {
      setIsLoading(true);
      const res = await notificationsAPI.getAll();
      if (res && res.success) {
        setNotifications(res.data || []);
        const unread = (res.data || []).filter((n: Notification) => !n.is_read).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (id: number) => {
    try {
      await notificationsAPI.markAsRead(String(id));
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  }, []);

  const deleteNotification = useCallback(async (id: number) => {
    try {
      await notificationsAPI.delete(String(id));
      const notification = notifications.find(n => n.id === id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      if (notification && !notification.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  }, [notifications]);

  const addNotification = useCallback((notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
    if (!notification.is_read) {
      setUnreadCount(prev => prev + 1);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchNotifications();
      
      const interval = setInterval(() => {
        const hasToken = localStorage.getItem('token');
        if (hasToken) {
          fetchNotifications();
        }
      }, POLL_INTERVAL);

      return () => clearInterval(interval);
    }
  }, [fetchNotifications]);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      isLoading,
      fetchNotifications,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      addNotification
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
