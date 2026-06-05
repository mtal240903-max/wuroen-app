// Dans src/api/apiConfig.js
// Remplace par ton URL Render
export const BASE_URL = 'https://wuroen-api.onrender.com/api'; 

export const ENDPOINTS = {
  login: `${BASE_URL}/auth/login`,
  register: `${BASE_URL}/auth/register`,
  articles: `${BASE_URL}/articles`,
  messages: `${BASE_URL}/messages`,
  collaborations: `${BASE_URL}/collaborations`,
  library: `${BASE_URL}/library`,
  users: `${BASE_URL}/users`,
};