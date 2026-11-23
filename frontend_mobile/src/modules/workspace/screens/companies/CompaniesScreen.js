import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Dimensions, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { ArrowLeft, SlidersHorizontal, Plus, Bell, MoreVertical, Briefcase, Users, Wallet, FileText, Landmark, BarChart3 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../../../services/api'; // 🛠️ Import corrigé en minuscule pour correspondre à l'instance exportée

const { width } = Dimensions.get('window');

// ─── COMPOSANTS REUTILISABLES (STATIQUES) ───
const StatCard = React.memo(({ icon, count, label, trend, trendColor }) => (
  <View style={styles.statCard}>
    <View style={styles.statHeader}>
      <View style={styles.statIconContainer}>{icon}</View>
      <Text style={styles.statCount}>{count}</Text>
    </View>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={[styles.statTrend, { color: trendColor }]}>{trend}</Text>
  </View>
));

const QuickActionBtn = React.memo(({ icon, label, bgColor }) => (
  <TouchableOpacity style={styles.quickActionCard} activeOpacity={0.8}>
    <View style={[styles.quickActionIconContainer, { backgroundColor: bgColor }]}>
      {icon}
    </View>
    <Text style={styles.quickActionLabel}>{label}</Text>
  </TouchableOpacity>
));

const CompanyGridCard = React.memo(({ item, onPress }) => {
  const getStatusStyle = (status) => {
    if (status === 'active' || status === 'En activité') return { bg: 'rgba(16, 185, 129, 0.2)', text: '#10B981', label: 'En activité' };
    if (status === 'creation' || status === 'En création') return { bg: 'rgba(245, 158, 11, 0.2)', text: '#F59E0B', label: 'En création' };
    return { bg: 'rgba(59, 130, 246, 0.2)', text: '#3B82F6', label: 'En pause' };
  };

  const statusStyle = getStatusStyle(item.status);

  return (
    <TouchableOpacity style={styles.companyCard} activeOpacity={0.9} onPress={onPress}>
      <Image source={{ uri: item.bgImage || 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=400&q=80' }} style={styles.cardBgImage} />
      <LinearGradient colors={['rgba(9, 13, 26, 0.2)', '#111726']} style={styles.cardGradient} />

      <View style={styles.cardTopRow}>
        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
          <Text style={[styles.statusText, { color: statusStyle.text }]}>{statusStyle.label}</Text>
        </View>
        <TouchableOpacity style={styles.moreBtn} onPress={(e) => e.stopPropagation()}>
          <MoreVertical color="#FFF" size={16} />
        </TouchableOpacity>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.logoAndTitleRow}>
          <Image source={{ uri: item.logo || 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=100&q=80' }} style={styles.companyLogo} />
          <View style={styles.titleContainer}>
            <View style={styles.nameVerifiedRow}>
              <Text style={styles.companyName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.verifiedCheck}>✓</Text>
            </View>
            <Text style={styles.companySector} numberOfLines={1}>{item.description || 'Secteur non défini'}</Text>
            <Text style={styles.companyLocation} numberOfLines={1}>📍 Bénin</Text>
          </View>
        </View>

        <View style={styles.metricsGrid}>
          <View style={styles.metricItem}>
            <View style={styles.metricHeader}><Briefcase color="#A5B4FC" size={10} /><Text style={styles.metricLabel}>Projets</Text></View>
            <Text style={styles.metricValue}>{item.projectsCount || 0}</Text>
          </View>
          <View style={styles.metricItem}>
            <View style={styles.metricHeader}><Users color="#A5B4FC" size={10} /><Text style={styles.metricLabel}>Staff</Text></View>
            <Text style={styles.metricValue}>{item.staffCount || 0}</Text>
          </View>
          <View style={styles.metricItem}>
            <View style={styles.metricHeader}><Wallet color="#A5B4FC" size={10} /><Text style={styles.metricLabel}>Invest.</Text></View>
            <Text style={styles.metricValue}>{item.investment || '--'}</Text>
          </View>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressTexts}>
            <Text style={styles.progressPercent}>0%</Text>
            <Text style={styles.progressLabel}>Progression</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `0%`, backgroundColor: statusStyle.text }]} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
});

// ─── COMPOSANT PRINCIPAL CONNECTÉ ───
export default function CompaniesScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('Toutes');
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Rangées statistiques calculées dynamiquement
  const stats = useMemo(() => {
    const total = companies.length;
    const actives = companies.filter(c => c.status === 'active' || c.status === 'En activité').length;
    const creation = companies.filter(c => c.status === 'creation' || c.status === 'En création').length;
    return { total, actives, creation };
  }, [companies]);

  // Chargement des données réelles depuis la route API /companies via l'instance `api` en minuscule
  const loadCompaniesData = async () => {
    try {
      const response = await api.get('/companies'); 
      const data = response.data?.data || response.data || [];
      setCompanies(data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      console.log("Erreur détaillée :", error.response || error);
      Alert.alert("Erreur", `Détail : ${errorMessage}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Recharger automatiquement les données à chaque retour sur cet écran
  useFocusEffect(
    useCallback(() => {
      loadCompaniesData();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadCompaniesData();
  }, []);

  const filteredCompanies = companies.filter(company => {
    if (activeTab === 'Toutes') return true;
    if (activeTab === 'Actives') return company.status === 'active' || company.status === 'En activité';
    if (activeTab === 'Création') return company.status === 'creation' || company.status === 'En création';
    if (activeTab === 'En pause') return company.status === 'suspended';
    return true;
  });

  return (
    <View style={styles.container}>
      {/* NAVBAR */}
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft color="#FFF" size={24} />
        </TouchableOpacity>
        <View style={styles.navTitleContainer}>
          <Text style={styles.navTitle}>Compagnies 🏢</Text>
          <Text style={styles.navSubtitle}>Gérez vos structures réelles</Text>
        </View>
        <View style={styles.navActions}>
          <TouchableOpacity style={styles.iconAction}>
            <Bell color="#FFF" size={20} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconAction}><SlidersHorizontal color="#FFF" size={20} /></TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loaderText}>Chargement de vos compagnies...</Text>
        </View>
      ) : (
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366F1" />}
        >
          {/* STATS DYNAMIQUES */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsRow}>
            <StatCard icon={<Text style={{fontSize: 14}}>🏢</Text>} count={stats.total < 10 ? `0${stats.total}` : stats.total} label="Compagnies" trend="Total inscrit" trendColor="#A5B4FC" />
            <StatCard icon={<Text style={{fontSize: 14}}>⚡</Text>} count={stats.actives < 10 ? `0${stats.actives}` : stats.actives} label="En activité" trend="Opérationnel" trendColor="#10B981" />
            <StatCard icon={<Text style={{fontSize: 14}}>🚀</Text>} count={stats.creation < 10 ? `0${stats.creation}` : stats.creation} label="En création" trend="En attente" trendColor="#F59E0B" />
          </ScrollView>

          {/* BOUTON CRÉER */}
          <TouchableOpacity style={styles.createBtn} onPress={() => navigation.navigate('CreateCompany')}>
            <LinearGradient colors={['#6366F1', '#4F46E5']} start={{x:0, y:0}} end={{x:1, y:0}} style={styles.createBtnGradient}>
              <Plus color="#FFF" size={18} style={{ marginRight: 6 }} />
              <Text style={styles.createBtnText}>Créer une compagnie</Text> 
            </LinearGradient>
          </TouchableOpacity>

          {/* FILTRES */}
          <View style={styles.tabsContainer}>
            {['Toutes', 'Actives', 'Création', 'En pause'].map((tab) => (
              <TouchableOpacity key={tab} style={[styles.tab, activeTab === tab && styles.tabActive]} onPress={() => setActiveTab(tab)}>
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* GRILLE DYNAMIQUES */}
          {filteredCompanies.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Aucune compagnie trouvée dans cette catégorie.</Text>
            </View>
          ) : (
            <View style={styles.grid}>
              {filteredCompanies.map((company) => (
                <CompanyGridCard 
                  key={company._id} 
                  item={company} 
                  onPress={() => navigation.navigate('CompanyDetail', { companyId: company._id })}
                />
              ))}
            </View>
          )}

          {/* BOTTOM SECTIONS */}
          <View style={styles.bottomSectionsContainer}>
            <View style={styles.sectionHalf}>
              <Text style={styles.sectionMainTitle}>📊 Aperçu global</Text>
              <Text style={styles.sectionSubtitle}>Données consolidées</Text>
              <View style={styles.overviewCard}>
                <Text style={styles.overviewLabel}>Structures gérées</Text>
                <Text style={styles.overviewValue}>{stats.total}</Text>
                <Text style={[styles.overviewLabel, { marginTop: 12 }]}>Collaborateurs total</Text>
                <Text style={styles.overviewValue}>
                  {companies.reduce((acc, curr) => acc + (curr.staffCount || 0), 0)}
                </Text>
              </View>
            </View>

            <View style={styles.sectionHalf}>
              <Text style={styles.sectionMainTitle}>⚡ Actions rapides</Text>
              <Text style={styles.sectionSubtitle}>Accès direct</Text>
              <View style={styles.quickActionsGrid}>
                <QuickActionBtn icon={<FileText color="#C084FC" size={20} />} label="Documentation" bgColor="rgba(192, 132, 252, 0.15)" />
                <QuickActionBtn icon={<Landmark color="#34D399" size={20} />} label="Financement" bgColor="rgba(52, 211, 153, 0.15)" />
                <QuickActionBtn icon={<BarChart3 color="#60A5FA" size={20} />} label="Rapports" bgColor="rgba(96, 165, 250, 0.15)" />
                <QuickActionBtn icon={<Users color="#FBBF24" size={20} />} label="Partenaires" bgColor="rgba(251, 191, 36, 0.15)" />
              </View>
            </View>
          </View>

        </ScrollView>
      )}
    </View>
  );
}

// ─── STYLES ───
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090D1A', paddingTop: 50 },
  navbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 20 },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  navTitleContainer: { flex: 1, marginLeft: 8 },
  navTitle: { fontSize: 22, fontWeight: '800', color: '#FFF' },
  navSubtitle: { fontSize: 12, color: '#64748B', marginTop: 2 },
  navActions: { flexDirection: 'row', alignItems: 'center' },
  iconAction: { width: 38, height: 38, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },

  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loaderText: { color: '#64748B', marginTop: 12, fontSize: 13, fontWeight: '600' },

  scrollContent: { paddingBottom: 120 },
  statsRow: { paddingLeft: 16, paddingRight: 8, marginBottom: 20 },
  statCard: { backgroundColor: '#111726', borderWidth: 1, borderColor: '#1E293B', borderRadius: 16, padding: 14, width: 130, marginRight: 10 },
  statHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  statIconContainer: { width: 28, height: 28, borderRadius: 8, backgroundColor: '#1E293B', justifyContent: 'center', alignItems: 'center' },
  statCount: { fontSize: 18, fontWeight: '800', color: '#FFF' },
  statLabel: { fontSize: 11, color: '#64748B', marginBottom: 4 },
  statTrend: { fontSize: 10, fontWeight: '600' },

  createBtn: { marginHorizontal: 16, height: 44, borderRadius: 12, overflow: 'hidden', marginBottom: 20 },
  createBtnGradient: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  createBtnText: { color: '#FFF', fontSize: 14, fontWeight: '700' },

  tabsContainer: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 20 },
  tab: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, marginRight: 8, backgroundColor: '#111726', borderWidth: 1, borderColor: '#1E293B' },
  tabActive: { backgroundColor: '#6366F1', borderColor: '#6366F1' },
  tabText: { color: '#94A3B8', fontSize: 12, fontWeight: '600' },
  tabTextActive: { color: '#FFF' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 25 },
  companyCard: { width: (width - 44) / 2, backgroundColor: '#111726', borderRadius: 20, marginBottom: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#1E293B', height: 260 },
  cardBgImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '45%', resizeMode: 'cover' },
  cardGradient: { ...StyleSheet.absoluteFillObject },
  
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, zIndex: 10 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: '700' },
  moreBtn: { width: 24, height: 24, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },

  cardContent: { padding: 12, position: 'absolute', bottom: 0, left: 0, right: 0, top: '35%', justifyContent: 'space-between' },
  logoAndTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  companyLogo: { width: 34, height: 34, borderRadius: 17, borderWidth: 2, borderColor: '#111726', backgroundColor: '#FFF' },
  titleContainer: { marginLeft: 8, flex: 1 },
  nameVerifiedRow: { flexDirection: 'row', alignItems: 'center' },
  companyName: { fontSize: 12, fontWeight: '800', color: '#FFF', flex: 1 },
  verifiedCheck: { color: '#3B82F6', fontSize: 10, marginLeft: 4, fontWeight: 'bold' },
  companySector: { fontSize: 9, color: '#64748B', marginTop: 1 },
  companyLocation: { fontSize: 8, color: '#94A3B8', marginTop: 1 },

  metricsGrid: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#1E293B', paddingVertical: 6, marginBottom: 6 },
  metricItem: { alignItems: 'flex-start' },
  metricHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  metricLabel: { fontSize: 8, color: '#64748B', marginLeft: 2 },
  metricValue: { fontSize: 9, fontWeight: '700', color: '#FFF' },

  progressSection: { marginTop: 'auto' },
  progressTexts: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  progressPercent: { fontSize: 10, fontWeight: '800', color: '#FFF' },
  progressLabel: { fontSize: 8, color: '#64748B' },
  progressBarBg: { height: 4, backgroundColor: '#1E293B', borderRadius: 2, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 2 },

  emptyContainer: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#64748B', textAlign: 'center', fontSize: 13 },

  bottomSectionsContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, marginTop: 10 },
  sectionHalf: { width: '48%' },
  sectionMainTitle: { fontSize: 15, fontWeight: '800', color: '#FFF' },
  sectionSubtitle: { fontSize: 10, color: '#64748B', marginTop: 2, marginBottom: 12 },
  
  overviewCard: { backgroundColor: '#111726', borderWidth: 1, borderColor: '#1E293B', borderRadius: 16, padding: 12, height: 160, justifyContent: 'center' },
  overviewLabel: { fontSize: 10, color: '#64748B' },
  overviewValue: { fontSize: 13, fontWeight: '800', color: '#FFF', marginTop: 2 },

  quickActionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', height: 160 },
  quickActionCard: { width: '47%', backgroundColor: '#111726', borderWidth: 1, borderColor: '#1E293B', borderRadius: 14, padding: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 10, height: 75 },
  quickActionIconContainer: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  quickActionLabel: { color: '#94A3B8', fontSize: 9, fontWeight: '600', textAlign: 'center' }
});