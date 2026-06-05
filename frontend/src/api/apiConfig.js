// Configuration de l'API pour le développement et la production
const API_URLS = {
  development: 'http://192.168.38.154:5000/api', // Ton IP locale pour les tests rapides
  production: 'https://wuroen-backend.onrender.com/api' // Ton serveur en ligne sur Render
};

// Change cette variable sur 'production' quand tu veux tester la version en ligne
const CURRENT_ENV = 'production'; 

const API_BASE_URL = API_URLS[CURRENT_ENV];

export default API_BASE_URL;