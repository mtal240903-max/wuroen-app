import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userToken, setUserToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // --- ÉTATS POUR LES NOTIFICATIONS ---
  const [unreadCount, setUnreadCount] = useState(0); 
  const [collabCount, setCollabCount] = useState(0); 

  const API_BASE_URL = "https://wuroen-api.onrender.com/api";

  useEffect(() => {
    loadStorageData();
  }, []);

  // Synchronisation automatique toutes les 30 secondes
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
      console.error("Erreur de chargement du stockage local", e);
    } finally {
      setIsLoading(false);
    }
  };

  // --- FONCTION GLOBALE DE MISE À JOUR ---
  const updateAllNotifications = () => {
    updateUnreadCount();
    updateCollabCount();
  };

  // 1. Compteur de Messages (Inbox)
  const updateUnreadCount = async () => {
    if (!userToken) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/messages/inbox`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      // Somme des messages non lus dans chaque conversation
      const total = res.data.reduce((acc, chat) => acc + (chat.unreadCount || 0), 0);
      setUnreadCount(total);
    } catch (err) {
      console.log("Erreur notifications messages");
    }
  };

  // 2. Compteur de Collaborations (Optimisé)
  const updateCollabCount = async () => {
    if (!userToken) return;
    try {
      // ✅ On utilise la route /count (plus rapide et consomme moins de data)
      const res = await axios.get(`${API_BASE_URL}/collaborations/count`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      
      setCollabCount(res.data.count || 0);
    } catch (err) {
      console.log("Erreur notifications collaborations");
    }
  };

  const login = async (token, userData) => {
    try {
      setIsLoading(true);
      setUserToken(token);
      setUser(userData);
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      // Optionnel : Déclencher une mise à jour immédiate après login
      updateAllNotifications();
    } catch (e) {
      console.error("Erreur login", e);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setUserToken(null);
      setUser(null);
      setUnreadCount(0);
      setCollabCount(0);
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
    } catch (e) {
      console.error("Erreur déconnexion", e);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      userToken, 
      isLoading, 
      unreadCount, 
      collabCount, 
      updateUnreadCount,
      updateCollabCount, 
      updateAllNotifications,
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};