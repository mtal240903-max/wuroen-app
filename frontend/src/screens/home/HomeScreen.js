import React, { useState, useCallback, useContext, useRef } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, ImageBackground, Image, StatusBar, useWindowDimensions, Animated, PanResponder
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../../theme/theme';
import { Plus, Search, FileText, ChevronRight, LayoutGrid, Briefcase } from 'lucide-react-native';
import { AuthContext } from '../../context/AuthContext';
import { WorkspaceContext } from '../../context/WorkspaceContext';
import api from '../../services/api';
import ArticleCard from '../../components/ArticleCard';
import ExpertList from '../../components/ExpertList';

export default function HomeScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const { currentWorkspace } = useContext(WorkspaceContext);
  const { width, height } = useWindowDimensions();

  const [mixedData, setMixedData] = useState([]);
  const [articlesOnly, setArticlesOnly] = useState([]);
  const [expertsOnly, setExpertsOnly] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const isLargeScreen = width >= 900;
  const shuffleArray = (array) => [...array].sort(() => Math.random() - 0.5);

  // Animation et gestion du déplacement de la bulle FAB
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: () => {
        pan.flattenOffset();
      },
      onPanResponderGrant: () => {
        pan.setOffset({
          x: pan.x._value,
          y: pan.y._value
        });
        pan.setValue({ x: 0, y: 0 });
      }
    })
  ).current;

  const prepareFeed = (articles, allUsers) => {
    const feed = [];
    if (allUsers?.length > 0) {
      feed.push({ id: 'section-users', type: 'EXPERT_SECTION', data: shuffleArray(allUsers).slice(0, 8) });
    }
    const randomizedArticles = Array.isArray(articles)
      ? shuffleArray(articles).filter(a => a && (a._id || a.id)).map(a => ({ ...a, type: 'ARTICLE' }))
      : [];
    const finalFeed = [...randomizedArticles];
    const promoIdx = finalFeed.length > 4 ? Math.floor(Math.random() * 4) + 3 : finalFeed.length;
    finalFeed.splice(promoIdx, 0, { id: 'promo-lib', type: 'DOC_PROMO' });
    return [...feed, ...finalFeed];
  };

  const fetchData = async () => {
    setError(null);
    try {
      const [artRes, userRes] = await Promise.all([
        api.get('/articles', { params: { page: 1, limit: 20 } }),
        api.get('/users', { params: { page: 1, limit: 50 } }).catch(() => ({ data: [] }))
      ]);
      const rawArticles = artRes.data?.articles ?? artRes.data ?? [];
      const rawUsers = userRes.data?.users ?? userRes.data ?? [];
      setArticlesOnly(rawArticles);
      setExpertsOnly(shuffleArray(rawUsers).slice(0, 8));
      setMixedData(prepareFeed(rawArticles, rawUsers));
    } catch (err) { setError("Erreur lors du chargement."); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useFocusEffect(useCallback(() => { setLoading(true); fetchData(); }, []));

  const PromoCard = () => (
    // Correction de 'Biblio' vers 'Library' pour correspondre au routeur
    <TouchableOpacity style={styles.docCard} onPress={() => navigation.navigate('Library')} activeOpacity={0.9}>
      <View style={styles.docIcon}><FileText color="#FFF" size={22} /></View>
      <View style={{ flex: 1 }}>
        <Text style={styles.docTitle}>Bibliothèque Wuro'en</Text>
        <Text style={styles.docSub}>Consultez les thèses et ressources</Text>
      </View>
      <ChevronRight color="#475569" size={20} />
    </TouchableOpacity>
  );

  if (loading && !refreshing) return <View style={styles.loader}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />
      <ImageBackground source={{ uri: 'https://www.transparenttextures.com/patterns/world-map.png' }} style={StyleSheet.absoluteFillObject} imageStyle={styles.worldMapStyle} />

      <View style={styles.topBar}>
        <View style={styles.topLeftContainer}>
          <Image source={require('../../../assets/logo_wuro.jpeg')} style={styles.logoImage} resizeMode="contain" />
          {currentWorkspace && (
            <TouchableOpacity 
              style={styles.workspaceBadge} 
              onPress={() => navigation.navigate('WorkspaceDetail', { workspaceId: currentWorkspace._id })}
            >
              <Briefcase color={COLORS.primary} size={14} />
              <Text style={styles.workspaceText} numberOfLines={1}>{currentWorkspace.name}</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity style={[styles.fakeSearch, isLargeScreen && { maxWidth: 300 }]} onPress={() => navigation.navigate('Search')}>
          <Search color="#475569" size={16} /><Text style={styles.searchText}>Rechercher...</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.gridBtn} onPress={() => navigation.navigate('Menu')}><LayoutGrid color={COLORS.primary} size={22} /></TouchableOpacity>
      </View>

      <View style={[styles.layoutContent, isLargeScreen && styles.rowLayout]}>
        {isLargeScreen && expertsOnly.length > 0 && (
          <View style={styles.leftSidebar}>
            <Text style={styles.sidebarTitle}>Experts à la une</Text>
            <ExpertList experts={expertsOnly} onExpertPress={(id) => navigation.navigate('UserProfile', { userId: id })} />
          </View>
        )}

        <View style={[styles.mainFeed, isLargeScreen && { flex: 2, maxWidth: 600 }]}>
          <FlatList
            data={isLargeScreen ? articlesOnly : mixedData}
            keyExtractor={(item) => item._id || item.id || `item-${item.type}`}
            renderItem={({ item }) => {
              if (item.type === 'EXPERT_SECTION') return <ExpertList experts={item.data} onExpertPress={(id) => navigation.navigate('UserProfile', { userId: id })} />;
              if (item.type === 'DOC_PROMO') return <PromoCard />;
              return <ArticleCard item={item} onPress={() => navigation.navigate('ArticleDetail', { articleId: item._id })} onAuthorPress={(id) => navigation.navigate('UserProfile', { userId: id })} currentUserId={user?._id} />;
            }}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} tintColor={COLORS.primary} onRefresh={() => { setRefreshing(true); fetchData(); }} />}
          />
        </View>

        {isLargeScreen && (
          <View style={styles.rightSidebar}>
            <Text style={styles.sidebarTitle}>Ressources</Text>
            <PromoCard />
          </View>
        )}
      </View>

      <Animated.View
        style={[
          styles.fabContainer,
          {
            transform: [
              { translateX: pan.x },
              { translateY: pan.y }
            ]
          }
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('CreateArticle')} activeOpacity={0.8}>
          <Plus color="#FFF" size={28} />
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#020617' },
  worldMapStyle: { opacity: 0.05, tintColor: COLORS.primary },
  topBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(2, 6, 23, 0.98)', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1E293B', justifyContent: 'space-between' },
  topLeftContainer: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  logoImage: { width: 90, height: 35, marginRight: 8 },
  workspaceBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F172A', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: '#1E293B', maxWidth: 110, marginRight: 8 },
  workspaceText: { color: '#F8FAFC', fontSize: 10, fontWeight: '700', marginLeft: 4 },
  fakeSearch: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F172A', borderRadius: 12, paddingHorizontal: 10, height: 36, borderWidth: 1, borderColor: '#1E293B', marginHorizontal: 6 },
  searchText: { color: '#475569', marginLeft: 6, fontSize: 12 },
  gridBtn: { padding: 4 },
  layoutContent: { flex: 1 },
  rowLayout: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 10 },
  mainFeed: { flex: 1 },
  leftSidebar: { flex: 0.8, marginRight: 16, backgroundColor: '#0F172A', borderRadius: 16, padding: 12, borderWidth: 1, borderColor: '#1E293B' },
  rightSidebar: { flex: 0.8, marginLeft: 16, backgroundColor: '#0F172A', borderRadius: 16, padding: 12, borderWidth: 1, borderColor: '#1E293B' },
  sidebarTitle: { color: '#F8FAFC', fontSize: 14, fontWeight: '800', marginBottom: 12, paddingLeft: 4 },
  list: { paddingBottom: 110 },
  docCard: { backgroundColor: '#0F172A', padding: 20, borderRadius: 20, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#1E293B', marginBottom: 15 },
  docIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  docTitle: { fontSize: 15, fontWeight: '800', color: '#F8FAFC' },
  docSub: { fontSize: 11, color: '#64748B', marginTop: 3 },
  fabContainer: { position: 'absolute', bottom: 90, right: 25, zIndex: 997 },
  fab: { backgroundColor: COLORS.primary, width: 60, height: 60, borderRadius: 18, justifyContent: 'center', alignItems: 'center', elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4 }
});