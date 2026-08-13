import { __DEV__, Platform } from 'react-native';
import { TestIds } from 'react-native-google-mobile-ads';

// J'ai remplacé la virgule par un point-virgule ici
const PROD_INTERSTITIAL_ID = 'ca-app-pub-2956617888770116~6315221391'; 

export const getInterstitialId = () => {
  // Utilise TestIds en mode développement pour ne pas être banni
  return __DEV__ ? TestIds.INTERSTITIAL : PROD_INTERSTITIAL_ID;
};