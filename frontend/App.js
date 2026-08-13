import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createNavigationContainerRef } from '@react-navigation/native';

// Importation de vos contextes
import { AuthProvider } from './src/context/AuthContext';
import { WorkspaceProvider } from './src/context/WorkspaceContext';
import { CompanyProvider } from './src/modules/workspace/context/CompanyContext';

// Importation de la navigation
import AppNavigator from './src/navigation/AppNavigator';

// Exportation de la référence pour l'utiliser dans AppNavigator
export const navigationRef = createNavigationContainerRef();

export default function App() {

  // Écouteur global des appels entrants
  useEffect(() => {
    if (global.socket) {
      const handleIncomingCall = (data) => {
        // Vérifie si la navigation est prête avant de rediriger
        if (navigationRef.isReady()) {
          navigationRef.navigate('CallScreen', { 
            roomId: data.roomId, 
            userName: data.senderName, 
            isIncoming: true, 
            isVideo: data.isVideo 
          });
        }
      };

      global.socket.on('incoming_call', handleIncomingCall);

      return () => {
        global.socket.off('incoming_call', handleIncomingCall);
      };
    }
  }, []);

  return (
    <SafeAreaProvider style={styles.container}>
      {/* L'ordre des Providers : Auth -> Workspace -> Company */}
      <AuthProvider>
        <WorkspaceProvider>
          <CompanyProvider> 
            <StatusBar style="light" backgroundColor="#000000" />
            
            <View style={styles.innerContainer}>
              <AppNavigator />
            </View>
          </CompanyProvider>
        </WorkspaceProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  innerContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
});