// Configure l'adresse du serveur avec EXPO_PUBLIC_API_URL dans .env.local.
export const BASE_URL = (process.env.EXPO_PUBLIC_API_URL || 'http://192.168.184.109:5000/api').replace(/\/$/, '');

export const ENDPOINTS = {
  login: `${BASE_URL}/auth/login`,
  register: `${BASE_URL}/auth/register`,
  articles: `${BASE_URL}/articles`,
  messages: `${BASE_URL}/messages`,
  collaborations: `${BASE_URL}/collaborations`,
  library: `${BASE_URL}/library`,
  users: `${BASE_URL}/users`,
};

const API_BASE_URL = BASE_URL;
export default API_BASE_URL;
