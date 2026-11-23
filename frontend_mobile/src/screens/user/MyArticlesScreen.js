import React, { useState, useContext, useCallback } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  ActivityIndicator, RefreshControl, Alert 
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../services/api'; 
import { AuthContext } from '../../context/AuthContext';
import { COLORS } from '../../theme/theme';
import { FileText, ChevronRight, Clock, CheckCircle, XCircle, Plus, Trash2 } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ─────────────────────────────────────────────────────────────
// COMPOSANT COMPOSITE INTERNE : CARTE ARTICLE (OPTIMISÉ MÉMOIRE)
// ─────────────────────────────────────────────────────────────
const ArticleCard = React.memo(({ item, navigation, onDelete, getStatusBadge }) => {
  const currentId = item._id || item.id;
  const itemDate = item.createdAt ? new Date(item.createdAt).toLocaleDateString('fr-FR') : "Date inconnue";

  return (
    <View style={styles.cardContainer}>
      <TouchableOpacity 
        style={styles.card}
        onPress={() => navigation.navigate('ArticleDetail', { articleId: currentId })}
        activeOpacity={0.7}
      >
        <View style={styles.cardContent}>
          <View style={styles.textSection}>
            <Text style={styles.category}>{item.category || "PRODUCTION ANIMALE"}</Text>
            <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
            <View style={styles.footer}>
              {getStatusBadge(item.status || 'published')}
              <Text style={styles.date}>{itemDate}</Text>
            </View>
          </View>
          <ChevronRight size={16} color={COLORS.primary || '#00AEEF'} />
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.deleteAction} onPress={() => onDelete(currentId)}>
        <Trash2 size={16} color="#EF4444" />
      </TouchableOpacity>
    </View>
  );
});

// ─────────────────────────────────────────────────────────────
// ÉCRAN DES PUBLICATIONS PERSONNELLES
// ─────────────────────────────────────────────────────────────
export default function MyArticlesScreen({ navigation }) {
  const { userToken } = useContext(AuthContext);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 📥 Récupération synchronisée avec la route '/articles/my'
  const fetchMyArticles = async () => {
    try {
      const response = await api.get('/articles/my');
      const data = Array.isArray(response.data) ? response.data : (response.data.articles || []);
      setArticles(data);
    } catch (error) {
      // Les erreurs verbeuses sont masquées ici pour la mise en production.
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchMyArticles();
    }, [])
  );

  // ⚔️ Demande de confirmation de suppression
  const handleDelete = useCallback((articleId) => {
    if (!articleId) return;
    
    Alert.alert(
      "Retirer la publication",
      "Êtes-vous sûr de vouloir détruire cette archive du terminal Wuro'en ?",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Supprimer", 
          style: "destructive", 
          onPress: async () => {
            try {
              await api.delete(`/articles/${articleId}`);
              setArticles(prev => prev.filter(a => a._id !== articleId && a.id !== articleId));
            } catch (err) {
              Alert.alert("Action Refusée", "Le serveur a rejeté la commande de destruction.");
            }
          }
        }
      ]
    );
  }, []);

  // 🏷️ Badge d'état dynamique
  const getStatusBadge = useCallback((status) => {
    switch (status?.toLowerCase()) {
      case 'published': 
      case 'publié':
        return (
          <View style={[styles.badge, { backgroundColor: 'rgba(16, 185, 129, 0.06)', borderColor: 'rgba(16, 185, 129, 0.2)' }]}>
            <CheckCircle size={12} color="#10B981" />
            <Text style={[styles.badgeText, { color: '#10B981' }]}>Publié</Text>
          </View>
        );
      case 'pending': 
      case 'en revue':
        return (
          <View style={[styles.badge, { backgroundColor: 'rgba(245, 158, 11, 0.06)', borderColor: 'rgba(245, 158, 11, 0.2)' }]}>
            <Clock size={12} color="#F59E0B" />
            <Text style={[styles.badgeText, { color: '#F59E0B' }]}>En revue</Text>
          </View>
        );
      case 'rejected': 
      case 'refusé':
        return (
          <View style={[styles.badge, { backgroundColor: 'rgba(239, 68, 68, 0.06)', borderColor: 'rgba(239, 68, 68, 0.2)' }]}>
            <XCircle size={12} color="#EF4444" />
            <Text style={[styles.badgeText, { color: '#EF4444' }]}>Refusé</Text>
          </View>
        );
      default: return null;
    }
  }, []);

  const renderItem = useCallback(({ item }) => (
    <ArticleCard 
      item={item} 
      navigation={navigation} 
      onDelete={handleDelete} 
      getStatusBadge={getStatusBadge} 
    />
  ), [navigation, handleDelete, getStatusBadge]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>// VOS PUBLICATIONS</Text>
        <TouchableOpacity 
          style={styles.addBtn}
          onPress={() => navigation.navigate('CreateArticle')}
        >
          <Plus color="#020617" size={20} />
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary || '#00AEEF'} />
          <Text style={styles.cyberLoadingText}>CHARGEMENT DU FLUX DOCUMENTAIRE...</Text>
        </View>
      ) : (
        <FlatList
          data={articles}
          keyExtractor={(item) => item._id || item.id || Math.random().toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listPadding}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={() => { setRefreshing(true); fetchMyArticles(); }} 
              tintColor={COLORS.primary || '#00AEEF'}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <FileText size={32} color={COLORS.primary || '#00AEEF'} />
              </View>
              <Text style={styles.emptyTitle}>BASE DE DONNÉES VIDE</Text>
              <Text style={styles.emptySub}>Aucun rapport scientifique ou article n'a été téléversé depuis ce terminal.</Text>
              <TouchableOpacity 
                style={styles.createBtn}
                onPress={() => navigation.navigate('CreateArticle')}
              >
                <Text style={styles.createBtnText}>INITIALISER UNE RÉDACTION</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 15 
  },
  headerTitle: { fontSize: 14, fontWeight: '900', color: '#475569', letterSpacing: 1.5 },
  addBtn: { backgroundColor: COLORS.primary || '#00AEEF', padding: 10, borderRadius: 12 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  cyberLoadingText: { color: '#64748B', marginTop: 16, fontSize: 11, fontWeight: '800', letterSpacing: 2 },
  listPadding: { padding: 20, paddingBottom: 100 },
  cardContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 4 },
  card: { 
    flex: 1,
    backgroundColor: '#0F172A', 
    borderRadius: 16, 
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  deleteAction: { 
    width: 44, height: 44, 
    backgroundColor: 'rgba(239, 68, 68, 0.03)', 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.15)',
    marginLeft: 8
  },
  cardContent: { flexDirection: 'row', alignItems: 'center' },
  textSection: { flex: 1, marginRight: 10 },
  category: { fontSize: 9, color: COLORS.primary || '#00AEEF', fontWeight: '800', marginBottom: 6, letterSpacing: 1 },
  title: { fontSize: 15, fontWeight: '800', color: '#FFF', marginBottom: 12, lineHeight: 22, letterSpacing: -0.2 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  date: { fontSize: 11, color: '#475569', fontWeight: '700' },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, gap: 4, borderWidth: 1 },
  badgeText: { fontSize: 9, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.5 },
  emptyContainer: { alignItems: 'center', marginTop: 80, paddingHorizontal: 20 },
  emptyIconCircle: { width: 70, height: 70, borderRadius: 24, backgroundColor: 'rgba(0, 174, 239, 0.03)', justifyContent: 'center', alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: 'rgba(0, 174, 239, 0.1)' },
  emptyTitle: { fontSize: 14, fontWeight: '900', color: '#FFF', letterSpacing: 1 },
  emptySub: { fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 20, marginTop: 8 },
  createBtn: { marginTop: 30, backgroundColor: '#0F172A', paddingVertical: 14, paddingHorizontal: 25, borderRadius: 14, borderWidth: 1, borderColor: '#1E293B' },
  createBtnText: { color: '#FFF', fontWeight: '800', fontSize: 12, letterSpacing: 1 }
});