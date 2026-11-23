import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { ChevronLeft, ShieldCheck, MoreVertical } from 'lucide-react-native';
import { COLORS } from '../../../theme/theme';
import api from '../../../services/api'; // Votre instance axios configurée

export default function GroupMembersScreen({ route, navigation }) {
  const { groupId } = route.params; // Récupération du groupe
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Charger les membres depuis l'API
 const fetchMembers = async () => {
  try {
    setLoading(true);
    const response = await api.get(`/groups/${groupId}/members`);
    setMembers(response.data);
  } catch (error) {
    // Affiche l'erreur détaillée dans le terminal
    console.log("Erreur API:", error.response?.data || error.message);
    Alert.alert("Erreur", "Impossible de charger les membres. Vérifiez la connexion.");
  } finally {
    setLoading(false);
  }
};

  const renderMember = ({ item }) => (
    <View style={styles.memberCard}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.name?.charAt(0).toUpperCase() || '?'}</Text>
      </View>
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{item.name}</Text>
          {item.role === 'admin' && (
            <ShieldCheck size={14} color={COLORS.primary} style={{ marginLeft: 5 }} />
          )}
        </View>
        <Text style={styles.specialty}>{item.specialty || "Membre du groupe"}</Text>
      </View>
      <TouchableOpacity>
        <MoreVertical color="#64748B" size={20} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft color="#FFF" size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Membres du groupe</Text>
        <View style={{ width: 28 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList 
          data={members}
          keyExtractor={item => item._id || item.id}
          renderItem={renderMember}
          contentContainerStyle={{ padding: 20 }}
        />
      )}
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    paddingTop: 50, 
    marginBottom: 20 
  },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  memberCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#0F172A', 
    padding: 15, 
    borderRadius: 15, 
    marginBottom: 12 
  },
  avatar: { 
    width: 45, height: 45, 
    borderRadius: 22.5, 
    backgroundColor: '#1E293B', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  avatarText: { color: '#FFF', fontWeight: 'bold' },
  info: { flex: 1, marginLeft: 15 },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  name: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  specialty: { color: '#64748B', fontSize: 12, marginTop: 2 }
});