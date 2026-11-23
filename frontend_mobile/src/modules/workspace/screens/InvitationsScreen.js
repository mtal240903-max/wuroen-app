import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { workspaceService } from '../services/workspaceService';

export default function InvitationsScreen() {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInvitations = async () => {
    try {
      const data = await workspaceService.getPendingInvitations();
      setInvitations(data);
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', 'Impossible de récupérer les invitations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  const handleRespond = async (workspaceId, accept) => {
    try {
      await workspaceService.respondToInvitation(workspaceId, accept);
      Alert.alert('Succès', accept ? 'Invitation acceptée !' : 'Invitation refusée.');
      fetchInvitations(); // Rafraîchir la liste
    } catch (error) {
      Alert.alert('Erreur', 'Action échouée.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Invitations en attente</Text>
      <FlatList
        data={invitations}
        keyExtractor={(item) => item.id || item._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.companyName}>{item.companyName || 'Entreprise'}</Text>
            <Text style={styles.invitedBy}>Invité par : {item.inviterEmail}</Text>
            <View style={styles.btnRow}>
              <TouchableOpacity style={[styles.btn, styles.acceptBtn]} onPress={() => handleRespond(item.workspaceId || item.companyId, true)}>
                <Text style={styles.btnText}>Accepter</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, styles.rejectBtn]} onPress={() => handleRespond(item.workspaceId || item.companyId, false)}>
                <Text style={styles.btnText}>Refuser</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090D1A', padding: 16 },
  title: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  card: { backgroundColor: '#111726', padding: 16, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: '#1E293B' },
  companyName: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  invitedBy: { color: '#94A3B8', fontSize: 12, marginVertical: 6 },
  btnRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 },
  btn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, marginLeft: 8 },
  acceptBtn: { backgroundColor: '#10B981' },
  rejectBtn: { backgroundColor: '#EF4444' },
  btnText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' }
});