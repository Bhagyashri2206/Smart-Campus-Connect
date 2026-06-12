import { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext(null);
const TOAST_DURATION_MS = 5000;

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [toasts, setToasts] = useState([]);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    const item = { id, ...notification, read: false, createdAt: new Date() };
    setNotifications((prev) => [item, ...prev].slice(0, 50));

    const toast = { id, type: notification.type, title: notification.title, body: notification.body };
    setToasts((prev) => [...prev, toast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, TOAST_DURATION_MS);

    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification(notification.title, { body: notification.body, icon: '/vite.svg' });
    }

    return id;
  }, []);

  const markAsRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, toasts, addNotification, markAsRead, markAllAsRead, dismissToast }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}
