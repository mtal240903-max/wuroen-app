import React, { useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Search, 
  SlidersHorizontal, 
  ArrowUpRight, 
  Folder, 
  Briefcase, 
  FlaskConical, 
  LineChart, 
  Users, 
  FileText,
  Bot
} from 'lucide-react-native';

import { useWorkspace } from '../../../context/WorkspaceContext'; 

const GridCard = ({ title, subtitle, icon: Icon, percent, colors, progressColor, onPress }) => (
  <TouchableOpacity activeOpacity={0.85} style={styles.cardWrapper} onPress={onPress}>
    <LinearGradient colors={colors} style={styles.cardGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      <View style={styles.cardHeader}>
        <Icon color={progressColor} size={28} strokeWidth={1.8} />
        <View style={[styles.progressCircle, { borderColor: '#1E293B', borderTopColor: progressColor }]}>
          <Text style={styles.percentText}>{percent}%</Text>
        </View>
      </View>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardSubtitle}>{subtitle}</Text>
    </LinearGradient>
  </TouchableOpacity>
);

export default function WorkspaceHomeScreen({ navigation }) {
  const { currentWorkspace, loadWorkspaceData } = useWorkspace();

  // 🔄 Le useEffect écoute maintenant currentWorkspace pour actualiser l'écran à chaque changement
  useEffect(() => {
    loadWorkspaceData();
  }, [currentWorkspace, loadWorkspaceData]);

  const stats = currentWorkspace?.stats || {};

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Top Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.brandText}>WURO'EN</Text>
            <Text style={styles.mainTitle}>Workspace</Text>
            <Text style={styles.subTitleText}>Votre espace de travail intelligent</Text>
          </View>
          
          <TouchableOpacity 
            activeOpacity={0.8} 
            style={styles.workspaceSelector}
            onPress={() => navigation.navigate('SelectWorkspace')}
          >
            <View>
              <Text style={styles.workspaceLabel}>Workspace actuel</Text>
              <Text style={styles.workspaceName}>{currentWorkspace?.name || 'Sélectionner...'}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBarContainer}>
          <Search color="#64748B" size={18} style={styles.searchIcon} />
          <TextInput 
            placeholder="Rechercher dans le workspace..." 
            placeholderTextColor="#64748B" 
            style={styles.searchInput} 
          />
          <TouchableOpacity style={styles.filterBtn}>
            <SlidersHorizontal color="#94A3B8" size={16} />
          </TouchableOpacity>
        </View>

        {/* Modular Grid */}
        <View style={styles.gridContainer}>
          <GridCard 
            title="Projets" subtitle={`${stats.projectsCount || 0} actifs`} percent={68} progressColor="#F59E0B"
            colors={['#251E1A', '#0F172A']} icon={Folder} onPress={() => navigation.navigate('Projects')}
          />
          <GridCard 
            title="Entreprise" subtitle={`${stats.companiesCount || 0} sociétés`} percent={45} progressColor="#3B82F6"
            colors={['#1A2332', '#0F172A']} icon={Briefcase} onPress={() => navigation.navigate('Companies')}
          />
          <GridCard 
            title="Recherche" subtitle={`${stats.studiesCount || 0} études`} percent={78} progressColor="#10B981"
            colors={['#162826', '#0F172A']} icon={FlaskConical} 
          />
          <GridCard 
            title="Finance" subtitle="Suivi & Analyses" percent={60} progressColor="#EF4444"
            colors={['#2A1B1F', '#0F172A']} icon={LineChart} 
          />
          <GridCard 
            title="Équipes" subtitle={`${stats.membersCount || 0} membres`} percent={90} progressColor="#8B5CF6"
            colors={['#211C30', '#0F172A']} icon={Users} 
          />
          <GridCard 
            title="Documents" subtitle={`${stats.filesCount || 0} fichiers`} percent={30} progressColor="#6366F1"
            colors={['#1E1C2E', '#0F172A']} icon={FileText} 
          />
        </View>

        {/* Assistant IA Card */}
        <TouchableOpacity activeOpacity={0.9} style={styles.aiCardWrapper}>
          <LinearGradient colors={['#141B2D', '#0F172A']} style={styles.aiGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Bot color="#6366F1" size={30} strokeWidth={1.8} />
            <View style={styles.aiTextContainer}>
              <Text style={styles.aiTitle}>Assistant IA</Text>
              <Text style={styles.aiSubtitle}>Votre assistant intelligent</Text>
            </View>
            <View style={styles.aiBadgeContainer}>
              <View style={styles.aiIndicator}>
                <ArrowUpRight color="#FFF" size={16} />
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090D1A' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 50, paddingBottom: 140, flexGrow: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  brandText: { fontSize: 13, fontWeight: '800', color: '#6366F1', letterSpacing: 1.5, marginBottom: 2 },
  mainTitle: { fontSize: 32, fontWeight: '800', color: '#FFF', letterSpacing: -0.5 },
  subTitleText: { fontSize: 13, color: '#64748B', marginTop: 2 },
  workspaceSelector: { 
    backgroundColor: '#111726', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, 
    borderWidth: 1, borderColor: '#1E293B', flexDirection: 'row', alignItems: 'center'
  },
  workspaceLabel: { fontSize: 9, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 },
  workspaceName: { fontSize: 13, fontWeight: '700', color: '#FFF' },
  searchBarContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111726', borderRadius: 14, paddingHorizontal: 12, height: 46, marginBottom: 25, borderWidth: 1, borderColor: '#1E293B' },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, color: '#F1F5F9', fontSize: 14 },
  filterBtn: { padding: 4 },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  cardWrapper: { width: '48%', height: 140, marginBottom: 15, borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: '#1E293B' },
  cardGradient: { flex: 1, padding: 18, justifyContent: 'space-between' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressCircle: { width: 38, height: 38, borderRadius: 19, borderWidth: 2.5, justifyContent: 'center', alignItems: 'center' },
  percentText: { fontSize: 10, fontWeight: '700', color: '#FFF' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#FFF', marginTop: 12 },
  cardSubtitle: { fontSize: 11, color: '#64748B', marginTop: 2 },
  aiCardWrapper: { width: '100%', height: 76, borderRadius: 20, overflow: 'hidden', marginTop: 8, borderWidth: 1, borderColor: '#1E293B' },
  aiGradient: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18 },
  aiTextContainer: { marginLeft: 14, flex: 1 },
  aiTitle: { fontSize: 15, fontWeight: '700', color: '#FFF' },
  aiSubtitle: { fontSize: 12, color: '#64748B', marginTop: 2 },
  aiBadgeContainer: { flexDirection: 'row', alignItems: 'center' },
  aiIndicator: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#6366F1', justifyContent: 'center', alignItems: 'center' }
});