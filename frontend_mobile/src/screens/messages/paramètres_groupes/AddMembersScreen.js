import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { ChevronLeft, Search, CheckCircle2, Circle } from 'lucide-react-native';
import { COLORS } from '../../../theme/theme';
import api from '../../../services/api'; // Assurez-vous que le chemin est correct

export default function AddMembersScreen({ route, navigation }) {
  const { groupId } = route.params; // On récupère le groupId passé en paramètre
  const [selectedIds, setSelectedIds] = useState([]);
  const [search, setSearch] = useState('');
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Charger les collaborateurs depuis l'API
  useEffect(() => {
    const fetchCollaborators = async () => {
      try {
        // Remplacez par votre endpoint réel, ex: '/users/contacts' ou '/groups/suggestions'
        const response = await api.get('/users/collaborators'); 
        setMembers(response.data);
      } catch (error) {
        Alert.alert("Erreur", "Impossible de charger la liste des collaborateurs.");
      } finally {
        setLoading(false);
      }
    };
    fetchCollaborators();
  }, []);

  const toggleSelection = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleConfirm = async () => {
    if (selectedIds.length === 0) return navigation.goBack();

    try {
      // Appel API pour ajouter les membres au groupe
      await api.post(`/groups/${groupId}/add-members`, { userIds: selectedIds });
      Alert.alert("Succès", "Membres ajoutés avec succès.");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Erreur", "Impossible d'ajouter les membres.");
    }
  };

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
            <ChevronLeft color="#FFF" size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Inviter des chercheurs</Text>
        <TouchableOpacity onPress={handleConfirm}>
            <Text style={{color: COLORS.primary, fontWeight: 'bold', fontSize: 16}}>OK</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchBar}>
        <Search color="#64748B" size={20} />
        <TextInput 
          placeholder="Chercher un nom..." 
          placeholderTextColor="#475569" 
          style={styles.input}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <Text style={styles.sectionLabel}>Collaborateurs disponibles</Text>
      
      {loading ? (
        <ActivityIndicator size="small" color={COLORS.primary} style={{ marginTop: 20 }} />
      ) : (
        <FlatList 
          data={filteredMembers}
          keyExtractor={item => item.id || item._id}
          renderItem={({ item }) => {
            const isSelected = selectedIds.includes(item.id || item._id);
            return (
              <TouchableOpacity style={styles.memberItem} onPress={() => toggleSelection(item.id || item._id)}>
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{item.name}</Text>
                  <Text style={styles.memberSpecialty}>{item.specialty || 'Chercheur'}</Text>
                </View>
                {isSelected ? (
                  <CheckCircle2 color={COLORS.primary} size={24} />
                ) : (
                  <Circle color="#475569" size={24} />
                )}
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Vos styles restent identiques...
  container: { flex: 1, backgroundColor: '#020617' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 50, marginBottom: 20 },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F172A', marginHorizontal: 20, paddingHorizontal: 15, borderRadius: 12, height: 50 },
  input: { flex: 1, marginLeft: 10, color: '#FFF' },
  sectionLabel: { color: '#475569', fontSize: 12, fontWeight: 'bold', margin: 20, textTransform: 'uppercase' },
  memberItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#0F172A' },
  memberInfo: { flex: 1 },
  memberName: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  memberSpecialty: { color: '#64748B', fontSize: 13 }
});