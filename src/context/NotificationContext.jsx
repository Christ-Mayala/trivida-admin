/**
 * NotificationContext — Trivida Admin Panel
 * 
 * Gère les notifications temps réel via Socket.IO :
 *   - Connexion WebSocket automatique après login
 *   - Réception des notifications en temps réel
 *   - Badge de notifications non lues
 *   - Marquer comme lu / tout marquer comme lu
 */
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { api } from '../utils/api';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { token, isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);

  // ── Connexion Socket.IO ──────────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated || !token) {
      // Déconnecter si pas auth
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setConnected(false);
      return;
    }

    // Créer la connexion Socket.IO
    // En prod : se connecter au backend (Render)
    // En dev : même origine (proxy Vite)
    const SOCKET_URL = import.meta.env.VITE_API_URL || window.location.origin;
    const socket = io(SOCKET_URL, {
      auth: { token },
      path: '/admin/socket.io',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 3000,
      reconnectionAttempts: 10,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[AdminSocket] Connecté');
      setConnected(true);
      
      // Charger le compteur initial
      socket.emit('notifications:unread', (res) => {
        if (res.success) {
          setUnreadCount(res.count || 0);
          setNotifications(res.notifications || []);
        }
      });
    });

    socket.on('disconnect', () => {
      console.log('[AdminSocket] Déconnecté');
      setConnected(false);
    });

    // Réception d'une nouvelle notification
    socket.on('notification:new', (notification) => {
      setNotifications(prev => [notification, ...prev].slice(0, 50));
      setUnreadCount(prev => prev + 1);
    });

    // Mise à jour du compteur
    socket.on('notifications:count', (count) => {
      setUnreadCount(count);
    });

    // Compteur d'admins en ligne
    socket.on('admins:count', () => {});

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, token]);

  // ── Actions ──────────────────────────────────────────────────────────────

  const markAsRead = useCallback(async (notificationId) => {
    try {
      await api.patch(`/api/v1/trivida/admin/notifications/${notificationId}/read`);
      setNotifications(prev => 
        prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('[Notifications] Erreur markRead:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await api.patch('/api/v1/trivida/admin/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('[Notifications] Erreur markAllRead:', error);
    }
  }, []);

  const refreshNotifications = useCallback(async () => {
    try {
      const data = await api.get('/api/v1/trivida/admin/notifications?limit=50');
      if (data.success) {
        setNotifications(data.data.notifications || []);
        setUnreadCount(data.data.unreadCount || 0);
      }
    } catch (error) {
      console.error('[Notifications] Erreur refresh:', error);
    }
  }, []);

  const value = {
    unreadCount,
    notifications,
    connected,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

/**
 * Hook pour accéder au contexte de notifications
 */
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications doit être utilisé dans un NotificationProvider');
  }
  return context;
}
