// Configuration de l'API pour Render
export const BASE_URL = 'https://wuroen-app.onrender.com/api';

export const ENDPOINTS = {
  login: `${BASE_URL}/auth/login`,
  register: `${BASE_URL}/auth/register`,
  articles: `${BASE_URL}/articles`,
  messages: `${BASE_URL}/messages`,
  collaborations: `${BASE_URL}/collaborations`,
  library: `${BASE_URL}/library`,
  users: `${BASE_URL}/users`,
};

// Export par défaut au cas où un composant l'utiliserait sous ce nom
const API_BASE_URL = BASE_URL;
export default API_BASE_URL;


