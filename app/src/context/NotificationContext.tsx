import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { notificationsAPI } from '@/services/api';
import type { Notification } from '@/types';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  addNotification: (notification: Notification) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const POLL_INTERVAL = 30000;

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      setIsLoading(true);
      const [items, count] = await Promise.all([
        notificationsAPI.getAll(),
        notificationsAPI.getUnreadCount(),
      ]);

      setNotifications(items);
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    await notificationsAPI.markAsRead(id);
    setNotifications((current) => current.map((item) => (
      item.id === id ? { ...item, isRead: true } : item
    )));
    setUnreadCount((current) => Math.max(0, current - 1));
  }, []);

  const markAllAsRead = useCallback(async () => {
    await notificationsAPI.markAllAsRead();
    setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
    setUnreadCount(0);
  }, []);

  const deleteNotification = useCallback(async (id: string) => {
    const target = notifications.find((item) => item.id === id);
    await notificationsAPI.delete(id);
    setNotifications((current) => current.filter((item) => item.id !== id));
    if (target && !target.isRead) {
      setUnreadCount((current) => Math.max(0, current - 1));
    }
  }, [notifications]);

  const addNotification = useCallback((notification: Notification) => {
    setNotifications((current) => [notification, ...current]);
    if (!notification.isRead) {
      setUnreadCount((current) => current + 1);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = window.setInterval(fetchNotifications, POLL_INTERVAL);
    return () => window.clearInterval(interval);
  }, [fetchNotifications]);

  const value = useMemo<NotificationContextType>(() => ({
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification,
  }), [
    addNotification,
    deleteNotification,
    fetchNotifications,
    isLoading,
    markAllAsRead,
    markAsRead,
    notifications,
    unreadCount,
  ]);

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
