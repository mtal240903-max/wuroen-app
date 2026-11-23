const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// On utilise l'alias pour rediriger le module vers votre fichier .web.js
config.resolver.alias = {
  ...config.resolver.alias,
  'react-native-pdf': './src/screens/library/react-native-pdf.web.js',
};

module.exports = config;