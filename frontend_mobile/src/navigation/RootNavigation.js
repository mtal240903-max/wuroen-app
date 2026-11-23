import { createNavigationContainerRef } from '@react-navigation/native';

// 1. On crée la référence qui sera utilisée par le NavigationContainer
export const navigationRef = createNavigationContainerRef();

// 2. On crée une fonction utilitaire pour naviguer facilement
export function navigate(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  } else {
    // Si la navigation n'est pas prête, on peut mettre en file d'attente
    
    // ou simplement loguer un avertissement.
    console.warn('Navigation attempt failed: Navigation container is not ready.');
  }
}

// Optionnel : Ajout d'une fonction pour remplacer l'écran actuel
export function replace(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(StackActions.replace(name, params));
  }
}