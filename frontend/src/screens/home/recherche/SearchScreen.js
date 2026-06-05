import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, X, ArrowLeft, User, FileText, BookOpen } from 'lucide-react-native';
import { COLORS } from '../../../theme/theme';

// ✅ FIX : api au lieu de axios + BASE_URL — token injecté automatiquement
import api from '../../../services/api';

export default function SearchScreen({ navigation }) {
  const [query,   setQuery]   = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  // ─── Debounce 400ms ───────────────────────────────────
  useEffect(() => {
    if (query.trim().length > 1) {
      const timer = setTimeout(() => handleSearch(query.trim()), 400);
      return () => clearTimeout(timer);
    } else {
      setResults([]);
      setError(null);
    }
  }, [query]);

  const handleSearch = useCallback(async (q) => {
    setLoading(true);
    setError(null);
    try {
      // ✅ FIX : vraies routes qui existent dans le backend
      // /articles/search et /users/search existent
      // /library/resources/search → on cherche dans les ressources si dispo
      const [usersRes, articlesRes] = await Promise.allSettled([
        api.get('/users/search', { params: { q } }),
        api.get('/articles/search', { params: { q } }),
      ]);

      const users    = usersRes.status    === 'fulfilled' ? (usersRes.value.data    ?? []) : [];
      const articles = articlesRes.status === 'fulfilled' ? (articlesRes.value.data ?? []) : [];

      // ✅ FIX : user.name au lieu de firstName + lastName
      const combined = [
        ...users.map(u    => ({ ...u, _resultType: 'USER' })),
        ...articles.map(a => ({ ...a, _resultType: 'ARTICLE' })),
      ];

      setResults(combined);

      if (combined.length === 0) {
        setError(`Aucun résultat pour "${q}"`);
      }
    } catch (err) {
      setError("Erreur lors de la recherche.");
      console.error("Search:", err.response?.status, err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ─── Render item ──────────────────────────────────────
  const renderItem = ({ item }) => {
    if (item._resultType === 'USER') {
      return (
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('UserProfile', { userId: item._id })}
        >
          <View style={[styles.iconBox, { backgroundColor: COLORS.primary + '20' }]}>
            <User color={COLORS.primary} size={18} />
          </View>
          <View style={{ flex: 1 }}>
            {/* ✅ FIX : item.name au lieu de item.firstName + item.lastName */}
            <Text style={styles.cardTitle}>{item.name || 'Chercheur'}</Text>
            <Text style={styles.cardSub}>{item.specialty || 'Scientifique'} · Chercheur</Text>
          </View>
          {item.isVerified && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✓</Text>
            </View>
          )}
        </TouchableOpacity>
      );
    }

    if (item._resultType === 'ARTICLE') {
      return (
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('ArticleDetail', { articleId: item._id })}
        >
          <View style={[styles.iconBox, { backgroundColor: '#1E293B' }]}>
            <FileText color="#F8FAFC" size={18} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.cardSub} numberOfLines={1}>
              {item.author?.name || 'Auteur'} · Article
            </Text>
          </View>
        </TouchableOpacity>
      );
    }

    // DOC
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('Biblio')}
      >
        <View style={[styles.iconBox, { backgroundColor: '#334155' }]}>
          <BookOpen color="#94A3B8" size={18} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.title || item.name}</Text>
          <Text style={styles.cardSub}>Document · Bibliothèque</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft color="#FFF" size={22} />
        </TouchableOpacity>
        <View style={styles.searchBar}>
          <Search size={16} color="#94A3B8" />
          <TextInput
            placeholder="Chercher un chercheur, article..."
            placeholderTextColor="#475569"
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            autoFocus
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(''); setResults([]); }}>
              <X size={16} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* RÉSULTATS */}
      {loading ? (
        <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item, i) => `${item._resultType}-${item._id || i}`}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            results.length > 0 ? (
              <Text style={styles.countText}>{results.length} résultat{results.length > 1 ? 's' : ''}</Text>
            ) : null
          }
          ListEmptyComponent={
            error ? (
              <Text style={styles.emptyText}>{error}</Text>
            ) : query.length === 0 ? (
              <View style={styles.placeholder}>
                <Search size={48} color="#1E293B" />
                <Text style={styles.placeholderTitle}>Recherche globale</Text>
                <Text style={styles.placeholderSub}>Chercheurs, articles scientifiques...</Text>
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#020617' },
  header:           { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12, borderBottomWidth: 1, borderBottomColor: '#1E293B' },
  backBtn:          { width: 40, height: 40, backgroundColor: '#0F172A', borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#1E293B' },
  searchBar:        { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F172A', borderRadius: 14, paddingHorizontal: 14, height: 46, borderWidth: 1, borderColor: '#1E293B', gap: 10 },
  searchInput:      { flex: 1, color: '#FFF', fontSize: 14 },
  list:             { padding: 16, paddingBottom: 40 },
  countText:        { color: '#475569', fontSize: 12, fontWeight: '700', marginBottom: 12 },
  card:             { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0A0F1E', padding: 14, borderRadius: 16, marginBottom: 10, borderWidth: 1, borderColor: '#1E293B', gap: 14 },
  iconBox:          { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  cardTitle:        { color: '#F8FAFC', fontSize: 14, fontWeight: '700' },
  cardSub:          { color: '#475569', fontSize: 12, marginTop: 2 },
  verifiedBadge:    { backgroundColor: '#10B98120', width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
  verifiedText:     { color: '#10B981', fontSize: 12, fontWeight: '900' },
  emptyText:        { color: '#64748B', textAlign: 'center', marginTop: 40, fontSize: 14 },
  placeholder:      { alignItems: 'center', marginTop: 80 },
  placeholderTitle: { color: '#334155', fontSize: 18, fontWeight: '800', marginTop: 20 },
  placeholderSub:   { color: '#1E293B', fontSize: 13, marginTop: 8 },
});