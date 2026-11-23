import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, Alert, ActivityIndicator, RefreshControl, StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  FolderPlus, ChevronRight, LayoutGrid, Trash2,
  FolderTree, Home, ChevronLeft
} from 'lucide-react-native';
import { COLORS } from '../../../theme/theme';

// ✅ FIX : api (avec token) au lieu de apiClient (sans token)
import api from '../../../services/api';

export default function AdminLibraryManager() {
  const [name, setName]           = useState('');
  const [level, setLevel]         = useState(1);
  const [parentId, setParentId]   = useState('root');
  const [parentName, setParentName] = useState('Racine');
  const [history, setHistory]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]     = useState(false);
  const [fetching, setFetching]   = useState(false);

  const fetchCurrentLevel = useCallback(async () => {
    setFetching(true);
    try {
      // ✅ FIX : /library/categories/:parentId (route correcte)
      const res = await api.get(`/library/categories/${parentId}`);
      setCategories(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error("Erreur fetch categories:", e.response?.status, e.message);
      Alert.alert("Erreur", e.response?.data?.message || "Impossible de charger les dossiers.");
    } finally {
      setFetching(false);
    }
  }, [parentId]);

  useEffect(() => { fetchCurrentLevel(); }, [fetchCurrentLevel]);

  const handleNavigateDown = (cat) => {
    setHistory([...history, { id: parentId, name: parentName, level }]);
    setParentId(cat._id);
    setParentName(cat.name);
    setLevel(cat.level + 1);
  };

  const handleNavigateUp = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    const newHistory = [...history];
    newHistory.pop();
    setHistory(newHistory);
    setParentId(previous.id);
    setParentName(previous.name);
    setLevel(previous.level);
  };

  const handleCreateCategory = async () => {
    if (!name.trim()) return Alert.alert("Champ requis", "Le nom du dossier est obligatoire.");
    if (level > 5) return Alert.alert("Limite atteinte", "La hiérarchie est limitée à 5 niveaux.");

    setLoading(true);
    try {
      await api.post('/library/categories', {
        name:   name.trim(),
        parent: parentId === 'root' ? null : parentId,
        level
      });
      setName('');
      fetchCurrentLevel();
    } catch (e) {
      Alert.alert("Erreur", e.response?.data?.message || "Échec de la création.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id, catName) => {
    Alert.alert(
      "Suppression",
      `Supprimer "${catName}" et tout son contenu ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/library/categories/${id}`);
              fetchCurrentLevel();
            } catch (e) {
              Alert.alert(
                "Impossible",
                e.response?.data?.message || "Le dossier contient des éléments."
              );
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <FolderTree color="#FFF" size={24} />
          <Text style={styles.headerTitle}>Structure Bibliothèque</Text>
        </View>
        <View style={styles.breadcrumb}>
          <Home color="#FFF" size={14} />
          <ChevronRight color="#FFF" size={14} />
          {history.map((h, i) => (
            <React.Fragment key={i}>
              <Text style={styles.breadcrumbItem}>{h.name}</Text>
              <ChevronRight color="#FFF" size={12} />
            </React.Fragment>
          ))}
          <Text style={styles.breadcrumbCurrent}>{parentName}</Text>
          <View style={styles.levelBadge}>
            <Text style={styles.levelBadgeText}>Niv. {level}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={fetching} onRefresh={fetchCurrentLevel} tintColor={COLORS.primary} />
        }
      >
        {/* FORMULAIRE */}
        <View style={styles.creationCard}>
          <View style={styles.statusRow}>
            <Text style={styles.positionLabel}>
              Dans : <Text style={styles.boldText}>{parentName}</Text>
            </Text>
            {parentId !== 'root' && (
              <TouchableOpacity style={styles.backBtn} onPress={handleNavigateUp}>
                <ChevronLeft size={16} color={COLORS.primary} />
                <Text style={styles.backBtnText}>Retour</Text>
              </TouchableOpacity>
            )}
          </View>

          <TextInput
            style={styles.input}
            placeholder="Nom du nouveau dossier..."
            value={name}
            onChangeText={setName}
            placeholderTextColor="#64748B"
          />

          <TouchableOpacity
            style={[styles.mainBtn, (loading || level > 5) && styles.btnDisabled]}
            onPress={handleCreateCategory}
            disabled={loading || level > 5}
          >
            {loading
              ? <ActivityIndicator color="#FFF" />
              : (
                <>
                  <FolderPlus color="#FFF" size={20} />
                  <Text style={styles.mainBtnText}>Créer le dossier</Text>
                </>
              )
            }
          </TouchableOpacity>
        </View>

        {/* LISTE */}
        <View style={styles.listContainer}>
          <Text style={styles.listTitle}>
            {fetching ? "Chargement..." : `${categories.length} dossier(s)`}
          </Text>

          {categories.map((cat) => (
            <View key={cat._id} style={styles.categoryItem}>
              <TouchableOpacity style={styles.categoryMain} onPress={() => handleNavigateDown(cat)}>
                <View style={styles.folderIcon}>
                  <LayoutGrid color={COLORS.primary} size={18} />
                </View>
                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryName}>{cat.name}</Text>
                  <Text style={styles.categoryMeta}>Niveau {cat.level}</Text>
                </View>
                <ChevronRight color="#334155" size={18} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.deleteArea} onPress={() => handleDelete(cat._id, cat.name)}>
                <Trash2 color="#EF4444" size={18} />
              </TouchableOpacity>
            </View>
          ))}

          {!fetching && categories.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Dossier vide — créez un sous-dossier ci-dessus</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#020617' },
  header:           { backgroundColor: COLORS.primary, paddingHorizontal: 25, paddingTop: 20, paddingBottom: 25, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  headerTop:        { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerTitle:      { color: '#FFF', fontSize: 20, fontWeight: '900' },
  breadcrumb:       { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 5, flexWrap: 'wrap' },
  breadcrumbItem:   { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '600' },
  breadcrumbCurrent:{ color: '#FFF', fontSize: 13, fontWeight: '800' },
  levelBadge:       { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginLeft: 8 },
  levelBadgeText:   { color: '#FFF', fontSize: 10, fontWeight: '800' },

  creationCard:     { backgroundColor: '#0F172A', margin: 20, padding: 20, borderRadius: 24, borderWidth: 1, borderColor: '#1E293B' },
  statusRow:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  positionLabel:    { fontSize: 13, color: '#64748B' },
  boldText:         { fontWeight: '800', color: '#F8FAFC' },
  backBtn:          { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary + '20', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  backBtnText:      { color: COLORS.primary, fontWeight: '700', fontSize: 12, marginLeft: 2 },
  input:            { backgroundColor: '#020617', borderRadius: 12, padding: 15, marginBottom: 15, fontSize: 15, color: '#F8FAFC', borderWidth: 1, borderColor: '#334155' },
  mainBtn:          { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.primary, padding: 15, borderRadius: 15, gap: 10 },
  btnDisabled:      { backgroundColor: '#334155' },
  mainBtnText:      { color: '#FFF', fontWeight: '800', fontSize: 14 },

  listContainer:    { paddingHorizontal: 20 },
  listTitle:        { fontSize: 13, fontWeight: '800', color: '#64748B', marginBottom: 15, paddingLeft: 5, textTransform: 'uppercase', letterSpacing: 1 },
  categoryItem:     { backgroundColor: '#0F172A', borderRadius: 18, marginBottom: 10, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#1E293B', overflow: 'hidden' },
  categoryMain:     { flex: 1, padding: 15, flexDirection: 'row', alignItems: 'center' },
  folderIcon:       { backgroundColor: COLORS.primary + '15', padding: 8, borderRadius: 10, marginRight: 12 },
  categoryInfo:     { flex: 1 },
  categoryName:     { fontWeight: '700', color: '#F8FAFC', fontSize: 15 },
  categoryMeta:     { fontSize: 11, color: '#64748B', marginTop: 2 },
  deleteArea:       { padding: 18, backgroundColor: '#EF444410' },
  emptyState:       { alignItems: 'center', marginTop: 30, padding: 20 },
  emptyText:        { color: '#334155', fontSize: 13, fontWeight: '500', textAlign: 'center' },
});