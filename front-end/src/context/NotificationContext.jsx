import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [shaking, setShaking] = useState(false);
  const prevCountRef = useRef(0);
  const intervalRef = useRef(null);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get('/notifications/my?limit=20');
      setNotifications(res.data || []);
      const unread = (res.data || []).filter(n => !n.is_read).length;
      if (unread > prevCountRef.current && prevCountRef.current !== 0) {
        setShaking(true);
        setTimeout(() => setShaking(false), 1000);
      }
      prevCountRef.current = unread;
      setUnreadCount(unread);
    } catch {}
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      intervalRef.current = setInterval(fetchNotifications, 30000);
    }
    return () => clearInterval(intervalRef.current);
  }, [user, fetchNotifications]);

  const markRead = async (id) => {
    await api.patch(`/notifications/${id}/read`);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllRead = async () => {
    await api.patch('/notifications/read-all');
    setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
    setUnreadCount(0);
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, shaking, markRead, markAllRead, fetchNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be within NotificationProvider');
  return ctx;
};

export default NotificationContext;
