import React, { useState, useCallback, useContext } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, ImageBackground, Image, StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import { COLORS } from '../../theme/theme';
import { Plus, Search, FileText, ChevronRight, LayoutGrid } from 'lucide-react-native';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import ArticleCard from '../../components/ArticleCard';

// ✅ ExpertList au lieu de CollaboratorList
import ExpertList from '../../components/ExpertList';

export default function HomeScreen({ navigation }) {
  const { user } = useContext(AuthContext);

  const [mixedData, setMixedData] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [refreshing,setRefreshing]= useState(false);
  const [error,     setError]     = useState(null);

  const shuffleArray = (array) => [...array].sort(() => Math.random() - 0.5);

  const prepareFeed = (articles, allUsers) => {
    const feed = [];

    if (allUsers?.length > 0) {
      feed.push({
        id:   'section-users',
        type: 'EXPERT_SECTION',
        data: shuffleArray(allUsers).slice(0, 8)
      });
    }

    const randomizedArticles = Array.isArray(articles)
      ? shuffleArray(articles)
          .filter(a => a && (a._id || a.id))
          .map(a => ({ ...a, type: 'ARTICLE' }))
      : [];

    const finalFeed = [...randomizedArticles];
    const promoIdx = finalFeed.length > 4
      ? Math.floor(Math.random() * 4) + 3
      : finalFeed.length;
    finalFeed.splice(promoIdx, 0, { id: 'promo-lib', type: 'DOC_PROMO' });

    return [...feed, ...finalFeed];
  };

  const fetchData = async () => {
    setError(null);
    try {
      // ✅ Requêtes nettoyées et sécurisées sur les routes appropriées
      const [artRes, userRes] = await Promise.all([
        api.get('/articles', { params: { page: 1, limit: 20 } }),
        api.get('/users',    { params: { page: 1, limit: 50 } }).catch(() => ({ data: [] }))
      ]);

      const rawArticles = artRes.data?.articles ?? artRes.data ?? [];
      const rawUsers    = userRes.data?.users   ?? userRes.data ?? [];

      const userList = rawUsers.map(u => ({
        ...u,
        name: u.name || "Utilisateur"
      }));

      setMixedData(prepareFeed(rawArticles, userList));
    } catch (err) {
      setError("Erreur lors du chargement.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchData();
    }, [])
  );

  const renderItem = ({ item }) => {
    if (!item) return null;

    switch (item.type) {
      case 'EXPERT_SECTION':
        return (
          <ExpertList
            experts={item.data}
            onExpertPress={(id) => navigation.navigate('UserProfile', { userId: id })}
          />
        );

      case 'DOC_PROMO':
        return (
          <TouchableOpacity
            style={styles.docCard}
            onPress={() => navigation.navigate('Biblio')}
            activeOpacity={0.9}
          >
            <View style={styles.docIcon}>
              <FileText color="#FFF" size={22} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.docTitle}>Bibliothèque Wuro'en</Text>
              <Text style={styles.docSub}>Consultez les thèses et ressources</Text>
            </View>
            <ChevronRight color="#475569" size={20} />
          </TouchableOpacity>
        );

      case 'ARTICLE':
      default:
        return (
          <ArticleCard
            item={item}
            onPress={() => navigation.navigate('ArticleDetail', { articleId: item._id })}
            onAuthorPress={(id) => navigation.navigate('UserProfile', { userId: id })}
            currentUserId={user?._id}
          />
        );
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error && mixedData.length === 0) {
    return (
      <View style={styles.loader}>
        <Text style={{ fontSize: 36 }}>⚠️</Text>
        <Text style={[styles.errorText]}>{error}</Text>
        <TouchableOpacity
          style={styles.retryBtn}
          onPress={() => { setLoading(true); fetchData(); }}
        >
          <Text style={styles.retryText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />
      <ImageBackground
        source={{ uri: 'https://www.transparenttextures.com/patterns/world-map.png' }}
        style={StyleSheet.absoluteFillObject}
        imageStyle={styles.worldMapStyle}
      />

      <View style={styles.topBar}>
        <Image
          source={require('../../../assets/logo_wuro.jpeg')}
          style={styles.logoImage}
          resizeMode="contain"
        />
        <TouchableOpacity
          style={styles.fakeSearch}
          onPress={() => navigation.navigate('Search')}
        >
          <Search color="#475569" size={16} />
          <Text style={styles.searchText}>Rechercher...</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.gridBtn}
          onPress={() => navigation.navigate('Menu')}
        >
          <LayoutGrid color={COLORS.primary} size={22} />
        </TouchableOpacity>
      </View>

      {error && mixedData.length > 0 && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>⚠️ {error}</Text>
        </View>
      )}

      <FlatList
        data={mixedData}
        keyExtractor={(item) => item._id || item.id || `item-${item.type}`}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={{ fontSize: 48 }}>📭</Text>
            <Text style={styles.emptyText}>Aucune publication pour l'instant.</Text>
            <Text style={styles.emptySub}>Sois le premier à publier !</Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            tintColor={COLORS.primary}
            onRefresh={() => { setRefreshing(true); fetchData(); }}
          />
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateArticle')}
        activeOpacity={0.8}
      >
        <Plus color="#FFF" size={28} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#020617' },
  loader:         { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#020617', padding: 30 },
  worldMapStyle:  { opacity: 0.05, tintColor: COLORS.primary },
  topBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(2, 6, 23, 0.98)',
    paddingHorizontal: 20, paddingVertical: 15,
    borderBottomWidth: 1, borderBottomColor: '#1E293B'
  },
  logoImage:  { width: 120, height: 40, marginRight: 15 },
  fakeSearch: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#0F172A', borderRadius: 12,
    paddingHorizontal: 12, height: 38,
    borderWidth: 1, borderColor: '#1E293B'
  },
  searchText: { color: '#475569', marginLeft: 8, fontSize: 12 },
  gridBtn:    { marginLeft: 15, padding: 4 },
  list:       { paddingBottom: 110 },
  docCard: {
    backgroundColor: '#0F172A', marginHorizontal: 20, marginVertical: 12,
    padding: 20, borderRadius: 20, flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#1E293B'
  },
  docIcon: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: COLORS.primary, justifyContent: 'center',
    alignItems: 'center', marginRight: 15
  },
  docTitle:     { fontSize: 15, fontWeight: '800', color: '#F8FAFC' },
  docSub:       { fontSize: 11, color: '#64748B', marginTop: 3 },
  fab: {
    position: 'absolute', bottom: 30, right: 25,
    backgroundColor: COLORS.primary, width: 60, height: 60,
    borderRadius: 18, justifyContent: 'center', alignItems: 'center',
    elevation: 10, shadowColor: COLORS.primary, shadowOpacity: 0.4, shadowRadius: 12
  },
  errorText:    { color: '#EF4444', marginTop: 12, textAlign: 'center', fontSize: 13 },
  retryBtn:     { marginTop: 20, backgroundColor: COLORS.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  retryText:    { color: '#FFF', fontWeight: '800', fontSize: 14 },
  errorBanner:  { backgroundColor: '#7F1D1D', paddingVertical: 8, paddingHorizontal: 16, alignItems: 'center' },
  errorBannerText: { color: '#FCA5A5', fontSize: 12, fontWeight: '600' },
  emptyState:   { alignItems: 'center', paddingTop: 80, paddingHorizontal: 40 },
  emptyText:    { color: '#F8FAFC', fontSize: 16, fontWeight: '800', marginTop: 16, textAlign: 'center' },
  emptySub:     { color: '#64748B', fontSize: 13, marginTop: 8, textAlign: 'center' },
});