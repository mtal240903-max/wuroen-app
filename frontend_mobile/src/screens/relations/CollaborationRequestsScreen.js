import React, { useState, useContext, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  RefreshControl,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

// Utilisation de ton instance API centrale
import api from '../../services/api'; 
import { AuthContext } from '../../context/AuthContext';
import { COLORS } from '../../theme/theme';
import { UserCheck, X, ArrowLeft, Ghost } from 'lucide-react-native';

export default function CollaborationRequestsScreen({ navigation }) {
  const { userToken } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Charger les données quand l'écran est affiché
  useFocusEffect(
    useCallback(() => {
      fetchRequests();
    }, [])
  );

  const fetchRequests = async () => {
    try {
      // Alignement avec ton contrôleur de requêtes en attente
      const res = await api.get('/collaborations/pending');
      setRequests(res.data);
    } catch (err) {
      console.error("Erreur fetchRequests:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleResponse = async (collabId, status) => {
    try {
      // Alignement de la route PUT vers ton système de réponse
      await api.put(`/collaborations/respond/${collabId}`, { status });

      const message = status === 'accepted' 
        ? "La collaboration a été activée !" 
        : "Demande de collaboration refusée.";
        
      Alert.alert("Wuro’en", message);
      
      // Mise à jour instantanée de la liste locale
      setRequests(prev => prev.filter(req => req._id !== collabId));
    } catch (err) {
      Alert.alert("Erreur", "Impossible de traiter cette demande.");
    }
  };

  const renderRequestItem = ({ item }) => {
    const sender = item.sender || {};
    
    // 🛠️ ALIGNEMENT DU SENDER : Ton backend renvoie 'name' directement grâce au populate
    const senderName = sender.name || "Chercheur Wuro'en";
    const initial = senderName.charAt(0).toUpperCase();

    return (
      <View style={styles.requestCard}>
        <View style={styles.userInfo}>
          <View style={styles.avatarSmall}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>{senderName}</Text>
            <Text style={styles.userSpecialty}>
              {sender.specialty || "Expert en production animale"}
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.rejectBtn} 
            onPress={() => handleResponse(item._id, 'rejected')}
          >
            <X color="#EF4444" size={20} />
            <Text style={styles.rejectBtnText}>Refuser</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.acceptBtn} 
            onPress={() => handleResponse(item._id, 'accepted')}
          >
            <UserCheck color="#FFF" size={18} />
            <Text style={styles.btnText}>Accepter</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER DARK */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft color="#FFF" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Invitations</Text>
      </View>

      {loading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Recherche de confrères...</Text>
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item._id}
          renderItem={renderRequestItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={() => { setRefreshing(true); fetchRequests(); }} 
              tintColor={COLORS.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ghost color="#334155" size={80} strokeWidth={1} />
              <Text style={styles.emptyText}>Aucune invitation</Text>
              <Text style={styles.emptySubText}>Les demandes de collaborations scientifiques apparaîtront ici.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#020617',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B'
  },
  backBtn: { padding: 5 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#FFF', marginLeft: 15 },
  listContent: { padding: 15, paddingBottom: 30 },
  requestCard: { 
    backgroundColor: 'rgba(30, 41, 59, 0.5)', 
    borderRadius: 20, 
    padding: 16, 
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#334155',
  },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  avatarSmall: { 
    width: 54, height: 54, borderRadius: 18, 
    backgroundColor: COLORS.primary || '#00AEEF', justifyContent: 'center', alignItems: 'center' 
  },
  avatarText: { color: '#FFF', fontWeight: 'bold', fontSize: 22 },
  userName: { fontWeight: '700', fontSize: 16, color: '#F8FAFC' },
  userSpecialty: { fontSize: 13, color: '#94A3B8', marginTop: 2 },
  actions: { 
    flexDirection: 'row', 
    gap: 12, 
    borderTopWidth: 1, 
    borderTopColor: '#334155', 
    paddingTop: 14 
  },
  acceptBtn: { 
    flex: 2,
    backgroundColor: COLORS.primary || '#00AEEF', 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    paddingVertical: 12, 
    borderRadius: 14,
    gap: 8,
    shadowColor: COLORS.primary || '#00AEEF',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5
  },
  rejectBtn: { 
    flex: 1,
    backgroundColor: 'rgba(239, 68, 68, 0.1)', 
    flexDirection: 'row',
    alignItems: 'center', 
    justifyContent: 'center',
    paddingVertical: 12, 
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    gap: 5
  },
  btnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  rejectBtnText: { color: '#EF4444', fontWeight: '700', fontSize: 14 },
  emptyState: { alignItems: 'center', marginTop: 100, paddingHorizontal: 40 },
  emptyText: { marginTop: 20, color: '#F8FAFC', fontSize: 20, fontWeight: '800', textAlign: 'center' },
  emptySubText: { marginTop: 8, color: '#64748B', fontSize: 14, textAlign: 'center', lineHeight: 20 },
  loadingText: { marginTop: 12, color: '#94A3B8', fontWeight: '500' }
});