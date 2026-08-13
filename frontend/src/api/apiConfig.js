// Configuration de l'API pour le développement LOCAL
// Remplace '192.168.1.XX' par l'adresse IP locale de ton ordinateur
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

const API_BASE_URL = BASE_URL;
export default API_BASE_URL;