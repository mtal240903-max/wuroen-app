// L'URL publique est configurable avec EXPO_PUBLIC_API_URL dans .env.local.
export const BASE_URL = (process.env.EXPO_PUBLIC_API_URL || 'https://wuroen-app.onrender.com/api').replace(/\/$/, '');

export const ENDPOINTS = {
  login: `${BASE_URL}/auth/login`,
  register: `${BASE_URL}/auth/register`,
  articles: `${BASE_URL}/articles`,
  messages: `${BASE_URL}/messages`,
  collaborations: `${BASE_URL}/collaborations`,
  library: `${BASE_URL}/library`,
  users: `${BASE_URL}/users`,
};

export default BASE_URL;
