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
  withCredentials: true,
});

// Instance upload — pour les FormData avec images/fichiers
export const apiUpload = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
  withCredentials: true,
  // ⚠️ Supprimé : Ne pas forcer 'Content-Type': 'multipart/form-data' en dur 
  // pour laisser Axios calculer automatiquement le boundary du FormData.
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

      if (error.code === 'ECONNABORTED') {
        console.error('⏱️ Timeout — Le serveur met trop de temps à répondre.');
        return Promise.reject(error);
      }
      if (!error.response) {
        console.error('🔌 Erreur réseau — Vérifiez que le serveur tourne sur l\'IP :', BASE_URL);
        return Promise.reject(error);
      }

      if (error.response.status === 404) {
        return Promise.reject(error);
      }

      if (error.response.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/refresh')) {
        
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
          
          const refreshResponse = await axios.post(`${BASE_URL}/auth/refresh`, {}, { withCredentials: true });
          const { token: newAccessToken } = refreshResponse.data;

          if (newAccessToken) {
            await AsyncStorage.setItem('userToken', newAccessToken);
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            processQueue(null, newAccessToken);
            return axiosInstance(originalRequest);
          }
        } catch (refreshError) {
          processQueue(refreshError, null);
          console.error("🚨 Échec critique du Refresh Token. Session expirée.");
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

setupResponseInterceptors(api);
setupResponseInterceptors(apiUpload);

export default api;