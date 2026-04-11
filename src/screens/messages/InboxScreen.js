import React, { useState, useCallback, useContext } from 'react';
import { 
  View, Text, FlatList, TouchableOpacity, StyleSheet, 
  StatusBar, RefreshControl, Platform, ActivityIndicator 
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';

import { AuthContext } from '../../context/AuthContext';
import { COLORS, SPACING } from '../../theme/theme';
import { Search, Edit3, MessageSquareOff } from 'lucide-react-native';

// --- Composant ChatItem (Optimisé avec Badge Rouge) ---
const ChatItem = ({ item, navigation }) => {
  const contactName = item.contact?.name || "Chercheur Wuro’en";
  const contactId = item.contact?._id;
  const unreadCount = item.unreadCount || 0; 

  return (
    <TouchableOpacity 
      style={styles.chatCard} 
      activeOpacity={0.7}
      onPress={() => navigation.navigate('ChatDetail', { 
        chatId: contactId, 
        userName: contactName 
      })}
    >
      <View style={styles.avatarContainer}>
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>{contactName[0].toUpperCase()}</Text>
        </View>
        {/* Badge de présence (optionnel, peut être lié à une socket) */}
        <View style={styles.onlineBadge} />
      </View>

      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <Text style={styles.userName} numberOfLines={1}>{contactName}</Text>
          <Text style={[
            styles.timeText, 
            unreadCount > 0 && { color: '#FF3B30', fontWeight: 'bold' }
          ]}>
            {formatDate(item.date)}
          </Text>
        </View>

        <View style={styles.lastMsgRow}>
          <Text 
            style={[
              styles.lastMsg, 
              unreadCount > 0 && { fontWeight: '700', color: '#1E293B' }
            ]} 
            numberOfLines={1}
          >
            {item.lastMessage}
          </Text>
          
          {/* LE BADGE DE NOTIFICATION ROUGE */}
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Fonction utilitaire pour la date
const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const now = new Date();
  if (date.toLocaleDateString() === now.toLocaleDateString()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
};

export default function InboxScreen({ navigation }) {
  const { userToken } = useContext(AuthContext);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Récupération des conversations depuis l'API Inbox
  const fetchConversations = async () => {
    try {
      const response = await axios.get('https://wuroen-api.onrender.com/api/messages/inbox', {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      setChats(response.data);
    } catch (error) {
      console.error("Erreur Inbox:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // useFocusEffect est CRUCIAL : il recharge la liste chaque fois qu'on revient sur cet écran
  // Cela fait disparaître le badge rouge dès qu'on revient d'une discussion
  useFocusEffect(
    useCallback(() => {
      fetchConversations();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchConversations();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        <TouchableOpacity style={styles.iconBtn}>
          <Edit3 size={22} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.searchBar} activeOpacity={0.8}>
        <Search size={20} color="#94A3B8" />
        <Text style={styles.searchText}>Rechercher dans vos échanges...</Text>
      </TouchableOpacity>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(item) => item.contact?._id || Math.random().toString()}
          renderItem={({ item }) => <ChatItem item={item} navigation={navigation} />}
          contentContainerStyle={{ paddingHorizontal: SPACING.m, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MessageSquareOff size={60} color="#CBD5E1" strokeWidth={1} />
              <Text style={styles.emptyText}>Aucune discussion</Text>
              <Text style={styles.subEmptyText}>
                Collaborez avec d'autres chercheurs pour initier des échanges privés.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: SPACING.l, 
    paddingTop: Platform.OS === 'ios' ? 60 : 45,
    paddingBottom: SPACING.m
  },
  title: { fontSize: 28, fontWeight: '800', color: '#1E293B' },
  iconBtn: { backgroundColor: '#F1F5F9', padding: 10, borderRadius: 14 },
  searchBar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#F8FAFC', 
    marginHorizontal: SPACING.m, 
    padding: 14, 
    borderRadius: 16, 
    marginBottom: 20, 
    gap: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9'
  },
  searchText: { color: '#94A3B8', fontSize: 14 },
  chatCard: { 
    flexDirection: 'row', 
    paddingVertical: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: '#F1F5F9', 
    alignItems: 'center' 
  },
  avatarContainer: { position: 'relative' },
  avatarPlaceholder: { 
    width: 60, 
    height: 60, 
    borderRadius: 22, 
    backgroundColor: COLORS.primary, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  avatarText: { color: '#FFF', fontSize: 22, fontWeight: 'bold' },
  onlineBadge: { 
    position: 'absolute', 
    right: -2, 
    bottom: -2, 
    width: 16, 
    height: 16, 
    borderRadius: 8, 
    backgroundColor: '#10B981', 
    borderWidth: 3, 
    borderColor: '#FFF' 
  },
  chatContent: { flex: 1, marginLeft: 16 },
  chatHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  userName: { fontSize: 16, fontWeight: '700', color: '#1E293B', flex: 1, marginRight: 10 },
  timeText: { fontSize: 12, color: '#64748B' },
  lastMsgRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  lastMsg: { fontSize: 14, color: '#64748B', flex: 1, lineHeight: 20 },
  unreadBadge: { 
    backgroundColor: '#FF3B30', 
    minWidth: 22, 
    height: 22, 
    borderRadius: 11, 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingHorizontal: 6,
    marginLeft: 10,
    elevation: 2,
    shadowColor: '#FF3B30',
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  unreadText: { color: '#FFF', fontSize: 11, fontWeight: 'bold' },
  emptyContainer: { marginTop: 100, alignItems: 'center', paddingHorizontal: 50 },
  emptyText: { color: '#1E293B', fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginTop: 15 },
  subEmptyText: { color: '#64748B', fontSize: 14, textAlign: 'center', marginTop: 8, lineHeight: 20 }
});