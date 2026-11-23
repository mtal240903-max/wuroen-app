import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Check, Users, Search, X } from 'lucide-react-native'; // Ajout de Search et X
import { COLORS } from '../../../theme/theme';
import api from '../../../services/api';

export default function CreateGroupScreen({ navigation }) {
  const [groupName, setGroupName] = useState('');
  const [searchQuery, setSearchQuery] = useState(''); // État pour la recherche
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/messages/inbox'); 
      const list = response.data.map(item => ({
        id: item.contact._id,
        name: item.contact.name,
        role: item.contact.specialty || 'Expert'
      }));
      setContacts(list);
    } catch (error) {
      console.error("Erreur contacts:", error);
      Alert.alert("Erreur", "Impossible de charger vos contacts.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  // 🔍 Logique de filtrage en temps réel
  const filteredContacts = useMemo(() => {
    return contacts.filter(contact => 
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.role.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, contacts]);

  const toggleUser = (id) => {
    setSelectedUsers(prev => 
      prev.includes(id) ? prev.filter(u => u !== id) : [...prev, id]
    );
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) return;
    try {
      setCreating(true);
      const response = await api.post('/groups/create', {
        name: groupName,
        members: selectedUsers,
        description: `Groupe de discussion : ${groupName}`
      });

      if (response.status === 201) {
        Alert.alert("Succès", "Le groupe a été créé !");
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert("Erreur", "Le serveur a rencontré un problème.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nouveau Groupe</Text>
        <TouchableOpacity 
          disabled={!groupName || selectedUsers.length < 2 || creating}
          onPress={handleCreateGroup}
        >
          {creating ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <Text style={[styles.createBtn, { opacity: (groupName && selectedUsers.length >= 2) ? 1 : 0.5 }]}>Créer</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Group Name Input */}
      <View style={styles.inputSection}>
        <View style={styles.iconCircle}>
          <Users size={28} color={COLORS.primary} />
        </View>
        <TextInput
          style={styles.input}
          placeholder="Nom du groupe..."
          placeholderTextColor="#64748B"
          value={groupName}
          onChangeText={setGroupName}
        />
      </View>

      {/* 🔍 Barre de Recherche des Membres */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={18} color="#64748B" style={{ marginRight: 10 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un membre..."
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

      <Text style={styles.sectionLabel}>Membres suggérés ({selectedUsers.length})</Text>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={filteredContacts}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.userCard} onPress={() => toggleUser(item.id)}>
              <View style={styles.userAvatar}>
                <Text style={styles.avatarText}>{item.name[0]}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 15 }}>
                <Text style={styles.userName}>{item.name}</Text>
                <Text style={styles.userRole}>{item.role}</Text>
              </View>
              <View style={[styles.checkbox, selectedUsers.includes(item.id) && styles.checkboxActive]}>
                {selectedUsers.includes(item.id) && <Check size={14} color="#FFF" />}
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {searchQuery ? "Aucun membre ne correspond à votre recherche." : "Aucun contact disponible."}
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  createBtn: { color: COLORS.primary, fontWeight: '700', fontSize: 16 },
  
  // Nom du groupe
  inputSection: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: '#0F172A', marginHorizontal: 20, marginTop: 10, borderRadius: 20 },
  iconCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#1E293B', justifyContent: 'center', alignItems: 'center' },
  input: { flex: 1, marginLeft: 15, color: '#FFF', fontSize: 16 },

  // Barre de recherche
  searchContainer: { paddingHorizontal: 20, marginTop: 20, marginBottom: 10 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', borderRadius: 12, paddingHorizontal: 15, height: 45 },
  searchInput: { flex: 1, color: '#FFF', fontSize: 14 },

  sectionLabel: { color: '#475569', fontSize: 12, fontWeight: '900', textTransform: 'uppercase', marginHorizontal: 25, marginBottom: 15, marginTop: 10 },
  userCard: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 25, paddingVertical: 12 },
  userAvatar: { width: 45, height: 45, borderRadius: 12, backgroundColor: '#1E293B', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#FFF', fontWeight: '800' },
  userName: { color: '#FFF', fontSize: 15, fontWeight: '600' },
  userRole: { color: '#64748B', fontSize: 12 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#1E293B', justifyContent: 'center', alignItems: 'center' },
  checkboxActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  emptyText: { color: '#475569', textAlign: 'center', marginTop: 30, paddingHorizontal: 40 },
});