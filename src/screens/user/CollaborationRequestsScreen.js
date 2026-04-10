import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  RefreshControl
} from 'react-native';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { COLORS, SPACING } from '../../theme/theme';
import { UserCheck, X, UserPlus, ArrowLeft, Trash2 } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CollaborationRequestsScreen({ navigation }) {
  const { userToken } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      // NOUVELLE LOGIQUE : On récupère les collaborations 'pending' où je suis le destinataire
      // Note : Assure-toi d'avoir une route GET /api/collaborations/pending côté backend
      const res = await axios.get('http://192.168.115.239:5000/api/collaborations/pending', {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      setRequests(res.data);
    } catch (err) {
      console.error("Erreur fetchRequests:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  const handleResponse = async (collabId, status) => {
    try {
      // Utilisation de la nouvelle route PUT /api/collaborations/respond/:collabId
      await axios.put(
        `http://192.168.115.239:5000/api/collaborations/respond/${collabId}`,
        { status }, // 'accepted' ou 'rejected'
        { headers: { Authorization: `Bearer ${userToken}` } }
      );

      Alert.alert("Wuro’en", status === 'accepted' ? "Collaboration établie !" : "Demande refusée.");
      
      // Mise à jour de la liste locale
      setRequests(requests.filter(req => req._id !== collabId));
    } catch (err) {
      Alert.alert("Erreur", "Impossible de traiter la demande.");
    }
  };

  const renderRequestItem = ({ item }) => (
    <View style={styles.requestCard}>
      <View style={styles.userInfo}>
        <View style={styles.avatarSmall}>
          {/* 'sender' est maintenant un objet peuplé (populated) grâce à MongoDB */}
          <Text style={styles.avatarText}>{item.sender?.name ? item.sender.name[0].toUpperCase() : '?'}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.userName}>{item.sender?.name}</Text>
          <Text style={styles.userSpecialty}>{item.sender?.specialty || "Chercheur scientifique"}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.rejectBtn} 
          onPress={() => handleResponse(item._id, 'rejected')}
        >
          <X color="#EF4444" size={20} />
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft color={COLORS.textPrimary} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Demandes reçues</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item._id}
          renderItem={renderRequestItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchRequests(); }} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <UserPlus color={COLORS.textSecondary} size={60} strokeWidth={1} opacity={0.3} />
              <Text style={styles.emptyText}>Aucune nouvelle invitation.</Text>
            </View>
          }
          contentContainerStyle={{ padding: 15 }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FE' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  backBtn: { padding: 5 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B', marginLeft: 10 },
  requestCard: { 
    backgroundColor: '#FFF', 
    borderRadius: 18, 
    padding: 15, 
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 15 },
  avatarSmall: { 
    width: 50, height: 50, borderRadius: 15, 
    backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' 
  },
  avatarText: { color: '#FFF', fontWeight: 'bold', fontSize: 20 },
  userName: { fontWeight: 'bold', fontSize: 16, color: '#1E293B' },
  userSpecialty: { fontSize: 13, color: '#64748B', marginTop: 2 },
  actions: { 
    flexDirection: 'row', 
    gap: 10, 
    borderTopWidth: 1, 
    borderTopColor: '#F8FAFC', 
    paddingTop: 12 
  },
  acceptBtn: { 
    flex: 2,
    backgroundColor: COLORS.primary, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    paddingVertical: 10, 
    borderRadius: 12,
    gap: 8
  },
  rejectBtn: { 
    flex: 1,
    backgroundColor: '#FEE2E2', 
    alignItems: 'center', 
    justifyContent: 'center',
    paddingVertical: 10, 
    borderRadius: 12
  },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  emptyState: { alignItems: 'center', marginTop: 120 },
  emptyText: { marginTop: 15, color: '#94A3B8', fontSize: 16, fontWeight: '500' }
});