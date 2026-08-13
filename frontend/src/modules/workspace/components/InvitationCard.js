import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { COLORS } from '../../../theme/theme';

export default function InvitationCard({ invitation, onAccept, onDecline }) {
  const workspaceName = invitation.workspace?.name || 'Espace de travail';
  const roleName = invitation.role || 'Membre';

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Invitation reçue</Text>
      <Text style={styles.message}>
        Vous êtes invité à rejoindre l'espace <Text style={styles.highlight}>{workspaceName}</Text> en tant que <Text style={styles.highlight}>{roleName}</Text>.
      </Text>
      
      <View style={styles.actions}>
        <TouchableOpacity 
          style={[styles.button, styles.declineButton]} 
          onPress={onDecline}
          activeOpacity={0.7}
        >
          <Text style={[styles.btnText, styles.declineText]}>Refuser</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.acceptButton]} 
          onPress={onAccept}
          activeOpacity={0.7}
        >
          <Text style={[styles.btnText, styles.acceptText]}>Accepter</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F59E0B', // Teinte ambrée pour attirer l'attention sur l'action requise
  },
  title: {
    fontSize: 12,
    fontWeight: '800',
    color: '#F59E0B',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  message: {
    fontSize: 14,
    color: '#E2E8F0',
    marginBottom: 16,
    lineHeight: 20,
  },
  highlight: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  acceptButton: {
    backgroundColor: COLORS.primary || '#10B981',
    borderColor: COLORS.primary || '#10B981',
  },
  declineButton: {
    backgroundColor: 'transparent',
    borderColor: '#475569',
  },
  btnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  acceptText: {
    color: '#FFFFFF',
  },
  declineText: {
    color: '#94A3B8',
  },
});