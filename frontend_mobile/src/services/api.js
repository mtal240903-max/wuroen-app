import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../api/apiConfig';

// ─────────────────────────────────────────────────────────────
// 1. CONFIGURATION DES INSTANCES AXIOS
// ─────────────────────────────────────────────────────────────

// Instance standard — Utilisée pour les requêtes JSON classiques (GET, POST, etc.)
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000, // 15 secondes avant l'expiration de la requête
  withCredentials: true,
});

// Instance upload — Dédiée aux envois de fichiers lourds / FormData (images, documents)
export const apiUpload = axios.create({
  baseURL: BASE_URL,
  timeout: 60000, // 60 secondes pour laisser le temps aux fichiers de s'uploader
  withCredentials: true,
  // ⚠️ Important : Ne pas forcer 'Content-Type': 'multipart/form-data' en dur 
  // pour laisser Axios calculer automatiquement le "boundary" du FormData.
});

// ─────────────────────────────────────────────────────────────
// 2. INJECTEUR DE TOKEN INTERNE (INTERCEPTEUR DE REQUÊTE)
// ─────────────────────────────────────────────────────────────
const injectToken = async (config) => {
  try {
    // Récupération du token d'accès stocké localement sur l'appareil
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      // Injection automatique du token dans l'en-tête (Header) de chaque requête sortante
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    console.error("❌ Impossible de lire le token depuis le stockage local", err);
  }
  return config;
};

// Application de l'injecteur sur les deux instances (api et apiUpload)
api.interceptors.request.use(injectToken, (e) => Promise.reject(e));
apiUpload.interceptors.request.use(injectToken, (e) => Promise.reject(e));

// ─────────────────────────────────────────────────────────────
// 3. SYNCHRONISATION AUTOMATIQUE & FILE D'ATTENTE (REFRESH TOKEN)
// ─────────────────────────────────────────────────────────────
let isRefreshing = false; // Verrou pour éviter de lancer plusieurs rafraîchissements en même temps
let failedQueue = [];   // File d'attente pour stocker les requêtes échouées pendant le rafraîchissement

// Fonction pour vider la file d'attente une fois le nouveau token obtenu (ou en cas d'erreur)
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

// Configuration mutualisée des intercepteurs de réponse pour gérer les erreurs et l'expiration du token (401)
const setupResponseInterceptors = (axiosInstance) => {
  axiosInstance.interceptors.response.use(
    (response) => response, // Si tout va bien, on retourne directement la réponse
    async (error) => {
      const originalRequest = error.config;

      // Gestion du dépassement de délai (Timeout)
      if (error.code === 'ECONNABORTED') {
        console.error('⏱️ Timeout — Le serveur met trop de temps à répondre.');
        return Promise.reject(error);
      }
      
      // Gestion des pannes de connexion / serveur injoignable
      if (!error.response) {
        console.error('🔌 Erreur réseau — Vérifiez que le serveur tourne sur l\'IP :', BASE_URL);
        return Promise.reject(error);
      }

      // Si l'erreur est un 404 (Non trouvé), on transmet l'erreur sans tenter de rafraîchissement
      if (error.response.status === 404) {
        return Promise.reject(error);
      }

      // Gestion du token expiré (Statut 401 Unauthorized)
      if (error.response.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/refresh')) {
        
        // Si un rafraîchissement est déjà en cours, on met la requête en attente dans la file
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

        originalRequest._retry = true; // Marque la requête pour éviter une boucle infinie
        isRefreshing = true;          // Active le verrou

        try {
          console.log("🔄 Access Token expiré. Tentative de rafraîchissement unique...");
          
          // Demande d'un nouveau token d'accès via le Refresh Token stocké dans les cookies sécurisés
          const refreshResponse = await axios.post(`${BASE_URL}/auth/refresh`, {}, { withCredentials: true });
          const { token: newAccessToken } = refreshResponse.data;

          if (newAccessToken) {
            // Sauvegarde du nouveau token dans le stockage local
            await AsyncStorage.setItem('userToken', newAccessToken);
            
            // Mise à jour de l'en-tête de la requête initiale avec le nouveau token
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            
            // Libération de toutes les requêtes en attente dans la file
            processQueue(null, newAccessToken);
            
            // Relance de la requête initiale
            return axiosInstance(originalRequest);
          }
        } catch (refreshError) {
          // En cas d'échec critique du refresh, on rejette la file d'attente et on déconnecte l'utilisateur
          processQueue(refreshError, null);
          console.error("🚨 Échec critique du Refresh Token. Session expirée.");
          await AsyncStorage.multiRemove(['userToken', 'userRole']);
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false; // Libération du verrou dans tous les cas
        }
      }

      return Promise.reject(error);
    }
  );
};

// Application des intercepteurs de réponse sur nos deux instances Axios
setupResponseInterceptors(api);
setupResponseInterceptors(apiUpload);

export default api;