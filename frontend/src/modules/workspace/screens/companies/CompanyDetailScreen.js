import React, { useState, useMemo, useCallback } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  useWindowDimensions, StatusBar, RefreshControl, ActivityIndicator, Alert
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { 
  Building2, Users, FolderKanban, CheckSquare, 
  TrendingUp, ArrowLeft, Search, Bell, Plus, 
  Mail, Megaphone, FileText, BarChart3
} from 'lucide-react-native';

import api from '../../../../services/api'; // Ton instance Axios sécurisée

const BREAKPOINT = 950;

// 🔒 Palette de couleurs alignée sur le thème sombre premium de Wuro'en
const DARK_COLORS = {
  background: '#090D1A',
  surface: '#111726',
  textMain: '#FFFFFF',
  textSub: '#64748B',
  primary: '#6366F1', 
  border: '#1E293B',
  success: '#10B981',
  warning: '#F59E0B',
  info: '#3B82F6'
};

// ─────────────────────────────────────────────────────────────
// COMPOSANTS ENFANTS MÉMOÏSÉS
// ─────────────────────────────────────────────────────────────

const CompanyStatCard = React.memo(({ icon: Icon, label, value, subLabel, progress, color, onPress }) => (
  <View style={[styles.statCard, { borderColor: DARK_COLORS.border }]}>
    <View style={styles.statCardHeader}>
      <View style={[styles.statIconWrapper, { backgroundColor: color + '15' }]}>
        <Icon size={20} color={color} />
      </View>
      <View style={styles.statMeta}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </View>
    {progress !== undefined ? (
      <View style={styles.progressContainer}>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progress}%`, backgroundColor: color }]} />
        </View>
      </View>
    ) : (
      <TouchableOpacity style={styles.statLinkBtn} onPress={onPress}>
        <Text style={[styles.statLinkText, { color }]}>{subLabel}</Text>
        <Text style={[styles.statLinkArrow, { color }]}> →</Text>
      </TouchableOpacity>
    )}
  </View>
));

const ActionButton = React.memo(({ icon: Icon, label, color, isDesktop, onPress }) => (
  <TouchableOpacity 
    style={[styles.actionBtn, isDesktop ? styles.actionBtnDesktop : styles.actionBtnMobile]}
    onPress={onPress}
  >
    <View style={[styles.actionIconWrapper, { backgroundColor: color + '15' }]}>
      <Icon size={20} color={color} />
    </View>
    <Text style={styles.actionLabel} numberOfLines={1}>{label}</Text>
  </TouchableOpacity>
));

// ─────────────────────────────────────────────────────────────
// COMPOSANT PRINCIPAL
// ─────────────────────────────────────────────────────────────

export default function CompanyDetailScreen({ navigation, route }) {
  const { companyId } = route.params; // Récupération de l'ID passé en paramètre de navigation
  const { width: windowWidth } = useWindowDimensions();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState(null);
  const [staffCount, setStaffCount] = useState(0);

  const isDesktop = useMemo(() => windowWidth >= BREAKPOINT, [windowWidth]);

  // 🔌 Connexion Réseau : GET /api/workspace/companies/:id
  const fetchCompanyDetails = useCallback(async () => {
    try {
      const response = await api.get(`/workspace/companies/${companyId}`);
      setCompany(response.data.company);
      setStaffCount(response.data.staff?.length || 0);
    } catch (error) {
      console.error(error);
      Alert.alert("Erreur", "Impossible de récupérer les détails de la structure.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [companyId]);

  useFocusEffect(
    useCallback(() => {
      fetchCompanyDetails();
    }, [fetchCompanyDetails])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCompanyDetails();
  }, [fetchCompanyDetails]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={DARK_COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.globalContainer}>
      <StatusBar barStyle="light-content" backgroundColor={DARK_COLORS.background} />
      
      {/* Barre supérieure adaptative */}
      <View style={styles.topNavbar}>
        <View style={styles.navLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft size={20} color={DARK_COLORS.textMain} />
          </TouchableOpacity>
          <Text style={styles.navTitle}>Retour aux compagnies</Text>
        </View>
        <View style={styles.navRight}>
          <View style={styles.searchBarFake}>
            <Search size={16} color={DARK_COLORS.textSub} />
            <Text style={styles.searchPlaceholder}>Rechercher...</Text>
          </View>
          <TouchableOpacity style={styles.navIconBtn}>
            <Bell size={20} color={DARK_COLORS.textMain} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Structure Principale Grid / Flex */}
      <View style={[styles.mainLayout, isDesktop && styles.mainLayoutDesktop]}>
        
        {/* BLOC GAUCHE : Fiche d'identité de la Compagnie */}
        <View style={[styles.leftSidebar, isDesktop ? styles.leftSidebarDesktop : styles.leftSidebarMobile]}>
          <View style={styles.metaBadge}>
            <Building2 size={48} color={DARK_COLORS.primary} />
          </View>
          <Text style={styles.companyName}>{company?.name || 'Structure'}</Text>
          <Text style={styles.companySub}>
            Enterprise • {staffCount} {staffCount > 1 ? 'collaborateurs' : 'collaborateur'}
          </Text>
          
          {isDesktop && (
            <TouchableOpacity style={styles.editProfileBtn}>
              <Text style={styles.editProfileText}>Modifier les informations</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* BLOC DROIT : Contenu opérationnel */}
        <ScrollView 
          style={styles.rightContent}
          contentContainerStyle={isDesktop ? styles.rightContentScrollDesktop : styles.rightContentScrollMobile}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={DARK_COLORS.primary} />}
        >
          {/* Section 1 : Statistiques clés */}
          <View style={[styles.statsGrid, isDesktop ? styles.statsGridDesktop : styles.statsGridMobile]}>
            <CompanyStatCard 
              icon={Users} 
              label="Personnel" 
              value={staffCount} 
              subLabel="Gérer l'équipe" 
              color={DARK_COLORS.primary} 
              onPress={() => navigation.navigate('CompanyStaff', { companyId })} // 📲 Lien vers CompanyStaffScreen
            />
            <CompanyStatCard icon={FolderKanban} label="Projets" value={0} subLabel="Voir tout" color={DARK_COLORS.success} />
            <CompanyStatCard icon={CheckSquare} label="Tâches" value={0} subLabel="Voir tout" color={DARK_COLORS.warning} />
            <CompanyStatCard icon={TrendingUp} label="Avancement" value="0%" progress={0} color={DARK_COLORS.info} />
          </View>

          {/* Section 2 : Actions Rapides */}
          <Text style={styles.sectionTitle}>Actions rapides</Text>
          <View style={[styles.actionsGrid, isDesktop ? styles.actionsGridDesktop : styles.actionsGridMobile]}>
            <ActionButton icon={Plus} label="Créer un projet" color="#6366F1" isDesktop={isDesktop} />
            <ActionButton icon={Mail} label="Recruter du staff" color="#10B981" isDesktop={isDesktop} />
            <ActionButton icon={Megaphone} label="Créer une annonce" color="#F59E0B" isDesktop={isDesktop} />
            <ActionButton icon={FileText} label="Notes de service" color="#3B82F6" isDesktop={isDesktop} />
            <ActionButton icon={BarChart3} label="Rapport financier" color="#EF4444" isDesktop={isDesktop} />
          </View>
        </ScrollView>

      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// STYLES OPTIMISÉS THÈME SOMBRE WURO'EN
// ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  globalContainer: { flex: 1, backgroundColor: DARK_COLORS.background },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: DARK_COLORS.background },
  topNavbar: { height: 70, backgroundColor: DARK_COLORS.surface, borderBottomWidth: 1, borderColor: DARK_COLORS.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24 },
  navLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { padding: 4 },
  navTitle: { fontSize: 14, fontWeight: '600', color: DARK_COLORS.textSub },
  navRight: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  searchBarFake: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: DARK_COLORS.background, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, width: 220, borderWidth: 1, borderColor: DARK_COLORS.border },
  searchPlaceholder: { color: DARK_COLORS.textSub, fontSize: 13 },
  navIconBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  
  mainLayout: { flex: 1, flexDirection: 'column' },
  mainLayoutDesktop: { flexDirection: 'row', padding: 24, gap: 24 },
  
  leftSidebar: { backgroundColor: DARK_COLORS.surface, padding: 24, borderRadius: 16, borderWidth: 1, borderColor: DARK_COLORS.border, alignItems: 'center' },
  leftSidebarMobile: { margin: 16, marginBottom: 0 },
  leftSidebarDesktop: { width: 320, height: '100%', alignSelf: 'flex-start' },
  
  metaBadge: { width: 80, height: 80, borderRadius: 20, backgroundColor: DARK_COLORS.background, justifyContent: 'center', alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: DARK_COLORS.border },
  companyName: { fontSize: 18, fontWeight: '800', color: DARK_COLORS.textMain, textAlign: 'center' },
  companySub: { fontSize: 13, fontWeight: '600', color: DARK_COLORS.textSub, marginTop: 4 },
  editProfileBtn: { marginTop: 20, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, borderColor: DARK_COLORS.border, width: '100%', alignItems: 'center', backgroundColor: DARK_COLORS.background },
  editProfileText: { fontSize: 13, fontWeight: '700', color: DARK_COLORS.primary },

  rightContent: { flex: 1 },
  rightContentScrollDesktop: { paddingLeft: 8, paddingBottom: 40 },
  rightContentScrollMobile: { padding: 16, paddingBottom: 40 },

  statsGrid: { gap: 16 },
  statsGridMobile: { flexDirection: 'column' },
  statsGridDesktop: { flexDirection: 'row' },

  statCard: { flex: 1, backgroundColor: DARK_COLORS.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: DARK_COLORS.border },
  statCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  statIconWrapper: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  statMeta: { flex: 1 },
  statValue: { fontSize: 20, fontWeight: '800', color: DARK_COLORS.textMain },
  statLabel: { fontSize: 12, fontWeight: '600', color: DARK_COLORS.textSub },
  statLinkBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 12, paddingTop: 8, borderTopWidth: 1, borderTopColor: DARK_COLORS.border },
  statLinkText: { fontSize: 11, fontWeight: '700' },
  statLinkArrow: { fontSize: 11, fontWeight: '700' },
  progressContainer: { marginTop: 16 },
  progressBarBg: { height: 6, backgroundColor: DARK_COLORS.background, borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 3 },

  sectionTitle: { fontSize: 14, fontWeight: '800', color: DARK_COLORS.textMain, marginTop: 24, marginBottom: 12 },
  
  actionsGrid: { gap: 12 },
  actionsGridMobile: { flexDirection: 'column' },
  actionsGridDesktop: { flexDirection: 'row', flexWrap: 'wrap' },
  actionBtn: { backgroundColor: DARK_COLORS.surface, borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: DARK_COLORS.border },
  actionBtnMobile: { width: '100%' },
  actionBtnDesktop: { width: '18.5%', minWidth: 150 },
  actionIconWrapper: { width: 36, height: 36, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  actionLabel: { fontSize: 12, fontWeight: '700', color: DARK_COLORS.textMain, flex: 1 }
});