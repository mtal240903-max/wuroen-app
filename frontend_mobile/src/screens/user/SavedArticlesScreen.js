import React, { useState, useCallback, useContext } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, StatusBar
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { COLORS } from '../../theme/theme';
import { Bookmark, ChevronRight, BookOpen, Heart, Eye } from 'lucide-react-native';

export default function SavedArticlesScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [savedArticles, setSavedArticles] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSavedArticles = async () => {
    try {
      // ✅ Articles que l'utilisateur a likés = favoris
      const res = await api.get('/articles', { params: { page: 1, limit: 100 } });
      const all = res.data?.articles ?? res.data ?? [];
      // Filtrer ceux que l'user a likés
      const liked = all.filter(a =>
        a.likes?.some(id => id?.toString() === user?._id?.toString())
      );
      setSavedArticles(liked);
    } catch (err) {
      console.error("SavedArticles:", err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchSavedArticles(); }, []));

  if (loading) return (
    <View style={styles.loader}>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <Bookmark size={22} color={COLORS.primary} />
        <Text style={styles.headerTitle}>Articles aimés</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{savedArticles.length}</Text>
        </View>
      </View>

      <FlatList
        data={savedArticles}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchSavedArticles(); }} tintColor={COLORS.primary} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('ArticleDetail', { articleId: item._id })}
          >
            <View style={styles.cardLeft}>
              <View style={styles.iconBox}>
                <BookOpen size={18} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.cardAuthor}>{item.author?.name || 'Auteur'}</Text>
                <View style={styles.cardStats}>
                  <View style={styles.statItem}>
                    <Eye size={11} color="#475569" />
                    <Text style={styles.statText}>{item.views || 0}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Heart size={11} color="#F43F5E" />
                    <Text style={styles.statText}>{item.likes?.length || 0}</Text>
                  </View>
                </View>
              </View>
            </View>
            <ChevronRight size={16} color="#334155" />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ fontSize: 48 }}>🔖</Text>
            <Text style={styles.emptyTitle}>Aucun article aimé</Text>
            <Text style={styles.emptySub}>Les articles que vous aimez apparaîtront ici.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  loader:    { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#020617' },
  header:    { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 20, borderBottomWidth: 1, borderBottomColor: '#1E293B' },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '800', flex: 1 },
  countBadge:  { backgroundColor: COLORS.primary + '20', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  countText:   { color: COLORS.primary, fontWeight: '900', fontSize: 12 },
  list:        { padding: 16, paddingBottom: 40 },
  card:        { backgroundColor: '#0A0F1E', borderRadius: 20, padding: 16, marginBottom: 10, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#1E293B' },
  cardLeft:    { flex: 1, flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  iconBox:     { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.primary + '15', justifyContent: 'center', alignItems: 'center', marginTop: 2 },
  cardTitle:   { color: '#F8FAFC', fontSize: 14, fontWeight: '700', lineHeight: 20 },
  cardAuthor:  { color: '#475569', fontSize: 12, marginTop: 4 },
  cardStats:   { flexDirection: 'row', gap: 12, marginTop: 6 },
  statItem:    { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText:    { color: '#475569', fontSize: 11 },
  empty:       { alignItems: 'center', paddingTop: 80 },
  emptyTitle:  { color: '#FFF', fontSize: 16, fontWeight: '800', marginTop: 16 },
  emptySub:    { color: '#475569', fontSize: 13, marginTop: 8, textAlign: 'center' },
});