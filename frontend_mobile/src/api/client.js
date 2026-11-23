// src/api/client.js
// ✅ FIX : Token injecté automatiquement depuis AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from './apiConfig';
import api from '../services/api';

// ✅ On réexporte simplement 'api' qui est déjà configuré avec token + timeout
// apiClient était une instance séparée sans token → toutes les requêtes library retournaient 401
export default api;