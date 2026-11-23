import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from './config'; // 👈 Import direct dans le même dossier

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour injecter automatiquement le token dans chaque requête
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('⚠️ Erreur lors de la récupération du token dans AsyncStorage', error);
    }
    
    console.log(`🚀 [API Request] ${config.method?.toUpperCase()} -> ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error(`❌ [API Error] Status ${error.response.status} sur ${error.config?.url}`, error.response.data);
    } else if (error.request) {
      console.error(`🔌 [Network Error] Aucune réponse reçue du serveur pour : ${error.config?.baseURL}${error.config?.url}`);
    } else {
      console.error(`⚠️ [Axios Config Error]`, error.message);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;