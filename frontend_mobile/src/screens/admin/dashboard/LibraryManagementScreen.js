import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  SafeAreaView, StatusBar, ActivityIndicator, RefreshControl, Dimensions, Alert
} from 'react-native';
import { 
  Folder, FileText, ChevronRight, ArrowLeft, 
  FilePlus, PieChart, LayoutList, Database, Info, HardDrive
} from 'lucide-react-native';
import { COLORS } from '../../../theme/theme';
import apiClient from '../../../api/client';

const { width } = Dimensions.get('window');

export default function LibraryManagementScreen({ navigation }) {
  const [viewMode, setViewMode] = useState('list'); 
  const [parentId, setParentId] = useState(null); 
  const [navigationHistory, setNavigationHistory] = useState([]);
  const [items, setItems] = useState({ categories: [], resources: [] });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const currentId = (!parentId || parentId === 'root') ? 'root' : parentId;
      
      // Récupération simultanée pour plus de fluidité
      const [catRes, resRes] = await Promise.all([
        apiClient.get(`/library/categories/${currentId}`),
        parentId && parentId !== 'root' ? apiClient.get(`/library/resources/${parentId}`) : Promise.resolve({ data: [] })
      ]);

      setItems({ 
        categories: Array.isArray(catRes.data) ? catRes.data : (catRes.data?.categories ?? []),
        resources: Array.isArray(resRes.data) ? resRes.data : (resRes.data?.resources ?? []) 
      });
    } catch (e) {
      console.error("❌ Sync Error:", e.message);
      if (e.response?.status !== 400) {
        Alert.alert("Serveur", "Erreur de synchronisation des données.");
      }
    } finally {
      setLoading(false);
    }
  }, [parentId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFolderPress = (category) => {
    setNavigationHistory([...navigationHistory, { id: parentId, name: category.name }]);
    setParentId(category._id);
  };

  const handleBack = () => {
    const newHistory = [...navigationHistory];
    const lastPage = newHistory.pop();
    setNavigationHistory(newHistory);
    setParentId(lastPage ? lastPage.id : null);
  };

  const renderStatsView = () => (
    <ScrollView contentContainerStyle={styles.statsContent}>
      <View style={styles.storageHero}>
        <HardDrive color="#FFF" size={28} />
        <View style={styles.storageText}>
          <Text style={styles.storageMain}>Gestion du Cloud</Text>
          <Text style={styles.storageSub}>5.8 GB sur 10 GB utilisés</Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: '58%' }]} />
          </View>
        </View>
      </View>

      <View style={styles.statsGrid}>
        {['Élevage', 'Agronomie', 'Bio-Tech', 'Nutrition'].map((sector, i) => (
          <View key={i} style={styles.statBox}>
            <View style={styles.statCircle}>
               <Text style={styles.statValue}>{25 - i * 5}%</Text>
            </View>
            <Text style={styles.statLabel}>{sector}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderListView = () => {
    const currentPathName = navigationHistory[navigationHistory.length - 1]?.name || "Racine";
    const isLeafFolder = parentId !== null && items.categories.length === 0;

    return (
      <ScrollView 
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} tintColor={COLORS.primary} />}
      >
        <View style={styles.breadCrumb}>
          <Info color={COLORS.primary} size={16} />
          <Text style={styles.breadCrumbText}>Dossier : {currentPathName}</Text>
        </View>

        {items.categories.map((cat) => (
          <TouchableOpacity key={cat._id} style={styles.itemRow} onPress={() => handleFolderPress(cat)}>
            <View style={[styles.iconWrapper, { backgroundColor: '#1E293B' }]}>
              <Folder color={COLORS.primary} size={20} fill={COLORS.primary} />
            </View>
            <View style={styles.itemMeta}>
              <Text style={styles.itemTitle}>{cat.name}</Text>
              <Text style={styles.itemSub}>Ouvrir le répertoire</Text>
            </View>
            <ChevronRight color="#475569" size={18} />
          </TouchableOpacity>
        ))}

        {items.resources.map((res) => (
          <TouchableOpacity key={res._id} style={styles.itemRow} onPress={() => navigation.navigate('ResourceDetail', { resourceId: res._id })}>
            <View style={[styles.iconWrapper, { backgroundColor: '#0F172A' }]}>
              <FileText color="#94A3B8" size={20} />
            </View>
            <View style={styles.itemMeta}>
              <Text style={styles.itemTitle}>{res.title}</Text>
              <Text style={styles.itemSub}>{String(res.type).toUpperCase()} • {res.size || 'Fichier'}</Text>
            </View>
          </TouchableOpacity>
        ))}

        {!loading && items.categories.length === 0 && items.resources.length === 0 && (
          <View style={styles.emptyState}>
            <Database color="#1E293B" size={60} />
            <Text style={styles.emptyText}>Ce répertoire est vide</Text>
          </View>
        )}

        {isLeafFolder && (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('AdminAddResource', { 
              categoryId: parentId,
              categoryName: currentPathName 
            })}
          >
            <FilePlus color="#FFF" size={20} />
            <Text style={styles.actionButtonText}>Ajouter un document</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.topNav}>
        <TouchableOpacity 
          onPress={() => parentId === null ? navigation.goBack() : handleBack()} 
          style={styles.navCircle}
        >
          <ArrowLeft color="#FFF" size={22} />
        </TouchableOpacity>

        <View style={styles.navInfo}>
          <Text style={styles.navSubtitle}>GESTIONNAIRE N{navigationHistory.length + 1}</Text>
          <Text style={styles.navTitle} numberOfLines={1}>Explorateur Cloud</Text>
        </View>

        <TouchableOpacity 
          style={[styles.toggleBtn, viewMode === 'stats' && styles.toggleBtnActive]}
          onPress={() => setViewMode(viewMode === 'list' ? 'stats' : 'list')}
        >
          {viewMode === 'list' ? <PieChart color="#FFF" size={20} /> : <LayoutList color="#FFF" size={20} />}
        </TouchableOpacity>
      </View>

      {loading && items.categories.length === 0 && items.resources.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        viewMode === 'list' ? renderListView() : renderStatsView()
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  topNav: { flexDirection: 'row', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#1E293B' },
  navCircle: { backgroundColor: '#1E293B', padding: 10, borderRadius: 14 },
  navInfo: { flex: 1, marginLeft: 15 },
  navSubtitle: { color: COLORS.primary, fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  navTitle: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  toggleBtn: { backgroundColor: '#1E293B', padding: 10, borderRadius: 12 },
  toggleBtnActive: { backgroundColor: COLORS.primary },
  
  listContent: { padding: 20 },
  breadCrumb: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#0F172A', padding: 12, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: '#1E293B' },
  breadCrumbText: { color: '#94A3B8', fontSize: 12, fontWeight: '600' },
  
  itemRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F172A', padding: 15, borderRadius: 20, marginBottom: 12, borderWidth: 1, borderColor: '#1E293B' },
  iconWrapper: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  itemMeta: { flex: 1, marginLeft: 15 },
  itemTitle: { color: '#F1F5F9', fontWeight: '700', fontSize: 15 },
  itemSub: { color: '#475569', fontSize: 11, marginTop: 2, fontWeight: '600' },
  
  actionButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: COLORS.primary, height: 60, borderRadius: 20, marginTop: 20 },
  actionButtonText: { color: '#FFF', fontWeight: '900', fontSize: 15, textTransform: 'uppercase' },
  
  storageHero: { backgroundColor: COLORS.primary, padding: 25, borderRadius: 28, flexDirection: 'row', alignItems: 'center', gap: 20, margin: 20 },
  storageText: { flex: 1 },
  storageMain: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  storageSub: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 4 },
  progressBarBg: { height: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3, marginTop: 15 },
  progressBarFill: { height: 6, backgroundColor: '#FFF', borderRadius: 3 },
  
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 10, justifyContent: 'space-between' },
  statBox: { width: '47%', backgroundColor: '#0F172A', padding: 20, borderRadius: 24, alignItems: 'center', marginBottom: 15, borderWidth: 1, borderColor: '#1E293B' },
  statCircle: { width: 60, height: 60, borderRadius: 30, borderWidth: 3, borderColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  statValue: { color: '#FFF', fontWeight: '900' },
  statLabel: { color: '#94A3B8', marginTop: 10, fontWeight: '700', fontSize: 12 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyState: { alignItems: 'center', marginTop: 80 },
  emptyText: { color: '#334155', marginTop: 15, fontStyle: 'italic' }
});