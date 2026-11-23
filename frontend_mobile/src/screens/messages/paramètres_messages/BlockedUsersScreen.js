import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ShieldAlert, Search, X } from 'lucide-react-native';

export default function BlockedUsersScreen({ navigation }) {
  // 1. Données brutes (à remplacer plus tard par un appel API)
  const [blockedList, setBlockedList] = useState([
    { id: '1', name: 'Inconnu Spam', reason: 'Spam publicitaire' },
    { id: '2', name: 'Jean Expert', reason: 'Comportement inapproprié' },
    { id: '3', name: 'Alpha Test', reason: 'Harcèlement' },
  ]);

  // 2. État pour la recherche
  const [searchQuery, setSearchQuery] = useState('');

  // 3. Filtrage dynamique
  const filteredData = useMemo(() => {
    return blockedList.filter(user => 
      user.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, blockedList]);

  const handleUnblock = (id) => {
    // Logique pour débloquer (API call ici)
    setBlockedList(prev => prev.filter(user => user.id !== id));
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header avec Barre de Recherche */}
      <View style={styles.headerContainer}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Contacts Bloqués</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Barre de recherche style MTaL */}
        <View style={styles.searchBarWrapper}>
          <Search size={18} color="#64748B" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un contact..."
            placeholderTextColor="#64748B"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={18} color="#64748B" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {filteredData.length === 0 ? (
        <View style={styles.emptyState}>
          <ShieldAlert size={60} color="#1E293B" />
          <Text style={styles.emptyText}>
            {searchQuery ? "Aucun résultat trouvé." : "Aucun contact bloqué."}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 20 }}
          renderItem={({ item }) => (
            <View style={styles.blockedCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.userName}>{item.name}</Text>
                <Text style={styles.reasonText}>{item.reason}</Text>
              </View>
              <TouchableOpacity 
                style={styles.unblockBtn}
                onPress={() => handleUnblock(item.id)}
              >
                <Text style={styles.unblockText}>Débloquer</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  headerContainer: { paddingHorizontal: 20, paddingBottom: 10 },
  headerTop: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingVertical: 15 
  },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  
  // Style Barre de recherche
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
    height: 45
  },
  searchIcon: { marginRight: 10 },
  searchInput: { 
    flex: 1, 
    color: '#FFF', 
    fontSize: 14,
    height: '100%'
  },

  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#475569', marginTop: 15, fontSize: 16 },
  blockedCard: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: '#0F172A', 
    padding: 16, 
    borderRadius: 15, 
    marginBottom: 12, 
    borderWidth: 1, 
    borderColor: '#1E293B' 
  },
  userName: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  reasonText: { color: '#EF4444', fontSize: 12, marginTop: 2 },
  unblockBtn: { 
    backgroundColor: '#1E293B', 
    paddingHorizontal: 15, 
    paddingVertical: 8, 
    borderRadius: 10,
    marginLeft: 10
  },
  unblockText: { color: '#FFF', fontSize: 13, fontWeight: '600' }
});