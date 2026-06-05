import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, ActivityIndicator, StatusBar, Keyboard
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Search, UserPlus, CheckCircle2, X } from 'lucide-react-native';
import api from '../../services/api'; 
import { COLORS } from '../../theme/theme';

export default function SearchUsersScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const searchTimer = useRef(null);

  const handleSearch = (text) => {
    setQuery(text);
    if (searchTimer.current) clearTimeout(searchTimer.current);

    if (text.trim().length < 2) {
      setUsers([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    searchTimer.current = setTimeout(() => {
      executeSearch(text);
    }, 400);
  };

  const executeSearch = async (text) => {
    try {
      // MISE À JOUR : Route '/users/search' et paramètre 'q' pour coller au backend
      const response = await api.get('/users/search', {
        params: { q: text.trim() }
      });
      
      // Tri par importance des rôles
      const sortedUsers = response.data.sort((a, b) => {
        const rolesOrder = { 'superadmin': 1, 'admin': 2, 'user': 3 };
        return (rolesOrder[a.role] || 4) - (rolesOrder[b.role] || 4);
      });
      
      setUsers(sortedUsers);
    } catch (error) {
      console.error("Erreur recherche:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setUsers([]);
    setLoading(false);
  };

  const renderUserItem = ({ item }) => (
    <TouchableOpacity
      style={styles.userCard}
      activeOpacity={0.7}
      onPress={() => {
        Keyboard.dismiss();
        navigation.navigate('ChatDetail', { 
          chatId: item._id, 
          userName: item.name,
          isGroup: false 
        });
      }}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.name ? item.name[0].toUpperCase() : '?'}</Text>
      </View>
      <View style={styles.userInfo}>
        <View style={styles.nameRow}>
          <Text style={styles.userName} numberOfLines={1}>{item.name}</Text>
          {(item.role === 'admin' || item.role === 'superadmin') && (
            <CheckCircle2 size={14} color={COLORS.primary} style={{ marginLeft: 6 }} />
          )}
        </View>
        {/* MISE À JOUR : On affiche la spécialité ou le rôle */}
        <Text style={styles.userRole}>{item.specialty || item.role || "Collaborateur MTaL"}</Text>
      </View>
      <View style={styles.actionIcon}>
        <UserPlus size={18} color={COLORS.primary} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#FFF" />
        </TouchableOpacity>
        
        <View style={styles.searchContainer}>
          <Search size={18} color="#64748B" style={styles.searchIcon} />
          <TextInput
            style={styles.input}
            placeholder="Rechercher un expert..."
            placeholderTextColor="#64748B"
            autoFocus={true}
            value={query}
            onChangeText={handleSearch}
            selectionColor={COLORS.primary}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={{ padding: 4 }}>
              <X size={18} color="#64748B" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingSub}>Consultation de l'annuaire...</Text>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item._id}
          renderItem={renderUserItem}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            query.length > 1 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Aucun résultat pour "{query}"</Text>
                <Text style={styles.emptySub}>Essayez avec un nom de famille ou une spécialité.</Text>
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptySub}>Entrez au moins 2 caractères pour lancer la recherche.</Text>
              </View>
            )
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
    alignItems: 'center', 
    padding: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: '#1E293B' 
  },
  backBtn: { marginRight: 12 },
  searchContainer: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#0F172A', 
    borderRadius: 12, 
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
    height: 46
  },
  searchIcon: { marginRight: 8 },
  input: { flex: 1, color: '#FFF', fontSize: 15 },
  list: { padding: 16, paddingBottom: 40 },
  userCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#0F172A', 
    padding: 12, 
    borderRadius: 20, 
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1E293B'
  },
  avatar: { 
    width: 50, 
    height: 50, 
    borderRadius: 18, 
    backgroundColor: '#1E293B', 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)'
  },
  avatarText: { color: COLORS.primary, fontWeight: '900', fontSize: 20 },
  userInfo: { flex: 1, marginLeft: 14 },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  userName: { color: '#F8FAFC', fontSize: 16, fontWeight: '700' },
  userRole: { color: '#64748B', fontSize: 12, marginTop: 2 },
  actionIcon: { backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: 10, borderRadius: 14 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingSub: { color: '#64748B', marginTop: 12, fontSize: 13 },
  emptyContainer: { alignItems: 'center', marginTop: 80, paddingHorizontal: 40 },
  emptyText: { color: '#F8FAFC', textAlign: 'center', fontSize: 15, fontWeight: '600' },
  emptySub: { color: '#475569', textAlign: 'center', marginTop: 8, fontSize: 13, lineHeight: 20 }
});