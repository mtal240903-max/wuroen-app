import React, { createContext, useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import io from 'socket.io-client';
import { BASE_URL } from '../api/apiConfig';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userToken, setUserToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [unreadCount, setUnreadCount] = useState(0); 
  const [collabCount, setCollabCount] = useState(0); 
  
  const socketRef = useRef(null);

  // --- GESTION DU SOCKET ---
  useEffect(() => {
    if (userToken && user?._id) {
      socketRef.current = io(BASE_URL, {
        auth: { token: userToken },
        transports: ['websocket'],
      });

      socketRef.current.on('connect', () => {
        socketRef.current.emit('join', user._id);
        if (user?.groups && Array.isArray(user.groups)) {
          user.groups.forEach(groupId => socketRef.current.emit('join_group', groupId));
        }
      });

      // Écoute des événements temps réel pour rafraîchir les badges
      socketRef.current.on('new_notification', () => updateAllNotifications());
      socketRef.current.on('new_group_message', () => updateUnreadCount());
      socketRef.current.on('new_private_message', () => updateUnreadCount());

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
          socketRef.current = null;
        }
      };
    }
  }, [userToken, user?._id]);

  // --- CHARGEMENT INITIAL ---
  useEffect(() => {
    loadStorageData();
  }, []);

  // --- MISE À JOUR PÉRIODIQUE ---
  useEffect(() => {
    if (userToken) {
      updateAllNotifications();
      const interval = setInterval(updateAllNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [userToken]);

  const loadStorageData = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const savedUser = await AsyncStorage.getItem('userData');
      if (token && savedUser) {
        setUserToken(token);
        setUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error("Erreur chargement storage", e);
    } finally {
      setIsLoading(false);
    }
  };

  const updateAllNotifications = () => {
    updateUnreadCount();
    updateCollabCount();
  };

  const updateUnreadCount = async () => {
    if (!userToken) return;
    try {
      // On récupère le total des messages non lus (Privés + Groupes)
      // Assurez-vous que votre backend gère ces deux routes
      const [inboxRes, groupsRes] = await Promise.all([
        api.get('/messages/inbox').catch(() => ({ data: [] })),
        api.get('/groups/unread-count').catch(() => ({ data: { count: 0 } }))
      ]);

      const privateUnread = inboxRes.data.reduce((acc, chat) => acc + (chat.unreadCount || 0), 0);
      const groupUnread = groupsRes.data.count || 0;

      setUnreadCount(privateUnread + groupUnread);
    } catch (err) {
      console.log("Erreur mise à jour badges :", err.message);
    }
  };

  const updateCollabCount = async () => {
    if (!userToken) return;
    try {
      const res = await api.get('/collaborations/count');
      setCollabCount(res.data.count || 0);
    } catch (err) {
      console.log("Flux collaborations : Serveur non joignable");
    }
  };

  const login = async (token, userData) => {
    try {
      setIsLoading(true);
      setUserToken(token);
      setUser(userData);
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      updateAllNotifications();
    } catch (e) {
      console.error("Erreur login", e);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setUserToken(null);
    setUser(null);
    setUnreadCount(0);
    setCollabCount(0);
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userData');
  };

  return (
    <AuthContext.Provider value={{ 
      user, userToken, isLoading, unreadCount, collabCount, 
      updateUnreadCount, updateCollabCount, updateAllNotifications,
      login, logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};