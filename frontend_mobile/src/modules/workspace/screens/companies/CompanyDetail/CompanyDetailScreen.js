import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, useWindowDimensions, StatusBar, RefreshControl, ActivityIndicator, Alert, TextInput, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Building2, Users, FolderKanban, CheckSquare, TrendingUp, ArrowLeft, Search, Bell, Plus, Megaphone, FilePlus, BarChart3, Settings, UserPlus } from 'lucide-react-native';

import { companyService } from '../companyService';
import { projectService } from '../../../services/projectService';
import { StatCard } from './components/StatCard';
import { ProjectRowCard } from './components/ProjectRowCard';
import { ActionButton } from './components/ActionButton';
import { ActivityModal, DocumentModal } from './components/ActionModals';

const BREAKPOINT = 950;
const DARK_COLORS = { 
  background: '#090D1A', 
  surface: '#111726', 
  surfaceCard: '#1E293B',
  textMain: '#FFFFFF', 
  textSub: '#94A3B8',
  primary: '#6366F1',
  border: '#1E293B',
  badgeBg: 'rgba(99, 102, 241, 0.15)',
  badgeText: '#818CF8',
  success: '#10B981'
};

export default function CompanyDetailScreen({ navigation, route }) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= BREAKPOINT;

  // Récupération sécurisée de l'ID
  const companyId = route?.params?.companyId || route?.params?.id;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [company, setCompany] = useState(null);
  const [projectsList, setProjectsList] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isActivityModalVisible, setIsActivityModalVisible] = useState(false);
  const [isDocModalVisible, setIsDocModalVisible] = useState(false);
  const [activityText, setActivityText] = useState('');
  const [docTitle, setDocTitle] = useState('');

  const loadData = useCallback(async () => {
    try {
      if (!companyId) {
        console.warn('⚠️ Aucun ID d\'entreprise trouvé dans les paramètres de navigation !');
        setLoading(false);
        return;
      }
      
      console.log('🔍 Chargement des données pour l\'entreprise ID :', companyId);

      // Chargement simultané des détails de l'entreprise et des projets associés
      const [companyData, projectsData] = await Promise.all([
        companyService.getCompanyDetails(companyId),
        projectService.getCompanyProjects(companyId).catch(() => [])
      ]);

      setCompany(companyData);
      
      const combinedProjects = (projectsData && projectsData.length > 0) 
        ? projectsData 
        : (companyData?.projects || []);
        
      setProjectsList(combinedProjects);

    } catch (error) {
      console.warn('⚠️ Erreur réseau interceptée lors du chargement des détails :', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [companyId]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleCreateActivity = async () => {
    if (!activityText.trim()) return;
    try {
      // TODO: Remplacer par l'appel API réel d'ajout d'activité
      Alert.alert('Succès', 'Activité créée avec succès.');
      setActivityText('');
      setIsActivityModalVisible(false);
      loadData();
    } catch (error) {
      Alert.alert('Erreur', 'Échec de la création de l\'activité.');
    }
  };

  const handleUploadDocument = async () => {
    if (!docTitle.trim()) return;
    try {
      // TODO: Remplacer par l'appel API réel d'importation
      Alert.alert('Succès', 'Document importé avec succès.');
      setDocTitle('');
      setIsDocModalVisible(false);
      loadData();
    } catch (error) {
      Alert.alert('Erreur', 'Échec de l\'importation du document.');
    }
  };

  // Actions rapides interactives
  const handleQuickActionCreateProject = () => {
    // Exemple de navigation vers la création d'un projet lié à cette entreprise
    navigation.navigate('CreateProject', { companyId, companyName: company?.name });
  };

  const handleQuickActionAnnounce = () => {
    Alert.alert('Annonce', 'Fonctionnalité de publication d\'annonce en cours de développement.');
  };

  const handleQuickActionInvite = () => {
    setActiveTab('members');
  };

  const handleQuickActionReport = () => {
    Alert.alert('Rapport', 'Génération du rapport d\'entreprise en cours...');
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={DARK_COLORS.primary} />
      </View>
    );
  }

  const membersList = company?.members || [];
  const activeProjectsCount = projectsList.length;
  const membersCount = membersList.length;

  return (
    <View style={styles.globalContainer}>
      <StatusBar barStyle="light-content" />
      
      {/* Top Navbar */}
      <View style={styles.topNavbar}>
        <View style={styles.navLeft}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <ArrowLeft size={20} color={DARK_COLORS.textMain} />
          </TouchableOpacity>
          <Text style={styles.navTitle} numberOfLines={1}>{company?.name || 'Détails de l\'entreprise'}</Text>
        </View>
        <View style={styles.navRight}>
          <View style={styles.searchBarFake}>
            <Search size={14} color={DARK_COLORS.textSub} />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher..."
              placeholderTextColor={DARK_COLORS.textSub}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity style={styles.navIconBtn}>
            <Bell size={18} color={DARK_COLORS.textMain} />
          </TouchableOpacity>
          <View style={styles.userAvatarContainer}>
            <Text style={styles.userAvatarText}>ME</Text>
          </View>
        </View>
      </View>

      <ScrollView 
        style={styles.mainScroll}
        contentContainerStyle={styles.scrollContentContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={DARK_COLORS.primary} />}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroBanner}>
            <TouchableOpacity style={styles.bannerSettingsBtn} onPress={() => Alert.alert('Paramètres', 'Paramètres de la bannière')}>
              <Settings size={16} color="#FFF" />
            </TouchableOpacity>
          </View>
          <View style={styles.heroContentContainer}>
            <View style={styles.logoBadgeLarge}>
              <Building2 size={32} color={DARK_COLORS.primary} />
            </View>
            <View style={styles.heroTextInfo}>
              <View style={styles.heroTitleRow}>
                <Text style={styles.heroCompanyName}>{company?.name || 'Nom de l\'entreprise'}</Text>
              </View>
              <View style={styles.heroBadgeRow}>
                <View style={styles.typeBadge}>
                  <Text style={styles.typeBadgeText}>Société</Text>
                </View>
                <Text style={styles.memberCountText}>{membersCount} membres</Text>
              </View>
              <Text style={styles.heroDescription} numberOfLines={2}>
                {company?.description || 'Aucune description fournie pour cette entreprise.'}
              </Text>
            </View>
            <View style={styles.heroActionsRight}>
              <TouchableOpacity style={styles.editInfoBtn} onPress={() => setIsActivityModalVisible(true)}>
                <Text style={styles.editInfoBtnText}>+ Activité</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.dotsBtn} onPress={() => setIsDocModalVisible(true)}>
                <FilePlus size={16} color={DARK_COLORS.textMain} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Tabs */}
          <View style={styles.tabsRow}>
            {['dashboard', 'projects', 'members'].map((tab) => {
              const isActive = activeTab === tab;
              const label = tab === 'dashboard' ? 'Tableau de bord' : tab === 'projects' ? `Projets (${activeProjectsCount})` : `Membres (${membersCount})`;
              return (
                <TouchableOpacity 
                  key={tab} 
                  style={[styles.tabItem, isActive && styles.tabItemActive]}
                  onPress={() => setActiveTab(tab)}
                >
                  <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Tab Content: Dashboard */}
        {activeTab === 'dashboard' && (
          <View style={[styles.dashboardGrid, isDesktop ? styles.dashboardGridDesktop : styles.dashboardGridMobile]}>
            <View style={styles.mainColumn}>
              <View style={[styles.statsGridRow, isDesktop ? styles.statsGridDesktop : styles.statsGridMobile]}>
                <StatCard icon={FolderKanban} label="Projets Actifs" value={String(activeProjectsCount)} subLabel="Voir les projets" color="#6366F1" onPress={() => setActiveTab('projects')} />
                <StatCard icon={CheckSquare} label="Tâches en cours" value={String(company?.tasksCount || '0')} subLabel="Gérer les tâches" color="#10B981" />
                <StatCard icon={Users} label="Collaborateurs" value={String(membersCount)} subLabel="Voir l'équipe" color="#F59E0B" onPress={() => setActiveTab('members')} />
                <StatCard icon={TrendingUp} label="Performance" value={`${company?.performance || 85}%`} progress={company?.performance || 85} color="#EC4899" />
              </View>

              <View style={styles.cardContainer}>
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.cardTitle}>Projets récents</Text>
                  <TouchableOpacity onPress={() => setActiveTab('projects')}>
                    <Text style={styles.seeAllText}>Tout voir</Text>
                  </TouchableOpacity>
                </View>
                {projectsList.length > 0 ? (
                  projectsList.slice(0, 3).map((project, index) => (
                    <ProjectRowCard 
                      key={project.id || project._id || index}
                      title={project.name || project.title} 
                      desc={project.description} 
                      progress={project.progress} 
                      statusColor={project.statusColor || '#10B981'}
                      imageUrl={project.imageUrl}
                      companyLogo={project.companyLogo}
                      userAvatar={project.userAvatar}
                      onPress={() => {
                        // Navigation vers le détail du projet si nécessaire
                        // navigation.navigate('ProjectDetail', { projectId: project.id || project._id });
                      }}
                    />
                  ))
                ) : (
                  <Text style={styles.emptyText}>Aucun projet récent pour cette entreprise.</Text>
                )}
              </View>
            </View>

            {/* Right Sidebar */}
            <View style={styles.rightSidebarColumn}>
              <View style={styles.cardContainer}>
                <Text style={styles.cardTitleSmall}>Actions Rapides</Text>
                <View style={styles.actionsStack}>
                  <ActionButton icon={Plus} label="Créer un projet" color="#6366F1" onPress={handleQuickActionCreateProject} />
                  <ActionButton icon={Megaphone} label="Publier une annonce" color="#F59E0B" onPress={handleQuickActionAnnounce} />
                  <ActionButton icon={UserPlus} label="Inviter un membre" color="#10B981" onPress={handleQuickActionInvite} />
                  <ActionButton icon={BarChart3} label="Générer un rapport" color="#EC4899" onPress={handleQuickActionReport} />
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Tab Content: Projects */}
        {activeTab === 'projects' && (
          <View style={styles.tabContentContainer}>
            <View style={styles.cardContainer}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardTitle}>Tous les projets ({activeProjectsCount})</Text>
                <TouchableOpacity style={styles.miniPrimaryBtn} onPress={handleQuickActionCreateProject}>
                  <Plus size={14} color="#FFF" style={{ marginRight: 4 }} />
                  <Text style={styles.miniPrimaryBtnText}>Nouveau projet</Text>
                </TouchableOpacity>
              </View>
              {projectsList.length > 0 ? (
                projectsList.map((project, index) => (
                  <ProjectRowCard 
                    key={project.id || project._id || index}
                    title={project.name || project.title} 
                    desc={project.description} 
                    progress={project.progress} 
                    statusColor={project.statusColor || '#10B981'}
                    imageUrl={project.imageUrl}
                    companyLogo={project.companyLogo}
                    userAvatar={project.userAvatar}
                    onPress={() => {}}
                  />
                ))
              ) : (
                <Text style={styles.emptyText}>Aucun projet trouvé pour cette entreprise.</Text>
              )}
            </View>
          </View>
        )}

        {/* Tab Content: Members */}
        {activeTab === 'members' && (
          <View style={styles.tabContentContainer}>
            <View style={styles.cardContainer}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardTitle}>Membres de l'équipe ({membersCount})</Text>
                <TouchableOpacity style={styles.miniPrimaryBtn} onPress={handleQuickActionInvite}>
                  <UserPlus size={14} color="#FFF" style={{ marginRight: 4 }} />
                  <Text style={styles.miniPrimaryBtnText}>Inviter</Text>
                </TouchableOpacity>
              </View>
              {membersList.length > 0 ? (
                membersList.map((member, index) => (
                  <View key={member.id || member._id || index} style={styles.memberItemRow}>
                    <View style={styles.memberAvatarMini}>
                      <Text style={styles.memberAvatarMiniText}>
                        {member.name ? member.name.substring(0, 2).toUpperCase() : `U${index + 1}`}
                      </Text>
                    </View>
                    <View style={styles.memberInfoFlex}>
                      <Text style={styles.memberNameText}>{member.name || `Utilisateur ${index + 1}`}</Text>
                      <Text style={styles.memberRoleText}>{member.role || 'Membre'}</Text>
                    </View>
                    <Text style={styles.memberTimeText}>{member.status || 'Actif'}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>Aucun membre trouvé.</Text>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Modals */}
      <ActivityModal
        visible={isActivityModalVisible}
        onClose={() => setIsActivityModalVisible(false)}
        value={activityText}
        onChangeText={setActivityText}
        onSubmit={handleCreateActivity}
      />

      <DocumentModal
        visible={isDocModalVisible}
        onClose={() => setIsDocModalVisible(false)}
        value={docTitle}
        onChangeText={setDocTitle}
        onSubmit={handleUploadDocument}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  globalContainer: { flex: 1, backgroundColor: DARK_COLORS.background },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: DARK_COLORS.background },
  topNavbar: { height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: DARK_COLORS.border, backgroundColor: DARK_COLORS.surface },
  navLeft: { flexDirection: 'row', alignItems: 'center' },
  backBtn: { padding: 8, marginRight: 8 },
  navTitle: { color: DARK_COLORS.textMain, fontSize: 16, fontWeight: '600' },
  navRight: { flexDirection: 'row', alignItems: 'center' },
  searchBarFake: { flexDirection: 'row', alignItems: 'center', backgroundColor: DARK_COLORS.background, borderRadius: 8, paddingHorizontal: 8, height: 36, width: 180, marginRight: 12, borderWidth: 1, borderColor: DARK_COLORS.border },
  searchInput: { flex: 1, color: DARK_COLORS.textMain, fontSize: 12, marginLeft: 6, padding: 0 },
  navIconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: DARK_COLORS.background, justifyContent: 'center', alignItems: 'center', marginRight: 8, borderWidth: 1, borderColor: DARK_COLORS.border },
  userAvatarContainer: { width: 36, height: 36, borderRadius: 18, backgroundColor: DARK_COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  userAvatarText: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
  mainScroll: { flex: 1 },
  scrollContentContainer: { paddingBottom: 40 },
  heroSection: { backgroundColor: DARK_COLORS.surface, borderBottomWidth: 1, borderBottomColor: DARK_COLORS.border },
  heroBanner: { height: 120, backgroundColor: DARK_COLORS.surfaceCard, position: 'relative' },
  bannerSettingsBtn: { position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.5)', padding: 8, borderRadius: 20 },
  heroContentContainer: { paddingHorizontal: 16, paddingBottom: 16, marginTop: -30, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-end' },
  logoBadgeLarge: { width: 70, height: 70, borderRadius: 12, backgroundColor: DARK_COLORS.surfaceCard, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: DARK_COLORS.border, marginRight: 16 },
  heroTextInfo: { flex: 1, minWidth: 200 },
  heroTitleRow: { flexDirection: 'row', alignItems: 'center' },
  heroCompanyName: { color: DARK_COLORS.textMain, fontSize: 20, fontWeight: 'bold' },
  heroBadgeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  typeBadge: { backgroundColor: DARK_COLORS.badgeBg, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  typeBadgeText: { color: DARK_COLORS.badgeText, fontSize: 11, fontWeight: '500' },
  memberCountText: { color: DARK_COLORS.textSub, fontSize: 12, marginLeft: 8 },
  heroDescription: { color: DARK_COLORS.textSub, fontSize: 12, marginTop: 6 },
  heroActionsRight: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  editInfoBtn: { backgroundColor: DARK_COLORS.surfaceCard, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: DARK_COLORS.border, marginRight: 8 },
  editInfoBtnText: { color: DARK_COLORS.textMain, fontSize: 12, fontWeight: '500' },
  dotsBtn: { backgroundColor: DARK_COLORS.surfaceCard, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: DARK_COLORS.border, justifyContent: 'center', alignItems: 'center' },
  tabsRow: { flexDirection: 'row', paddingHorizontal: 16, borderTopWidth: 1, borderTopColor: DARK_COLORS.border },
  tabItem: { paddingVertical: 12, marginRight: 24, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabItemActive: { borderBottomColor: DARK_COLORS.primary },
  tabText: { color: DARK_COLORS.textSub, fontSize: 13, fontWeight: '500' },
  tabTextActive: { color: DARK_COLORS.textMain, fontWeight: '600' },
  dashboardGrid: { padding: 16 },
  dashboardGridDesktop: { flexDirection: 'row' },
  dashboardGridMobile: { flexDirection: 'column' },
  mainColumn: { flex: 1 },
  rightSidebarColumn: { width: 280, marginLeft: 16 },
  statsGridRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 16 },
  statsGridDesktop: {},
  statsGridMobile: {},
  cardContainer: { backgroundColor: DARK_COLORS.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: DARK_COLORS.border, marginBottom: 16 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardTitle: { color: DARK_COLORS.textMain, fontSize: 15, fontWeight: 'bold' },
  cardTitleSmall: { color: DARK_COLORS.textMain, fontSize: 13, fontWeight: 'bold', marginBottom: 12 },
  seeAllText: { color: DARK_COLORS.primary, fontSize: 12, fontWeight: '500' },
  actionsStack: { flexDirection: 'column' },
  tabContentContainer: { padding: 16 },
  memberItemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: DARK_COLORS.border },
  memberAvatarMini: { width: 36, height: 36, borderRadius: 18, backgroundColor: DARK_COLORS.primary, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  memberAvatarMiniText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  memberInfoFlex: { flex: 1 },
  memberNameText: { color: DARK_COLORS.textMain, fontSize: 13, fontWeight: '600' },
  memberRoleText: { color: DARK_COLORS.textSub, fontSize: 11 },
  memberTimeText: { color: DARK_COLORS.success, fontSize: 11 },
  miniPrimaryBtn: { backgroundColor: DARK_COLORS.primary, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, flexDirection: 'row', alignItems: 'center' },
  miniPrimaryBtnText: { color: '#FFF', fontSize: 11, fontWeight: '500' },
  emptyText: { color: DARK_COLORS.textSub, fontSize: 13, fontStyle: 'italic', textAlign: 'center', paddingVertical: 12 },
});
