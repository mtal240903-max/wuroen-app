import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API = axios.create({
  baseURL: 'http://192.168.132.213:5000/api',
});

// Intercepteur pour injecter le token à chaque requête
API.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur de réponse pour gérer le 401
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Si 401 et qu'on n'a pas déjà essayé de rafraîchir
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        // Appel direct vers la route refresh
        const { data } = await axios.post('http://192.168.132.213:5000/api/auth/refresh', { 
          token: refreshToken 
        });
        
        await AsyncStorage.setItem('accessToken', data.accessToken);
        
        // Relancer la requête initiale avec le nouveau token
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return API(originalRequest);
      } catch (refreshError) {
        // Le refresh a échoué (refresh token expiré) : FORCER LA DÉCONNEXION
        await AsyncStorage.removeItem('accessToken');
        await AsyncStorage.removeItem('refreshToken');
        // Rediriger vers le login ici (ex: navigation.navigate('Login'))
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default API;