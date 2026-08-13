import React from 'react';
import { StyleSheet, View, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Briefcase } from 'lucide-react-native';
import { COLORS } from '../../../theme/theme';

export default function TabCenterButton({ onPress, accessibilityState }) {
  const isFocused = accessibilityState?.selected;

  // Dégradé Style 1 : Bleu Cyan vers Vert Émeraude Lumineux
  const activeGradient = ['#06B6D4', '#10B981'];
  // État inactif : Reste sombre mais garde une touche de style
  const inactiveGradient = ['#1E293B', '#0F172A'];

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.85}
      onPress={onPress}
    >
      {/* Lueur externe / Bordure lumineuse */}
      <View style={[
        styles.glowBorder,
        { borderColor: isFocused ? '#06B6D4' : '#334155' }
      ]}>
        <LinearGradient
          colors={isFocused ? activeGradient : inactiveGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.button}
        >
          <Briefcase 
            color="#FFFFFF" 
            size={24} 
            strokeWidth={isFocused ? 2.5 : 2} 
          />
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    // Fait flotter le cercle au-dessus de la barre de navigation d'origine
    top: Platform.OS === 'ios' ? -22 : -18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowBorder: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A', // Assorti au fond de ta barre
    
    // Effet d'ombre néon pour le Style 1
    shadowColor: '#06B6D4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  button: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
  },
});