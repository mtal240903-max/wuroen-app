import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, FlatList, TextInput, TouchableOpacity, 
  StyleSheet, ActivityIndicator, RefreshControl,
  StatusBar, BackHandler
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; 
import { useFocusEffect } from '@react-navigation/native'; 
import api from '../../services/api'; 
import { COLORS } from '../../theme/theme';
import { 
  Search, Filter, BookOpen, ChevronRight, 
  ChevronLeft, FileText, Folder, Eye, Layers
} from 'lucide-react-native';

export default function LibraryScreen({ navigation }) {
  const [items, setItems] = useState([]); 
  const [history, setHistory] = useState([]); 
  const [currentCategory, setCurrentCategory] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

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

  // Vérifie s'il y a uniquement des ressources (fichiers) dans le dossier actuel
  const hasOnlyResources = items.length > 0 && items.every(item => item.level === undefined);

  const renderItem = ({ item }) => {
    const isFolder = item.level !== undefined; 

    if (isFolder) {
      return (
        // Wrapper pour forcer le dossier à prendre toute la largeur même si numColumns = 2
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
        style={styles.resourceCard} 
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

        <View style={styles.searchContainer}>
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

      <FlatList
        data={filteredItems}
        // Repasse en 1 colonne si le dossier contient encore des sous-dossiers
        key={hasOnlyResources ? 'grid' : 'list'}
        numColumns={hasOnlyResources ? 2 : 1}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  header: { 
    backgroundColor: '#020617', 
    paddingHorizontal: 20, 
    paddingBottom: 25,
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15 },
  titleGroup: { flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: 26, fontWeight: '900', color: '#FFF', letterSpacing: -0.5 },
  backBtn: { marginRight: 10 },
  filterBtn: { backgroundColor: '#0f172a', padding: 10, borderRadius: 14, borderWidth: 1, borderColor: '#1e293b' },
  breadcrumbContainer: { flexDirection: 'row', marginTop: 12, alignItems: 'center' },
  breadcrumbLabel: { color: '#64748B', fontSize: 13 },
  breadcrumbText: { color: COLORS.primary, fontSize: 13, fontWeight: '800' },
  searchContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#070a13', 
    borderRadius: 16, 
    paddingHorizontal: 15, 
    marginTop: 20, 
    borderWidth: 1, 
    borderColor: '#151f32'
  },
  searchInput: { flex: 1, height: 52, color: '#FFF', fontSize: 15 },
  searchIcon: { marginRight: 10 },
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  
  // 📐 Forçage de la largeur totale pour les dossiers
  fullWidthWrapper: {
    width: '100%',
  },
  folderRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#0b1325', 
    padding: 16, 
    borderRadius: 20, 
    marginBottom: 12, 
    borderWidth: 1, 
    borderColor: '#16223f',
    width: '100%' // Va jusqu'au bout
  },
  folderIcon: { 
    width: 46, 
    height: 46, 
    borderRadius: 12, 
    backgroundColor: 'rgba(37, 99, 235, 0.12)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  folderInfo: { flex: 1, marginLeft: 16 },
  folderName: { fontSize: 16, fontWeight: '700', color: '#F8FAFC' },
  folderSub: { fontSize: 11, color: '#475569', marginTop: 3, fontWeight: '600', letterSpacing: 0.3 },
  
  resourceCard: { 
    flex: 0.5, backgroundColor: '#0b1325', margin: 6, padding: 16, borderRadius: 24, 
    borderWidth: 1, borderColor: '#16223f'
  },
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