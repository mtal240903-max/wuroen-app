import React, { useEffect, useState, useRef, memo, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
  Alert,
  Image,
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import api from '../../services/api';
import { COLORS } from '../../theme/theme';

import {
  Search,
  CheckCheck,
  MoreVertical,
  PlusCircle,
  BellOff,
  Users,
} from 'lucide-react-native';

import ChatActionSheet from '../../components/components_messages/ChatActionSheet';

// ─────────────────────────────────────────────────────────────
// AVATAR COLLABORATEUR (BARRE HORIZONTALE)
// ─────────────────────────────────────────────────────────────
const CollabAvatar = memo(({ user, navigation }) => {
  if (!user?._id) return null;

  const avatarSource = user?.avatarUrl || user?.avatar || user?.photo;
  const hasAvatar = !!avatarSource;

  return (
    <TouchableOpacity
      style={styles.collabItem}
      activeOpacity={0.7}
      onPress={() =>
        navigation.navigate('ChatDetail', {
          chatId: user._id,
          userName: user.name,
          isGroup: false,
        })
      }
    >
      <View style={styles.collabAvatarWrapper}>
        <View style={[styles.collabAvatar, hasAvatar && { overflow: 'hidden' }]}>
          {hasAvatar ? (
            <Image source={{ uri: avatarSource }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.collabAvatarText}>
              {user?.name?.[0]?.toUpperCase() || '?'}
            </Text>
          )}
        </View>
        {user?.isOnline && <View style={styles.onlineBadge} />}
      </View>

      <Text style={styles.collabName} numberOfLines={1}>
        {user?.name?.split(' ')[0] || 'Expert'}
      </Text>
    </TouchableOpacity>
  );
});

// ─────────────────────────────────────────────────────────────
// ITEM DISCUSSION (LISTE VERTICALE)
// ─────────────────────────────────────────────────────────────
const ChatItem = memo(({ item, navigation, onLongPress }) => {
  const isGroup = item?.isGroup || false;

  const contactName =
    item?.contact?.name ||
    item?.name ||
    (isGroup ? 'Groupe Wuro’en' : 'Utilisateur');

  const contactId = isGroup ? item?._id : item?.contact?._id;
  const unreadCount = item?.unreadCount !== undefined ? item.unreadCount : (item?.unread || 0);
  const isMuted = item?.isMuted || false;

  if (!contactId) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
  };

  const avatarSource = isGroup 
    ? (item?.avatarUrl || item?.avatar) 
    : (item?.contact?.avatarUrl || item?.contact?.avatar || item?.contact?.photo);
  const hasAvatar = !!avatarSource;

  return (
    <TouchableOpacity
      style={styles.chatCard}
      activeOpacity={0.85}
      onPress={() =>
        navigation.navigate(
          isGroup ? 'GroupChatDetail' : 'ChatDetail',
          { chatId: contactId, userName: contactName, isGroup }
        )
      }
      onLongPress={() => onLongPress(item)}
      delayLongPress={350}
    >
      <View style={styles.avatarContainer}>
        <View style={[
          styles.avatarPlaceholder, 
          isGroup && styles.groupAvatarBorder, 
          unreadCount > 0 && { borderColor: COLORS.primary, borderWidth: 2 },
          hasAvatar && { overflow: 'hidden' }
        ]}>
          {hasAvatar ? (
            <Image source={{ uri: avatarSource }} style={styles.avatarImage} />
          ) : (
            <Text style={[styles.avatarText, unreadCount > 0 && { color: '#FFF' }]}>
              {contactName?.[0]?.toUpperCase() || '?'}
            </Text>
          )}
        </View>
        {isGroup ? (
          <View style={styles.groupBadgeIcon}>
            <Users size={10} color="#FFF" />
          </View>
        ) : (
          item?.contact?.isOnline && <View style={styles.activeDot} />
        )}
      </View>

      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <View style={styles.nameRow}>
            <Text style={[styles.userName, isGroup && { color: COLORS.primary }, unreadCount > 0 && { fontWeight: '900' }]} numberOfLines={1}>
              {contactName}
            </Text>
            {isMuted && <BellOff size={12} color="#64748B" style={{ marginLeft: 6 }} />}
          </View>
          <Text style={[styles.timeText, unreadCount > 0 && { color: COLORS.primary, fontWeight: '800' }]}>
            {formatDate(item?.date)}
          </Text>
        </View>
        <View style={styles.lastMsgRow}>
          <Text style={[styles.lastMsg, unreadCount > 0 && { color: '#F8FAFC', fontWeight: '700' }]} numberOfLines={1}>
            {item?.lastMessage || (isGroup ? 'Discussion de groupe...' : 'Commencer la discussion...')}
          </Text>
          {unreadCount > 0 ? (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
            </View>
          ) : (
            <CheckCheck size={14} color="#475569" />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
});

// ─────────────────────────────────────────────────────────────
// COMPOSANT PRINCIPAL
// ─────────────────────────────────────────────────────────────
export default function InboxScreen({ navigation }) {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [isSheetVisible, setIsSheetVisible] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const activeChatId = useRef(null);
  const isMounted = useRef(true);

  const totalUnread = useMemo(() => {
    return chats.reduce((sum, chat) => {
      const count = chat.unreadCount !== undefined ? chat.unreadCount : (chat.unread || 0);
      return sum + count;
    }, 0);
  }, [chats]);

  useEffect(() => {
    const targetNavigation = navigation.getParent() || navigation;
    if (targetNavigation) {
      targetNavigation.setOptions({
        tabBarBadge: totalUnread > 0 ? totalUnread : undefined,
      });
    }
  }, [totalUnread, navigation]);

  // 📥 Base d'initialisation API
  const fetchConversations = useCallback(async (showGlobalLoader = false) => {
    if (showGlobalLoader) setLoading(true);
    try {
      const [inboxRes, groupsRes] = await Promise.all([
        api.get('/messages/inbox').catch(() => ({ data: [] })),
        api.get('/groups').catch(() => ({ data: [] }))
      ]);
      
      const combined = [
        ...(Array.isArray(inboxRes.data) ? inboxRes.data : []), 
        ...groupsRes.data.map(g => ({ ...g, isGroup: true }))
      ];
      combined.sort((a, b) => new Date(b?.date || 0) - new Date(a?.date || 0));
      
      if (isMounted.current) {
        setChats(combined);
      }
    } catch (error) {
      console.log('❌ Erreur récupération conversations.');
    } finally {
      if (isMounted.current) {
        setLoading(false);
        setRefreshing(false);
        setIsInitialLoad(false);
      }
    }
  }, []);

  // 🔄 Chargement au focus
  useFocusEffect(
    useCallback(() => {
      isMounted.current = true;
      activeChatId.current = null;
      fetchConversations(isInitialLoad);
      return () => { isMounted.current = false; };
    }, [fetchConversations, isInitialLoad])
  );

  // ⚡ Écouteurs Temps Réel (Mise à jour réactive instantanée sans rechargement)
  useEffect(() => {
    if (!global.socket) return;
    if (global.currentUser?._id) global.socket.emit('register_user', global.currentUser._id);

    const handleNewMessage = (newMessage) => {
      setChats((prevChats) => {
        const isGroup = !!newMessage.groupId;
        const targetId = isGroup ? newMessage.groupId : newMessage.sender;
        
        // On ignore si c'est notre propre message envoyé depuis un autre composant
        if (newMessage.sender === global.currentUser?._id) return prevChats;

        const isCurrentlyViewing = activeChatId.current === targetId;
        const chatIndex = prevChats.findIndex(c => 
          (isGroup && c._id === targetId) || (!isGroup && c.contact?._id === targetId)
        );

        const updatedChats = [...prevChats];

        if (chatIndex !== -1) {
          // La conversation existe déjà : mise à jour réactive directe
          const currentUnread = updatedChats[chatIndex].unreadCount !== undefined 
            ? updatedChats[chatIndex].unreadCount 
            : (updatedChats[chatIndex].unread || 0);

          updatedChats[chatIndex] = {
            ...updatedChats[chatIndex],
            lastMessage: newMessage.content,
            date: new Date().toISOString(), // Date système instantanée
            unreadCount: isCurrentlyViewing ? 0 : currentUnread + 1
          };
        } else {
          // Nouvelle discussion initiée : ajout dynamique en haut de pile
          updatedChats.unshift({
            _id: isGroup ? targetId : undefined,
            contact: isGroup ? undefined : { 
              _id: targetId, 
              name: newMessage.senderName || "Nouvel Expert",
              avatarUrl: newMessage.senderAvatar || newMessage.senderPhoto || null
            },
            lastMessage: newMessage.content,
            date: new Date().toISOString(),
            unreadCount: isCurrentlyViewing ? 0 : 1,
            isGroup: isGroup
          });
        }
        // Tri instantané par ordre chronologique
        return updatedChats.sort((a, b) => new Date(b.date) - new Date(a.date));
      });
    };

    global.socket.on('new_private_message', handleNewMessage);
    global.socket.on('new_group_message', handleNewMessage);
    
    return () => {
      global.socket.off('new_private_message', handleNewMessage);
      global.socket.off('new_group_message', handleNewMessage);
    };
  }, []); // Retrait des dépendances réseau pour figer l'écouteur en mode réactif direct

  const smartCollaborators = useMemo(() => {
    const seen = new Set();
    return chats
      .filter(item => item?.contact && !item?.isGroup && item?.contact?._id)
      .filter(item => {
        if (seen.has(item.contact._id)) return false;
        seen.add(item.contact._id);
        return true;
      })
      .map(item => item.contact);
  }, [chats]);

  const handleLongPress = useCallback((chat) => {
    const isGroup = chat?.isGroup || false;
    const id = isGroup ? chat?._id : chat?.contact?._id;
    const name = isGroup ? chat?.name || 'Groupe' : chat?.contact?.name || 'Utilisateur';
    if (!id) return;
    const currentUnread = chat?.unreadCount !== undefined ? chat.unreadCount : (chat?.unread || 0);

    setSelectedChat({ id, name, isMuted: chat?.isMuted || false, unreadCount: currentUnread, isGroup });
    setIsSheetVisible(true);
  }, []);

  const handleMenuAction = async (actionType) => {
    const { id: chatId, isGroup, isMuted } = selectedChat;
    setIsSheetVisible(false);
    if (!chatId) return;

    if (actionType === 'mute') {
      const newStatus = !isMuted;
      await api.put(isGroup ? `/groups/${chatId}/mute` : `/messages/conversations/${chatId}/mute`, { mute: newStatus });
      setChats(prev => prev.map(c => ((c.isGroup ? c._id : c.contact?._id) === chatId) ? { ...c, isMuted: newStatus } : c));
    } else if (actionType === 'read') {
      await api.put(`/messages/conversations/${chatId}/read`, { read: true }).catch(() => null);
      setChats(prev => prev.map(c => ((c.isGroup ? c._id : c.contact?._id) === chatId) ? { ...c, unreadCount: 0, unread: 0 } : c));
    } else if (actionType === 'unread') {
      await api.put(`/messages/conversations/${chatId}/unread`, { read: false }).catch(() => null);
      setChats(prev => prev.map(c => ((c.isGroup ? c._id : c.contact?._id) === chatId) ? { ...c, unreadCount: 1, unread: 1 } : c));
    } else if (actionType === 'delete') {
      Alert.alert('Supprimer', `Supprimer la discussion ?`, [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: async () => {
          await api.delete('/messages/clear-conversation', { data: { targetId: chatId, isGroup } });
          setChats(prev => prev.filter(c => (c.isGroup ? c._id : c.contact?._id) !== chatId));
        }}
      ]);
    }
  };

  const renderHeader = () => (
    <View>
      <View style={styles.collabSection}>
        <Text style={styles.sectionTitle}>Collaborateurs actifs</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.collabScroll}>
          <TouchableOpacity style={styles.addCollabBtn} onPress={() => navigation.navigate('SearchUsers')}>
            <View style={styles.addIconWrapper}><PlusCircle size={28} color={COLORS.primary} /></View>
            <Text style={styles.collabName}>Nouveau</Text>
          </TouchableOpacity>
          {smartCollaborators.map((user) => (
            <CollabAvatar key={`collab-${user._id}`} user={user} navigation={navigation} />
          ))}
        </ScrollView>
      </View>
      <Text style={styles.sectionTitle}>Discussions récentes</Text>
    </View>
  );

  if (loading && isInitialLoad) return <View style={styles.loaderContainer}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <View><Text style={styles.title}>Messages</Text><Text style={styles.subtitle}>Collaboration sécurisée</Text></View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('SearchUsers')}><Search size={20} color="#FFF" /></TouchableOpacity>
          <TouchableOpacity style={[styles.iconBtn, { marginLeft: 12 }]} onPress={() => navigation.navigate('MessageOptions')}><MoreVertical size={20} color={COLORS.primary} /></TouchableOpacity>
        </View>
      </View>
      <FlatList
        data={chats}
        keyExtractor={(item, index) => item?.isGroup ? `${item?._id}-group-${index}` : `${item?.contact?._id}-user-${index}`}
        renderItem={({ item }) => <ChatItem item={item} navigation={navigation} onLongPress={handleLongPress} />}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listPadding}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchConversations(false)} tintColor={COLORS.primary} />}
        ListEmptyComponent={<View style={styles.emptyContainer}><Text style={styles.emptyText}>Aucune discussion disponible.</Text></View>}
      />
      <ChatActionSheet visible={isSheetVisible} onClose={() => setIsSheetVisible(false)} onAction={handleMenuAction} selectedChat={selectedChat} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, marginBottom: 20 },
  title: { fontSize: 32, fontWeight: '900', color: '#FFF' },
  subtitle: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: { backgroundColor: '#0F172A', padding: 12, borderRadius: 16, borderWidth: 1, borderColor: '#1E293B' },
  listPadding: { paddingHorizontal: 20, paddingBottom: 40 },
  sectionTitle: { fontSize: 11, fontWeight: '900', color: '#475569', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 15 },
  collabSection: { marginBottom: 25, marginTop: 10 },
  collabScroll: { paddingRight: 20 },
  collabItem: { alignItems: 'center', marginRight: 18, width: 60 },
  addCollabBtn: { alignItems: 'center', marginRight: 18, width: 60 },
  addIconWrapper: { width: 58, height: 58, borderRadius: 22, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F172A', borderWidth: 1, borderStyle: 'dashed', borderColor: '#1E293B' },
  collabAvatarWrapper: { position: 'relative', marginBottom: 8 },
  collabAvatar: { width: 58, height: 58, borderRadius: 22, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: '#1E293B' },
  collabAvatarText: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  avatarImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  onlineBadge: { position: 'absolute', bottom: 0, right: 0, width: 14, height: 14, borderRadius: 7, backgroundColor: '#10B981', borderWidth: 2.5, borderColor: '#020617' },
  collabName: { color: '#94A3B8', fontSize: 11, fontWeight: '600', textAlign: 'center', marginTop: 4 },
  chatCard: { flexDirection: 'row', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(30,41,59,0.5)', alignItems: 'center' },
  avatarContainer: { position: 'relative' },
  avatarPlaceholder: { width: 56, height: 56, borderRadius: 20, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: '#1E293B' },
  avatarText: { color: COLORS.primary, fontSize: 20, fontWeight: '900' },
  groupAvatarBorder: { borderRadius: 16, borderColor: COLORS.primary },
  activeDot: { position: 'absolute', bottom: -1, right: -1, width: 14, height: 14, borderRadius: 7, backgroundColor: '#10B981', borderWidth: 2.5, borderColor: '#020617' },
  groupBadgeIcon: { position: 'absolute', bottom: -2, right: -2, backgroundColor: COLORS.primary, padding: 3, borderRadius: 8, borderWidth: 2, borderColor: '#020617' },
  chatContent: { flex: 1, marginLeft: 15 },
  chatHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  nameRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  userName: { fontSize: 16, fontWeight: '700', color: '#F8FAFC', flex: 1 },
  timeText: { fontSize: 11, color: '#475569' },
  lastMsgRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  lastMsg: { fontSize: 13, color: '#64748B', flex: 1, marginRight: 10 },
  unreadBadge: { backgroundColor: COLORS.primary, minWidth: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6 },
  unreadText: { color: '#FFF', fontSize: 10, fontWeight: '900' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#020617' },
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: '#475569', fontSize: 14, textAlign: 'center' },
});