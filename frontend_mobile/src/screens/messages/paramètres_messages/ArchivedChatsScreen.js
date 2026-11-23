import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ArchiveX, RotateCcw } from 'lucide-react-native';
import api from '../../../services/api'; // ✅ Import de ton API
import { COLORS } from '../../../theme/theme';

export default function ArchivedChatsScreen({ navigation }) {
  const [archived, setArchived] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // --- 1. Récupérer les archives depuis l'API ---
  const fetchArchivedChats = useCallback(async () => {
    try {
      const response = await api.get('/messages/conversations/archived');
      setArchived(response.data || []);
    } catch (error) {
      console.error("Erreur archives:", error);
      // Alert.alert("Erreur", "Impossible de charger les archives.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchArchivedChats();
  }, [fetchArchivedChats]);

  // --- 2. Action pour Désarchiver ---
  const handleUnarchive = async (chatId) => {
    try {
      await api.put(`/messages/conversations/${chatId}/unarchive`);
      
      // Mise à jour locale : on retire de la liste des archives
      setArchived(prev => prev.filter(item => item.contact?._id !== chatId));
      
      Alert.alert("Succès", "Discussion replacée dans la boîte de réception.");
    } catch (error) {
      Alert.alert("Erreur", "L'opération a échoué.");
    }
  };

  const renderArchiveItem = ({ item }) => {
    const contactName = item.contact?.name || "Expert MTaL";
    
    return (
      <View style={styles.archiveItem}>
        <View style={styles.itemLeft}>
          <View style={styles.avatarMini}>
            <Text style={styles.avatarText}>{contactName[0].toUpperCase()}</Text>
          </View>
          <View style={styles.itemInfo}>
            <Text style={styles.userName}>{contactName}</Text>
            <Text style={styles.lastMsg} numberOfLines={1}>{item.lastMessage || "Discussion archivée"}</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.unarchiveBtn} 
          onPress={() => handleUnarchive(item.contact?._id)}
        >
          <RotateCcw size={18} color={COLORS.primary} />
          <Text style={styles.unarchiveText}>Restaurer</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Archives</Text>
        <View style={{ width: 44 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={COLORS.primary} size="large" />
        </View>
      ) : archived.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.iconCircle}>
            <ArchiveX size={50} color="#475569" />
          </View>
          <Text style={styles.emptyText}>Aucune archive</Text>
          <Text style={styles.emptySub}>Les discussions que vous masquez de votre boîte principale apparaîtront ici.</Text>
        </View>
      ) : (
        <FlatList
          data={archived}
          keyExtractor={item => item.contact?._id || Math.random().toString()}
          renderItem={renderArchiveItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={() => { setRefreshing(true); fetchArchivedChats(); }}
              tintColor={COLORS.primary}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15 },
  backBtn: { padding: 8, backgroundColor: '#0F172A', borderRadius: 12, borderWidth: 1, borderColor: '#1E293B' },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContainer: { padding: 20 },
  archiveItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    backgroundColor: '#0F172A', 
    padding: 15, 
    borderRadius: 20, 
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1E293B'
  },
  itemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatarMini: { width: 45, height: 45, borderRadius: 15, backgroundColor: '#1E293B', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: COLORS.primary, fontWeight: '800', fontSize: 16 },
  itemInfo: { marginLeft: 12, flex: 1 },
  userName: { color: '#F8FAFC', fontSize: 15, fontWeight: '700' },
  lastMsg: { color: '#64748B', fontSize: 12, marginTop: 2 },
  unarchiveBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(59, 130, 246, 0.1)', 
    paddingVertical: 8, 
    paddingHorizontal: 12, 
    borderRadius: 12 
  },
  unarchiveText: { color: COLORS.primary, fontSize: 11, fontWeight: '800', marginLeft: 6 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  iconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyText: { color: '#F8FAFC', fontSize: 18, fontWeight: '800' },
  emptySub: { color: '#475569', fontSize: 13, textAlign: 'center', marginTop: 10, lineHeight: 20 },
});