import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, TextInput, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { ArrowLeft, Plus, Search, X } from 'lucide-react-native';

// Importation de l'instance API centralisée et du contexte d'authentification
import api from '../../../../services/api'; 
import { AuthContext } from '../../../../context/AuthContext'; 

// Composant pour les onglets de filtrage horizontaux
const FilterTab = ({ label, active, onPress }) => (
  <TouchableOpacity onPress={onPress} style={[styles.tabButton, active && styles.tabButtonActive]}>
    <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
  </TouchableOpacity>
);

// Composant pour chaque ligne de projet (Carte)
const ProjectRowCard = ({ title, desc, progress, statusColor, imageUrl, members, onPress }) => (
  <TouchableOpacity activeOpacity={0.9} style={styles.projectCard} onPress={onPress}>
    {imageUrl ? (
      <Image source={{ uri: imageUrl }} style={styles.projectImg} />
    ) : (
      <View style={[styles.projectImg, { backgroundColor: '#1E293B', justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#6366F1', fontWeight: 'bold' }}>W</Text>
      </View>
    )}
    <View style={styles.projectInfo}>
      <View style={styles.projectHeaderRow}>
        <Text style={styles.projectTitle} numberOfLines={1}>{title}</Text>
        <View style={[styles.statusDot, { backgroundColor: statusColor || '#10B981' }]} />
      </View>
      <Text style={styles.projectDesc} numberOfLines={1}>{desc}</Text>
      
      <View style={styles.projectFooter}>
        <View style={styles.avatarStack}>
          {members && members.length > 0 ? (
            members.map((mbr, i) => (
              <Image key={i} source={{ uri: mbr }} style={[styles.stackAvatar, { marginLeft: i > 0 ? -8 : 0 }]} />
            ))
          ) : (
            <View style={styles.stackOverplus}>
              <Text style={styles.overplusText}>Moi</Text>
            </View>
          )}
        </View>
        
        <View style={styles.progressData}>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress || 0}%` }]} />
          </View>
          <Text style={styles.progressPercent}>{progress || 0}%</Text>
        </View>
      </View>
    </View>
  </TouchableOpacity>
);

export default function ProjectsScreen({ route, navigation }) {
  const [currentTab, setCurrentTab] = useState('Tous');
  const [searchQuery, setSearchQuery] = useState('');
  
  // États pour les données de l'API
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Récupération optionnelle d'un companyId si l'écran est ouvert depuis une entreprise spécifique
  const companyId = route?.params?.companyId || null;

  // Fonction pour charger les projets via l'instance Axios centralisée
  const fetchProjects = async () => {
    try {
      setLoading(true);
      
      // Utilisation de l'endpoint adapté selon la présence ou non d'un companyId
      const endpoint = companyId 
        ? `/projects/company/${companyId}`
        : `/projects`;

      const response = await api.get(endpoint);
      
      // Extraction sécurisée des données selon la structure renvoyée par le serveur
      const responseData = response.data;
      const projectsList = responseData.data || responseData.projects || responseData || [];
      
      setProjects(Array.isArray(projectsList) ? projectsList : []);
    } catch (error) {
      console.error("Erreur lors du chargement des projets :", error.response?.data || error.message);
      setProjects([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [companyId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProjects();
  };

  // Filtrage combiné (Onglets + Recherche textuelle)
  const filteredProjects = projects.filter(project => {
    const matchesTab = currentTab === 'Tous' || project.status === currentTab;
    const titleMatch = project.name ? project.name.toLowerCase().includes(searchQuery.toLowerCase()) : false;
    const descMatch = project.description ? project.description.toLowerCase().includes(searchQuery.toLowerCase()) : false;
    const matchesSearch = titleMatch || descMatch;
    return matchesTab && matchesSearch;
  });

  return (
    <View style={styles.container}>
      {/* Barre supérieure (Navbar) */}
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft color="#FFF" size={22} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Projets</Text>
        <TouchableOpacity 
          style={styles.createProjectBtn}
          onPress={() => {
            navigation.navigate('CreateProject', { companyId });
          }}
        >
          <Plus color="#FFF" size={16} style={{ marginRight: 4 }} />
          <Text style={styles.createBtnText}>Nouveau</Text>
        </TouchableOpacity>
      </View>

      {/* Barre de recherche dynamique */}
      <View style={styles.searchContainer}>
        <Search color="#64748B" size={18} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un projet..."
          placeholderTextColor="#64748B"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
            <X color="#94A3B8" size={16} />
          </TouchableOpacity>
        )}
      </View>

      {/* Onglets horizontaux de filtrage */}
      <View style={{ height: 38, marginBottom: 20 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScrollContent}>
          {['Tous', 'En cours', 'Terminé', 'En pause', 'Archivé'].map((tab) => (
            <FilterTab key={tab} label={tab} active={currentTab === tab} onPress={() => setCurrentTab(tab)} />
          ))}
        </ScrollView>
      </View>

      {/* Liste verticale des projets */}
      {loading && !refreshing ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      ) : (
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4F46E5" />}
        >
          {filteredProjects && filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
              <ProjectRowCard 
                key={project._id || project.id}
                title={project.name}
                desc={project.description}
                progress={project.progress}
                statusColor={project.statusColor}
                imageUrl={project.imageUrl}
                members={project.members}
                onPress={() => navigation.navigate('ProjectDetail', { projectId: project._id || project.id, project })} 
              />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Aucun projet ne correspond à votre recherche.</Text>
              <Text style={styles.subEmptyText}>Modifiez les mots-clés ou le filtre d'état.</Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090D1A', paddingTop: 60 },
  navbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 20 },
  backBtn: { width: 36, height: 36, justifyContent: 'center' },
  navTitle: { fontSize: 24, fontWeight: '800', color: '#FFF', flex: 1, marginLeft: 10 },
  createProjectBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#4F46E5', paddingHorizontal: 12, height: 34, borderRadius: 10 },
  createBtnText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111726', borderWidth: 1, borderColor: '#1E293B', borderRadius: 14, marginHorizontal: 20, height: 46, paddingHorizontal: 12, marginBottom: 20 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, color: '#F1F5F9', fontSize: 14, height: '100%' },
  clearBtn: { padding: 4 },

  tabsScrollContent: { paddingHorizontal: 20, alignItems: 'center' },
  tabButton: { paddingHorizontal: 16, height: 32, borderRadius: 16, backgroundColor: '#111726', justifyContent: 'center', marginRight: 8, borderWidth: 1, borderColor: '#1E293B' },
  tabButtonActive: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
  tabLabel: { color: '#94A3B8', fontSize: 13, fontWeight: '500' },
  tabLabelActive: { color: '#FFF', fontWeight: '700' },
  
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingHorizontal: 20, paddingBottom: 120 },
  projectCard: { flexDirection: 'row', backgroundColor: '#111726', borderRadius: 18, padding: 12, marginBottom: 14, borderWidth: 1, borderColor: '#1E293B', alignItems: 'center' },
  projectImg: { width: 70, height: 70, borderRadius: 14, resizeMode: 'cover' },
  projectInfo: { flex: 1, marginLeft: 14, justifyContent: 'center' },
  projectHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  projectTitle: { fontSize: 15, fontWeight: '700', color: '#FFF', maxWidth: '85%' },
  statusDot: { width: 7, height: 7, borderRadius: 3.5 },
  projectDesc: { fontSize: 12, color: '#64748B', marginTop: 3 },
  projectFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  avatarStack: { flexDirection: 'row', alignItems: 'center' },
  stackAvatar: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: '#111726' },
  stackOverplus: { paddingHorizontal: 8, height: 20, borderRadius: 10, backgroundColor: '#1E293B', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  overplusText: { color: '#94A3B8', fontSize: 9, fontWeight: '700' },
  progressData: { flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'flex-end' },
  progressBarBg: { width: 70, height: 4, backgroundColor: '#1E293B', borderRadius: 2, marginRight: 8 },
  progressBarFill: { height: '100%', backgroundColor: '#4F46E5', borderRadius: 2 },
  progressPercent: { fontSize: 11, fontWeight: '700', color: '#94A3B8', width: 28, textAlign: 'right' },
  emptyContainer: { alignItems: 'center', marginTop: 40, paddingHorizontal: 20 },
  emptyText: { color: '#94A3B8', fontSize: 15, fontWeight: '600', textAlign: 'center' },
  subEmptyText: { color: '#64748B', fontSize: 13, textAlign: 'center', marginTop: 4 }
});