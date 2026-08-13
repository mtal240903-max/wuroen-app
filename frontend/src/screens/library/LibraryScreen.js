import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, FlatList, TextInput, TouchableOpacity, 
  StyleSheet, ActivityIndicator, RefreshControl,
  StatusBar, BackHandler, useWindowDimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; 
import { useFocusEffect } from '@react-navigation/native'; 
import api from '../../services/api'; 
import { COLORS } from '../../theme/theme';
import { 
  Search, Filter, BookOpen, ChevronRight, 
  ChevronLeft, FileText, Folder, Eye, Layers, Info, BarChart2
} from 'lucide-react-native';

export default function LibraryScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const [items, setItems] = useState([]); 
  const [history, setHistory] = useState([]); 
  const [currentCategory, setCurrentCategory] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  // Breakpoint pour basculer l'affichage (Tablettes et Ordinateurs)
  const isLargeScreen = width >= 850;

  const loadData = useCallback(async (isRefreshing = false) => {
    if (!isRefreshing) setLoading(true);
    try {
      const parentId = currentCategory ? currentCategory._id : 'root';
      
      const catRes = await api.get(`/library/categories/${parentId}`);
      const categories = Array.isArray(catRes.data) ? catRes.data : [];

      let resources = [];
      if (currentCategory) {
        const resRes = await api.get(`/library/resources/${currentCategory._id}`);
        const raw = resRes.data;
        resources = Array.isArray(raw) ? raw : (raw?.resources ?? []);
      }

      setItems([...categories, ...resources]);
    } catch (error) {
      console.error("❌ Erreur Library:", error.message);
      setItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentCategory]);

  useFocusEffect(
    useCallback(() => {
      loadData(true);
    }, [loadData])
  );

  useEffect(() => {
    const backAction = () => {
      if (history.length > 0) {
        handleGoBack();
        return true;
      }
      return false;
    };
    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backHandler.remove();
  }, [history]);

  const handleCategoryPress = (category) => {
    setHistory([...history, currentCategory]);
    setCurrentCategory(category);
    setSearch(''); 
  };

  const handleGoBack = () => {
    const newHistory = [...history];
    const previous = newHistory.pop();
    setHistory(newHistory);
    setCurrentCategory(previous || null);
  };

  const filteredItems = items.filter(item => {
    const nameToSearch = item.name || item.title || "";
    return nameToSearch.toLowerCase().includes(search.toLowerCase());
  });

  const hasOnlyResources = items.length > 0 && items.every(item => item.level === undefined);

  // Détermination dynamique des colonnes de la grille
  const getNumColumns = () => {
    if (isLargeScreen) {
      return hasOnlyResources ? 3 : 1; 
    }
    return hasOnlyResources ? 2 : 1;
  };

  // Statistiques calculées à la volée pour l'encadré Desktop
  const totalFolders = items.filter(i => i.level !== undefined).length;
  const totalFiles = items.filter(i => i.level === undefined).length;

  const renderItem = ({ item }) => {
    const isFolder = item.level !== undefined; 

    if (isFolder) {
      return (
        <View style={styles.fullWidthWrapper}>
          <TouchableOpacity 
            style={styles.folderRow} 
            activeOpacity={0.7}
            onPress={() => handleCategoryPress(item)}
          >
            <View style={styles.folderIcon}>
              <Folder size={20} color="#2563EB" fill="rgba(37, 69, 235, 0.2)" />
            </View>
            <View style={styles.folderInfo}>
              <Text style={styles.folderName}>{item.name}</Text>
              <Text style={styles.folderSub}>Dossier • Niveau {item.level}</Text>
            </View>
            <ChevronRight size={18} color="#334155" />
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <TouchableOpacity 
        style={[styles.resourceCard, isLargeScreen && styles.resourceCardDesktop]} 
        activeOpacity={0.8}
        onPress={() => navigation.navigate('ResourceDetail', { resource: item })}
      >
        <View style={styles.resHeader}>
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>{String(item.type || 'PDF').toUpperCase()}</Text>
          </View>
          <FileText size={18} color={COLORS.primary} />
        </View>
        <Text style={styles.resTitle} numberOfLines={2}>{item.title || item.name}</Text>
        <View style={styles.resFooter}>
          <View style={styles.stats}>
            <Eye size={14} color="#64748B" />
            <Text style={styles.statsText}>{item.views || 0}</Text>
          </View>
          <Layers size={14} color="#64748B" />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />

      {/* Header adaptable */}
      <View style={styles.header}>
        <View style={styles.topRow}>
          <View style={styles.titleGroup}>
            {history.length > 0 && (
              <TouchableOpacity onPress={handleGoBack} style={styles.backBtn}>
                <ChevronLeft size={28} color="#FFF" />
              </TouchableOpacity>
            )}
            <Text style={styles.title}>Bibliothèque</Text>
          </View>
          
          <TouchableOpacity style={styles.filterBtn}>
            <Filter size={22} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {currentCategory && (
          <View style={styles.breadcrumbContainer}>
            <Text style={styles.breadcrumbLabel}>Exploration : </Text>
            <Text style={styles.breadcrumbText}>{currentCategory.name}</Text>
          </View>
        )}

        <View style={[styles.searchContainer, isLargeScreen && { maxWidth: 500 }]}>
          <Search color="#64748B" size={20} style={styles.searchIcon} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Rechercher un document..."
            placeholderTextColor="#475569"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* ─── CORPS MULTI-COLONNES RESPONSIVE ─── */}
      <View style={[styles.layoutBody, isLargeScreen && styles.rowLayout]}>
        
        {/* Panneau Latéral Gauche (Uniquement visible sur PC et grande Tablette) */}
        {isLargeScreen && (
          <View style={styles.leftSidebar}>
            <View style={styles.sidebarSection}>
              <View style={styles.sidebarHeaderRow}>
                <Info size={16} color={COLORS.primary} />
                <Text style={styles.sidebarTitle}>Navigation Active</Text>
              </View>
              <Text style={styles.sidebarDescription}>
                {currentCategory 
                  ? `Vous explorez actuellement la section "${currentCategory.name}". Utilisez la flèche de retour pour remonter dans l'arborescence.` 
                  : "Vous êtes à la racine des archives documentaires scientifiques."}
              </Text>
            </View>

            <View style={styles.sidebarSection}>
              <View style={styles.sidebarHeaderRow}>
                <BarChart2 size={16} color={COLORS.primary} />
                <Text style={styles.sidebarTitle}>Contenu du dossier</Text>
              </View>
              <View style={styles.statsRow}>
                <Text style={styles.statsLabel}>Sous-catégories :</Text>
                <Text style={styles.statsValue}>{totalFolders}</Text>
              </View>
              <View style={styles.statsRow}>
                <Text style={styles.statsLabel}>Documents directs :</Text>
                <Text style={styles.statsValue}>{totalFiles}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Section Principale de la Liste / Grille */}
        <View style={styles.mainGridWrapper}>
          <FlatList
            data={filteredItems}
            key={isLargeScreen ? (hasOnlyResources ? 'grid-desktop' : 'list-desktop') : (hasOnlyResources ? 'grid' : 'list')}
            numColumns={getNumColumns()}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={() => loadData(true)} tintColor={COLORS.primary} />
            }
            renderItem={renderItem}
            ListEmptyComponent={
              !loading && (
                <View style={styles.empty}>
                  <BookOpen size={64} color="#1E293B" strokeWidth={1} />
                  <Text style={styles.emptyText}>Aucun contenu trouvé</Text>
                  <Text style={styles.emptySub}>Cette section ne contient pas encore de fichiers.</Text>
                </View>
              )
            }
            ListFooterComponent={loading && <ActivityIndicator color={COLORS.primary} style={{ marginTop: 20 }} />}
          />
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  header: { backgroundColor: '#020617', paddingHorizontal: 20, paddingBottom: 15 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15 },
  titleGroup: { flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: 26, fontWeight: '900', color: '#FFF', letterSpacing: -0.5 },
  backBtn: { marginRight: 10 },
  filterBtn: { backgroundColor: '#0f172a', padding: 10, borderRadius: 14, borderWidth: 1, borderColor: '#1e293b' },
  breadcrumbContainer: { flexDirection: 'row', marginTop: 12, alignItems: 'center' },
  breadcrumbLabel: { color: '#64748B', fontSize: 13 },
  breadcrumbText: { color: COLORS.primary, fontSize: 13, fontWeight: '800' },
  searchContainer: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#070a13', 
    borderRadius: 16, paddingHorizontal: 15, marginTop: 20, borderWidth: 1, borderColor: '#151f32'
  },
  searchInput: { flex: 1, height: 52, color: '#FFF', fontSize: 15 },
  searchIcon: { marginRight: 10 },
  
  // Layout adaptatif
  layoutBody: { flex: 1 },
  rowLayout: { flexDirection: 'row', paddingHorizontal: 15 },
  leftSidebar: { flex: 0.7, marginRight: 15, paddingVertical: 6 },
  mainGridWrapper: { flex: 2 },

  // Composants de la barre latérale
  sidebarSection: { backgroundColor: '#0b1325', padding: 16, borderRadius: 20, marginBottom: 15, borderWidth: 1, borderColor: '#16223f' },
  sidebarHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  sidebarTitle: { color: '#F8FAFC', fontSize: 14, fontWeight: '800', marginLeft: 8 },
  sidebarDescription: { color: '#64748B', fontSize: 12, lineHeight: 18 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  statsLabel: { color: '#64748B', fontSize: 12 },
  statsValue: { color: '#FFF', fontSize: 12, fontWeight: '700' },

  listContent: { paddingHorizontal: 10, paddingBottom: 100 },
  fullWidthWrapper: { width: '100%' },
  folderRow: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#0b1325', padding: 16, 
    borderRadius: 20, marginBottom: 12, borderWidth: 1, borderColor: '#16223f', width: '100%'
  },
  folderIcon: { 
    width: 46, height: 46, borderRadius: 12, backgroundColor: 'rgba(37, 99, 235, 0.12)', 
    justifyContent: 'center', alignItems: 'center' 
  },
  folderInfo: { flex: 1, marginLeft: 16 },
  folderName: { fontSize: 16, fontWeight: '700', color: '#F8FAFC' },
  folderSub: { fontSize: 11, color: '#475569', marginTop: 3, fontWeight: '600', letterSpacing: 0.3 },
  
  resourceCard: { flex: 0.5, backgroundColor: '#0b1325', margin: 6, padding: 16, borderRadius: 24, borderWidth: 1, borderColor: '#16223f' },
  resourceCardDesktop: { flex: 0.33 },
  
  resHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  typeBadge: { backgroundColor: 'rgba(37, 99, 235, 0.15)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  typeText: { fontSize: 10, fontWeight: '900', color: COLORS.primary },
  resTitle: { fontSize: 14, fontWeight: '700', color: '#F1F5F9', height: 40, lineHeight: 20 },
  resFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#16223f' },
  stats: { flexDirection: 'row', alignItems: 'center' },
  statsText: { fontSize: 12, color: '#64748B', marginLeft: 5 },
  empty: { alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 15, fontSize: 18, color: '#F1F5F9', fontWeight: '800' },
  emptySub: { color: '#64748B', fontSize: 14, marginTop: 8, textAlign: 'center', paddingHorizontal: 40 }
});