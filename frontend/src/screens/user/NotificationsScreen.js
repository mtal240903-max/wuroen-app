import React, { useState, useEffect, useContext, useCallback } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  ActivityIndicator, RefreshControl, StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../services/api'; 
import { AuthContext } from '../../context/AuthContext';
import { COLORS } from '../../theme/theme';
import { Bell, Heart, MessageSquare, UserPlus, Sparkles } from 'lucide-react-native';

export default function NotificationsScreen() {
  const { userToken } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 📥 Récupération sécurisée du flux de notifications
  const fetchNotifications = async () => {
    try {
      const response = await api.get('/users/notifications');
      // Gestion des structures de réponse hybrides (Tableau direct ou objet encapsulé)
      const data = Array.isArray(response.data) ? response.data : (response.data.notifications || []);
      setNotifications(data);
    } catch (error) {
      console.error("Erreur notifications:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Synchronisation dès que l'écran passe au premier plan
  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [])
  );

  // 👁️ Marquage d'une notification comme lue avec double clé (_id / id)
  const markAsRead = async (id) => {
    if (!id) return;
    try {
      await api.put(`/users/notifications/${id}/read`);
      setNotifications(prev => 
        prev.map(n => (n._id === id || n.id === id) ? { ...n, read: true } : n)
      );
    } catch (err) {
      console.error("Erreur markAsRead:", err);
    }
  };

  const getIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'like': 
        return <Heart size={18} color="#EF4444" fill="#EF4444" />;
      case 'comment': 
      case 'commentaire':
        return <MessageSquare size={18} color={COLORS.primary || '#00AEEF'} fill={COLORS.primary || '#00AEEF'} />;
      case 'collaboration': 
      case 'coauthor':
        return <UserPlus size={18} color="#10B981" />;
      default: 
        return <Sparkles size={18} color={COLORS.primary || '#00AEEF'} />;
    }
  };

  const renderItem = ({ item }) => {
    const currentId = item._id || item.id;
    const isUnread = !item.read;
    const itemDate = item.createdAt 
      ? new Date(item.createdAt).toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      : "Récemment";

    return (
      <TouchableOpacity 
        style={[styles.notiItem, isUnread && styles.unreadItem]}
        onPress={() => markAsRead(currentId)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, isUnread && styles.unreadIcon]}>
          {getIcon(item.type)}
        </View>
        <View style={styles.content}>
          <Text style={styles.notiText}>
            <Text style={styles.boldText}>{item.senderName || "Un confrère"}</Text> {item.message}
          </Text>
          <Text style={styles.timeText}>{itemDate}</Text>
        </View>
        {isUnread && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  // Compteur dynamique basé sur les identifiants hybrides
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>// NOTIFICATIONS</Text>
        {unreadCount > 0 && (
          <View style={styles.badgeCount}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}
      </View>

      {loading && !refreshing ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary || '#00AEEF'} />
          <Text style={styles.cyberLoadingText}>SYNCHRONISATION DU FLUX AMBIANT...</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item._id || item.id || Math.random().toString()}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listPadding}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={() => { setRefreshing(true); fetchNotifications(); }} 
              tintColor={COLORS.primary || '#00AEEF'} 
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Bell size={32} color={COLORS.primary || '#00AEEF'} />
              </View>
              <Text style={styles.emptyTitle}>FLUX VIERGE</Text>
              <Text style={styles.emptySub}>Aucun signal d'interaction ni de mention n'a transité sur votre terminal.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 20,
    paddingVertical: 15,
    justifyContent: 'space-between' 
  },
  headerTitle: { fontSize: 14, fontWeight: '900', color: '#475569', letterSpacing: 1.5 },
  badgeCount: { 
    backgroundColor: '#EF4444', 
    paddingHorizontal: 8, 
    paddingVertical: 2, 
    borderRadius: 8 
  },
  badgeText: { color: '#FFF', fontSize: 11, fontWeight: '900' },
  listPadding: { paddingHorizontal: 16, paddingBottom: 100 },
  notiItem: { 
    flexDirection: 'row', 
    padding: 16, 
    marginBottom: 12, 
    backgroundColor: '#0F172A', 
    borderRadius: 20, 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  unreadItem: { 
    backgroundColor: 'rgba(0, 174, 239, 0.02)', 
    borderColor: 'rgba(0, 174, 239, 0.15)',
  },
  iconContainer: { 
    width: 46, height: 46, borderRadius: 14, 
    backgroundColor: 'rgba(15, 23, 42, 0.6)', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 14,
    borderWidth: 1,
    borderColor: '#1E293B'
  },
  unreadIcon: { borderColor: 'rgba(0, 174, 239, 0.3)' },
  content: { flex: 1 },
  notiText: { fontSize: 13, color: '#94A3B8', lineHeight: 18, letterSpacing: -0.1 },
  boldText: { fontWeight: '800', color: '#F8FAFC' },
  timeText: { fontSize: 11, color: '#475569', marginTop: 6, fontWeight: '700' },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444', marginLeft: 10 },
  cyberLoadingText: { color: '#64748B', marginTop: 16, fontSize: 11, fontWeight: '800', letterSpacing: 2 },
  emptyContainer: { alignItems: 'center', marginTop: 100, paddingHorizontal: 30 },
  emptyIconCircle: { width: 70, height: 70, borderRadius: 24, backgroundColor: 'rgba(0, 174, 239, 0.03)', justifyContent: 'center', alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: 'rgba(0, 174, 239, 0.1)' },
  emptyTitle: { fontSize: 13, fontWeight: '900', color: '#FFF', letterSpacing: 1 },
  emptySub: { fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 20, marginTop: 8 }
});