import React, { useState, useEffect, useCallback, useRef, useContext } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, Alert, StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../../../context/AuthContext';
import { CheckCircle, Clock, User, FileText, ChevronRight, Filter } from 'lucide-react-native';
import { COLORS } from '../../../theme/theme';
import api from '../../../services/api';

export default function ModerationScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [pendingArticles, setPendingArticles] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const isMounted = useRef(true);

  const fetchAssignedArticles = useCallback(async () => {
    try {
      // ✅ Route sécurisée : uniquement les articles assignés à CE modérateur
      const res = await api.get('/moderator/my-assignments');
      if (isMounted.current) setPendingArticles(res.data ?? []);
    } catch (err) {
      console.error("Modération:", err.response?.status, err.message);
      if (isMounted.current) {
        if (err.response?.status === 403) {
          Alert.alert("Accès refusé", "Votre rôle ne permet pas l'accès à la modération.");
        } else {
          Alert.alert("Erreur", "Impossible de charger vos assignations.");
        }
      }
    } finally {
      if (isMounted.current) { setLoading(false); setRefreshing(false); }
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    fetchAssignedArticles();
    return () => { isMounted.current = false; };
  }, [fetchAssignedArticles]);

  const renderArticleItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ArticleDetailReview', { articleId: item._id })}
      activeOpacity={0.85}
    >
      <View style={styles.cardHeader}>
        <View style={styles.titleArea}>
          <Text style={styles.articleTitle} numberOfLines={2}>{item.title}</Text>
          <View style={styles.statusBadge}>
            <Clock size={10} color="#F59E0B" />
            <Text style={styles.statusText}>EN ATTENTE DE RÉVISION</Text>
          </View>
        </View>
        <ChevronRight size={18} color="#475569" />
      </View>

      <View style={styles.infoGrid}>
        <View style={styles.infoRow}>
          <User size={14} color={COLORS.primary} />
          <Text style={styles.infoLabel}>{item.author?.name || 'Auteur inconnu'}</Text>
        </View>
        <View style={styles.infoRow}>
          <FileText size={14} color="#64748B" />
          <Text style={styles.infoLabel}>{item.category || 'Recherche générale'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Clock size={14} color="#64748B" />
          <Text style={styles.infoLabel}>
            Soumis le {new Date(item.createdAt).toLocaleDateString('fr-FR')}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <View>
          <Text style={styles.headerSub}>TABLEAU DE RÉVISION</Text>
          <Text style={styles.headerTitle}>Mes Assignations</Text>
        </View>
        <TouchableOpacity style={styles.filterBtn}>
          <Filter size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsBar}>
        <Text style={styles.statsText}>
          {pendingArticles.length > 0
            ? `${pendingArticles.length} article${pendingArticles.length > 1 ? 's' : ''} à réviser`
            : "Aucune assignation en cours"}
        </Text>
      </View>

      <FlatList
        data={pendingArticles}
        keyExtractor={(item) => item._id}
        renderItem={renderArticleItem}
        contentContainerStyle={styles.listPadding}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchAssignedArticles(); }}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyCircle}>
              <CheckCircle size={40} color={COLORS.primary} />
            </View>
            <Text style={styles.emptyTitle}>Rien à réviser</Text>
            <Text style={styles.emptySub}>
              L'admin vous assignera des articles selon votre spécialité.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#020617' },
  center:      { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#020617' },
  header:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 10 },
  headerSub:   { color: COLORS.primary, fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#FFF', marginTop: 4 },
  filterBtn:   { backgroundColor: '#1E293B', padding: 10, borderRadius: 12 },
  statsBar:    { marginHorizontal: 20, marginBottom: 15, backgroundColor: '#0F172A', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#1E293B' },
  statsText:   { color: '#94A3B8', fontSize: 12, fontWeight: '700', textAlign: 'center' },
  listPadding: { paddingHorizontal: 20, paddingBottom: 40 },
  card:        { backgroundColor: '#0F172A', borderRadius: 24, padding: 20, marginBottom: 15, borderWidth: 1, borderColor: '#1E293B' },
  cardHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  titleArea:   { flex: 1 },
  articleTitle:{ color: '#F8FAFC', fontSize: 16, fontWeight: '800', marginBottom: 8 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F59E0B15', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start', gap: 6 },
  statusText:  { color: '#F59E0B', fontSize: 9, fontWeight: '900' },
  infoGrid:    { marginTop: 15, gap: 10, backgroundColor: '#020617', padding: 15, borderRadius: 16 },
  infoRow:     { flexDirection: 'row', alignItems: 'center', gap: 12 },
  infoLabel:   { color: '#94A3B8', fontSize: 13, fontWeight: '600' },
  emptyContainer: { alignItems: 'center', marginTop: 100, padding: 20 },
  emptyCircle:    { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primary + '15', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyTitle:     { color: '#FFF', fontSize: 18, fontWeight: '800' },
  emptySub:       { color: '#475569', textAlign: 'center', marginTop: 8, fontSize: 13, lineHeight: 20 },
});