import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  // Utilise ton lien Render avec /api à la fin
  baseURL: 'https://wuroen-api.onrender.com/api', 
  timeout: 15000, // On augmente un peu car Render (gratuit) peut être lent à se réveiller
});

// Ajouter le token automatiquement s'il existe
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;