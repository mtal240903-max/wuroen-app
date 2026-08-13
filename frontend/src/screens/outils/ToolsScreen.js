import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../theme/theme';
import { Wrench, ExternalLink, ShieldCheck, Search, Filter } from 'lucide-react-native';

const TOOLS_DATA = [
  {
    id: '1',
    title: 'PA (Production Animale)',
    description: 'SaaS de formulation d’aliments et gestion d’élevage.',
    category: 'Agro-Tech',
    status: 'Disponible',
    link: 'https://pa-app.example.com',
    badge: 'Réservé membres'
  },
  {
    id: '2',
    title: 'EduKaya',
    description: 'Plateforme de révision académique pour étudiants africains.',
    category: 'Éducation',
    status: 'Disponible',
    link: 'https://edukaya.example.com',
    badge: 'Premium'
  },
  {
    id: '3',
    title: 'FestiVox',
    description: 'Gestion et médiation culturelle pour les festivals.',
    category: 'Culture',
    status: 'Bientôt disponible',
    link: '#',
    badge: 'À venir'
  },
  {
    id: '4',
    title: 'Gorko\'s AI',
    description: 'Réseau social et assistants conversationnels intégrés.',
    category: 'Intelligence Artificielle',
    status: 'En développement',
    link: '#',
    badge: 'Beta'
  }
];

export default function ToolsScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');

  const categories = ['Tous', 'Agro-Tech', 'Éducation', 'Culture', 'Intelligence Artificielle'];

  const filteredTools = TOOLS_DATA.filter(tool => {
    const matchesSearch = tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Tous' || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Disponible': return '#10B981';
      case 'Bientôt disponible': return '#F59E0B';
      case 'En développement': return '#00A3FF';
      default: return '#64748B';
    }
  };

  const renderToolItem = ({ item }) => (
    <View style={styles.toolCard}>
      <View style={styles.toolHeader}>
        <View style={styles.iconBox}>
          <Wrench color={COLORS.primary} size={22} />
        </View>
        <View style={styles.badgeContainer}>
          <ShieldCheck color="#10B981" size={14} />
          <Text style={styles.badgeText}>{item.badge}</Text>
        </View>
      </View>

      <Text style={styles.toolTitle}>{item.title}</Text>
      <Text style={styles.toolDesc}>{item.description}</Text>

      <View style={styles.metaRow}>
        <Text style={styles.categoryText}>{item.category}</Text>
        <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
        <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
      </View>

      <TouchableOpacity 
        style={[styles.accessButton, item.status !== 'Disponible' && styles.disabledButton]}
        onPress={() => item.status === 'Disponible' && Linking.openURL(item.link)}
        disabled={item.status !== 'Disponible'}
        activeOpacity={0.8}
      >
        <Text style={styles.accessButtonText}>
          {item.status === 'Disponible' ? "Ouvrir l'application" : item.status}
        </Text>
        {item.status === 'Disponible' && <ExternalLink color="#FFF" size={16} />}
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Boîte à Outils Écosystème</Text>
        <Text style={styles.subtitle}>Découvrez les applications connectées développées par MTAL</Text>
      </View>

      <View style={styles.searchContainer}>
        <Search color="#64748B" size={18} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un outil..."
          placeholderTextColor="#64748B"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.filterWrapper}>
        <FlatList
          horizontal
          data={categories}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[styles.filterChip, selectedCategory === item && styles.activeChip]}
              onPress={() => setSelectedCategory(item)}
            >
              <Text style={[styles.filterText, selectedCategory === item && styles.activeFilterText]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <FlatList
        data={filteredTools}
        keyExtractor={(item) => item.id}
        renderItem={renderToolItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  header: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#1E293B' },
  title: { fontSize: 22, fontWeight: '900', color: '#F8FAFC' },
  subtitle: { fontSize: 12, color: '#64748B', marginTop: 4 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F172A', margin: 20, marginBottom: 10, paddingHorizontal: 15, borderRadius: 12, borderWidth: 1, borderColor: '#1E293B', height: 48 },
  searchInput: { flex: 1, color: '#F8FAFC', marginLeft: 10, fontSize: 14 },
  filterWrapper: { marginBottom: 10 },
  filterContainer: { paddingHorizontal: 20, gap: 8 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#0F172A', borderWidth: 1, borderColor: '#1E293B', height: 36, justifyContent: 'center' },
  activeChip: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterText: { color: '#94A3B8', fontSize: 12, fontWeight: '700' },
  activeFilterText: { color: '#FFF' },
  listContainer: { padding: 20, paddingTop: 10 },
  toolCard: { backgroundColor: '#0F172A', borderRadius: 20, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: '#1E293B' },
  toolHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  iconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(0,163,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  badgeContainer: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(16, 185, 129, 0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { color: '#10B981', fontSize: 10, fontWeight: '700' },
  toolTitle: { fontSize: 18, fontWeight: '800', color: '#F8FAFC', marginBottom: 6 },
  toolDesc: { fontSize: 13, color: '#94A3B8', marginBottom: 15, lineHeight: 18 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, gap: 8 },
  categoryText: { fontSize: 11, color: '#64748B', fontWeight: '700', backgroundColor: '#1E293B', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '700' },
  accessButton: { backgroundColor: COLORS.primary, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 14, borderRadius: 12, gap: 8 },
  disabledButton: { backgroundColor: '#1E293B' },
  accessButtonText: { color: '#FFF', fontSize: 14, fontWeight: '700' }
});