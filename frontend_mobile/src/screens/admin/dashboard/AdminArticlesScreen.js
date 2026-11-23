import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  SafeAreaView, TextInput, Modal, ScrollView, ActivityIndicator,
  RefreshControl, Alert, Platform
} from 'react-native';
import {
  FileStack, Search, Clock, UserPlus,
  ArrowLeft, Inbox, X, CheckCircle2
} from 'lucide-react-native';
import { AuthContext } from '../../../context/AuthContext';
import { COLORS } from '../../../theme/theme';

// ✅ FIX : api au lieu de axios + IP codée en dur
import api from '../../../services/api';

// ✅ FIX : mapping onglets → valeurs status réelles en base
const TAB_STATUS = {
  'En attente': 'pending',
  'Assignés':   'assigned',
  'Publiés':    'published',
};

export default function AdminArticlesScreen({ navigation }) {
  const { userToken } = useContext(AuthContext);

  const [activeTab, setActiveTab]       = useState('En attente');
  const [searchQuery, setSearchQuery]   = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [articles, setArticles]         = useState([]);
  const [moderators, setModerators]     = useState([]);
  const [isLoading, setIsLoading]       = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      // ✅ FIX : vraies routes qui existent dans articleRoutes.js
      const [articlesRes, moderatorsRes] = await Promise.all([
        api.get('/articles/moderation/pending'),
        // ✅ Récupérer les modérateurs depuis /admin/users filtré par rôle
        api.get('/admin/users', { params: { limit: 100 } }),
      ]);

      // Articles en attente
      const rawArticles = articlesRes.data ?? [];
      setArticles(rawArticles);

      // Filtrer uniquement les modérateurs
      const rawUsers = moderatorsRes.data?.users ?? moderatorsRes.data ?? [];
      setModerators(rawUsers.filter(u => ['moderator', 'admin'].includes(u.role)));

    } catch (error) {
      console.error("AdminArticles error:", error.response?.status, error.message);
      Alert.alert("Erreur", error.response?.data?.message || "Impossible de charger les données.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ✅ FIX : filtrage par status réel (anglais) et non par onglet string
  const filteredData = useMemo(() => {
    const targetStatus = TAB_STATUS[activeTab];
    return articles.filter(art => {
      const matchesTab    = art.status === targetStatus;
      const matchesSearch = art.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            art.author?.name?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [articles, activeTab, searchQuery]);

  const handleAssignation = async (modId, modName) => {
    try {
      // ✅ FIX : vraie route assignModerator
      await api.patch(`/admin/articles/${selectedArticle._id}/assign`, { moderatorId: modId });
      setModalVisible(false);
      Alert.alert("✅ Succès", `Article confié à ${modName}`);
      fetchData(true);
    } catch (error) {
      Alert.alert("Erreur", error.response?.data?.message || "L'assignation a échoué.");
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.tag}>
          <Text style={styles.tagText}>{item.category || "GÉNÉRAL"}</Text>
        </View>
        <View style={styles.row}>
          <Clock size={12} color="#64748B" />
          <Text style={styles.dateText}>
            {item.createdAt ? new Date(item.createdAt).toLocaleDateString('fr-FR') : '---'}
          </Text>
        </View>
      </View>

      <TouchableOpacity onPress={() => navigation.navigate('ArticleDetailReview', { articleId: item._id })}>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
      </TouchableOpacity>

      <View style={styles.cardBottom}>
        <View style={styles.userInfo}>
          <View style={styles.miniAvatar}>
            <Text style={styles.avatarLetter}>{item.author?.name?.charAt(0) || '?'}</Text>
          </View>
          <Text style={styles.userName}>{item.author?.name || "Auteur inconnu"}</Text>
        </View>

        {activeTab === 'En attente' && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => { setSelectedArticle(item); setModalVisible(true); }}
          >
            <UserPlus size={14} color="#FFF" />
            <Text style={styles.actionButtonText}>Confier</Text>
          </TouchableOpacity>
        )}

        {activeTab === 'Assignés' && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#7C3AED' }]}
            onPress={() => navigation.navigate('ArticleDetailReview', { articleId: item._id })}
          >
            <Text style={styles.actionButtonText}>Réviser</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <ArrowLeft color="#FFF" size={22} />
        </TouchableOpacity>
        <View style={styles.headerTextGroup}>
          <Text style={styles.headerMainTitle}>Flux Articles</Text>
          <Text style={styles.headerSubTitle}>{articles.length} soumissions total</Text>
        </View>
        <FileStack color="#10B981" size={24} />
      </View>

      <View style={styles.searchWrapper}>
        <View style={styles.searchBar}>
          <Search size={18} color="#4B5563" />
          <TextInput
            placeholder="Rechercher un titre ou auteur..."
            placeholderTextColor="#4B5563"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.tabContainer}>
        {Object.keys(TAB_STATUS).map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setActiveTab(t)}
            style={[styles.tabItem, activeTab === t && styles.tabActive]}
          >
            <Text style={[styles.tabLabel, activeTab === t && styles.tabLabelActive]}>{t}</Text>
            {activeTab === t && <View style={styles.activeDot} />}
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loaderText}>Chargement...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => { setIsRefreshing(true); fetchData(true); }}
              tintColor="#10B981"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Inbox size={48} color="#1E293B" />
              <Text style={styles.emptyTitle}>Rien ici</Text>
              <Text style={styles.emptySub}>Aucun article dans cette catégorie.</Text>
            </View>
          }
        />
      )}

      <Modal animationType="slide" transparent visible={modalVisible} statusBarTranslucent>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetTitle}>Choisir un modérateur</Text>
                <Text style={styles.sheetDesc}>Qui évalue ce travail ?</Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeCircle}>
                <X color="#94A3B8" size={20} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modList} showsVerticalScrollIndicator={false}>
              {moderators.length === 0 && (
                <Text style={{ color: '#64748B', textAlign: 'center', marginTop: 20 }}>
                  Aucun modérateur disponible.
                </Text>
              )}
              {moderators.map((m) => (
                <TouchableOpacity
                  key={m._id}
                  style={styles.modCard}
                  onPress={() => handleAssignation(m._id, m.name)}
                >
                  <View style={styles.modInfo}>
                    <View style={styles.modAvatar}>
                      <Text style={styles.modInitial}>{m.name?.[0]}</Text>
                    </View>
                    <View>
                      <Text style={styles.modName}>{m.name}</Text>
                      <Text style={styles.modEmail}>{m.role?.toUpperCase()}</Text>
                    </View>
                  </View>
                  <CheckCircle2 size={20} color="#10B981" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea:         { flex: 1, backgroundColor: '#0A0E17', paddingTop: Platform.OS === 'android' ? 30 : 0 },
  headerContainer:  { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, gap: 15 },
  iconBtn:          { backgroundColor: '#161B22', padding: 10, borderRadius: 14, borderWidth: 1, borderColor: '#30363D' },
  headerTextGroup:  { flex: 1 },
  headerMainTitle:  { fontSize: 20, fontWeight: '900', color: '#FFF' },
  headerSubTitle:   { fontSize: 12, color: '#64748B', marginTop: 2 },
  searchWrapper:    { paddingHorizontal: 20, marginBottom: 15 },
  searchBar:        { backgroundColor: '#161B22', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, borderRadius: 15, height: 50, gap: 12, borderWidth: 1, borderColor: '#30363D' },
  searchInput:      { flex: 1, color: '#FFF', fontSize: 14 },
  tabContainer:     { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 10 },
  tabItem:          { paddingVertical: 10, alignItems: 'center', flex: 1 },
  tabActive:        {},
  tabLabel:         { color: '#64748B', fontWeight: '700', fontSize: 12 },
  tabLabelActive:   { color: '#10B981' },
  activeDot:        { width: 4, height: 4, borderRadius: 2, backgroundColor: '#10B981', marginTop: 4 },
  list:             { padding: 20 },
  card:             { backgroundColor: '#161B22', borderRadius: 20, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#30363D' },
  cardTop:          { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  tag:              { backgroundColor: '#10B98115', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  tagText:          { color: '#10B981', fontSize: 10, fontWeight: '900' },
  dateText:         { color: '#64748B', fontSize: 11, marginLeft: 5 },
  title:            { fontSize: 16, fontWeight: '800', color: '#F8FAFC', lineHeight: 22, marginBottom: 15 },
  cardBottom:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#30363D', paddingTop: 12 },
  userInfo:         { flexDirection: 'row', alignItems: 'center', gap: 8 },
  miniAvatar:       { width: 24, height: 24, borderRadius: 8, backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center' },
  avatarLetter:     { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  userName:         { color: '#94A3B8', fontSize: 13, fontWeight: '600' },
  actionButton:     { backgroundColor: '#10B981', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, gap: 6 },
  actionButtonText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  loader:           { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loaderText:       { color: '#64748B', marginTop: 10, fontSize: 12 },
  emptyContainer:   { alignItems: 'center', marginTop: 60, padding: 40 },
  emptyTitle:       { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginTop: 15 },
  emptySub:         { color: '#64748B', textAlign: 'center', marginTop: 8, lineHeight: 20 },
  overlay:          { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  sheet:            { backgroundColor: '#161B22', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, height: '70%', borderTopWidth: 1, borderTopColor: '#30363D' },
  sheetHeader:      { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  sheetTitle:       { color: '#FFF', fontSize: 20, fontWeight: '900' },
  sheetDesc:        { color: '#64748B', fontSize: 14, marginTop: 4 },
  closeCircle:      { backgroundColor: '#1E293B', padding: 8, borderRadius: 20 },
  modList:          { flex: 1 },
  modCard:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0D1117', padding: 16, borderRadius: 18, marginBottom: 12, borderWidth: 1, borderColor: '#30363D' },
  modInfo:          { flexDirection: 'row', alignItems: 'center', gap: 15 },
  modAvatar:        { width: 44, height: 44, borderRadius: 12, backgroundColor: '#3B82F6', justifyContent: 'center', alignItems: 'center' },
  modInitial:       { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  modName:          { color: '#F8FAFC', fontSize: 15, fontWeight: '700' },
  modEmail:         { color: '#64748B', fontSize: 12, marginTop: 2 },
  row:              { flexDirection: 'row', alignItems: 'center' },
});