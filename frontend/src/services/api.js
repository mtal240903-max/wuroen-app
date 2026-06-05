import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../api/apiConfig';

// ─────────────────────────────────────────────────────────────
// 1. CONFIGURATION DES INSTANCES
// ─────────────────────────────────────────────────────────────

// Instance standard — requêtes JSON normales
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  withCredentials: true, // 👈 REQUIS : Permet d'envoyer le Refresh Token stocké dans les cookies au backend
});

// Instance upload — pour les FormData avec images/fichiers
export const apiUpload = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
  withCredentials: true,
  headers: {
    'Content-Type': 'multipart/form-data', // 👈 REQUIS : Force le format multipart pour Multer
  },
});

// ─────────────────────────────────────────────────────────────
// 2. INJECTEUR DE TOKEN INTERNE (REQUEST)
// ─────────────────────────────────────────────────────────────
const injectToken = async (config) => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    console.error("❌ Impossible de lire le token depuis le stockage local", err);
  }
  return config;
};

api.interceptors.request.use(injectToken, (e) => Promise.reject(e));
apiUpload.interceptors.request.use(injectToken, (e) => Promise.reject(e));

// ─────────────────────────────────────────────────────────────
// 3. SYNC AUTOMATIQUE REFRESH & FILE D'ATTENTE SÉCURISÉE
// ─────────────────────────────────────────────────────────────
let isRefreshing = false;
let failedQueue = [];

// Fonction pour traiter la file d'attente des requêtes suspendues
const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const setupResponseInterceptors = (axiosInstance) => {
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // ⏱️ Cas de Timeout ou coupure réseau pure
      if (error.code === 'ECONNABORTED') {
        console.error('⏱️ Timeout — Le serveur met trop de temps à répondre.');
        return Promise.reject(error);
      }
      if (!error.response) {
        console.error('🔌 Erreur réseau — Vérifiez que le serveur tourne sur l\'IP :', BASE_URL);
        return Promise.reject(error);
      }

      // 🔍 Sécurité anti-boucle : Si c'est un 404, on ne tente rien et on éjecte tout de suite
      if (error.response.status === 404) {
        return Promise.reject(error);
      }

      // 🔒 Gestion de l'expiration du Token (401 Unauthorized)
      if (error.response.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/refresh')) {
        
        // Si un rafraîchissement est déjà en cours, on met la requête suivante dans la file d'attente
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return axiosInstance(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          console.log("🔄 Access Token expiré. Tentative de rafraîchissement unique...");
          
          // Appel de ta route de refresh backend (qui lit le cookie HTTP-only)
          const refreshResponse = await axios.post(`${BASE_URL}/auth/refresh`, {}, { withCredentials: true });
          const { token: newAccessToken } = refreshResponse.data;

          if (newAccessToken) {
            // Sauvegarde du nouveau token pour les prochaines requêtes
            await AsyncStorage.setItem('userToken', newAccessToken);
            
            // Mise à jour de la requête actuelle
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            
            // Libération de toutes les requêtes en attente avec le nouveau token
            processQueue(null, newAccessToken);
            
            return axiosInstance(originalRequest);
          }
        } catch (refreshError) {
          // En cas d'échec critique, on rejette toute la file d'attente
          processQueue(refreshError, null);
          console.error("🚨 Échec critique du Refresh Token. Session expirée.");
          
          // Déconnexion forcée de l'utilisateur de l'application
          await AsyncStorage.multiRemove(['userToken', 'userRole']);
          
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );
};

// Application des intercepteurs de réponse aux deux instances
setupResponseInterceptors(api);
setupResponseInterceptors(apiUpload);

export default api;