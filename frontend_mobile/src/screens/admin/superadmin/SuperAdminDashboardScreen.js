import React from 'react';
import { 
  View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, StatusBar 
} from 'react-native';
import { 
  ShieldAlert, Users, LayoutGrid, Database, Activity, ChevronRight, Settings, Cpu, HardDrive, Wrench
} from 'lucide-react-native';
import { COLORS } from '../../../theme/theme';

// ✅ Composant de carte optimisé pour le clic
const SuperAdminCard = ({ title, sub, icon: Icon, color, onPress }) => (
  <TouchableOpacity 
    style={styles.card} 
    onPress={onPress} 
    activeOpacity={0.7}
  >
    <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
      <Icon color={color} size={24} />
    </View>
    <View style={styles.cardBody}>
      <Text style={[styles.cardTitle, { color: color }]}>{title}</Text>
      <Text style={styles.cardSub}>{sub}</Text>
    </View>
    <View style={styles.arrowBox}>
      <ChevronRight color="#334155" size={18} />
    </View>
  </TouchableOpacity>
);

export default function SuperAdminDashboardScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* HEADER CRITIQUE */}
        <View style={styles.header}>
          <View style={styles.rootBadge}>
            <ShieldAlert color="#FFF" size={14} />
            <Text style={styles.rootText}>SESSION RACINE ACTIVE</Text>
          </View>
          <Text style={styles.mainTitle}>Super Admin</Text>
          <Text style={styles.mainSub}>Contrôle global des infrastructures MTal Studio</Text>
        </View>

        {/* SECTION ARCHITECTURE */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Cpu size={14} color="#475569" />
            <Text style={styles.sectionLabel}>ARCHITECTURE & SYSTÈME</Text>
          </View>
          
          <SuperAdminCard 
            title="Structure Bibliothèque"
            sub="Configuration hiérarchique N1 à N5"
            icon={LayoutGrid}
            color="#A855F7"
            onPress={() => navigation.navigate('AdminLibraryManager')}
          />

          <SuperAdminCard 
            title="Gestion des Outils"
            sub="Vitrine et configuration des outils système"
            icon={Wrench}
            color="#06B6D4"
            onPress={() => navigation.navigate('AdminToolsManager')} 
          />

          <SuperAdminCard 
            title="Analyse du Stockage"
            sub="Volumes Cloudinary & MongoDB"
            icon={HardDrive}
            color="#3B82F6"
            onPress={() => navigation.navigate('StorageStats')} 
          />
        </View>

        {/* SECTION SÉCURITÉ */}
        <View style={[styles.section, { marginTop: 30 }]}>
          <View style={styles.sectionHeader}>
            <Settings size={14} color="#475569" />
            <Text style={styles.sectionLabel}>SÉCURITÉ & PROTOCOLES</Text>
          </View>

          <SuperAdminCard 
            title="Permissions Membres"
            sub="Rôles experts et accès spéciaux"
            icon={Users}
            color="#EC4899"
            onPress={() => navigation.navigate('UsersManagement')} 
          />

          <SuperAdminCard 
            title="Journaux d'Audit"
            sub="Historique complet des actions racine"
            icon={Activity}
            color="#10B981"
            onPress={() => console.log("Audit logs open")}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Wuro'en OS v2.4.0 — Security Patch 2026</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  content: { padding: 25 },
  header: { marginBottom: 35, marginTop: 10 },
  rootBadge: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#EF4444', 
    alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, 
    borderRadius: 8, gap: 8, marginBottom: 15,
  },
  rootText: { color: '#FFF', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  mainTitle: { fontSize: 32, fontWeight: '900', color: '#F8FAFC' },
  mainSub: { fontSize: 14, color: '#64748B', marginTop: 5, fontWeight: '500' },
  section: { gap: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 15, paddingLeft: 5 },
  sectionLabel: { fontSize: 11, fontWeight: '800', color: '#475569', letterSpacing: 1.5 },
  card: { 
    backgroundColor: '#0F172A', flexDirection: 'row', alignItems: 'center', 
    padding: 18, borderRadius: 24, gap: 15, borderWidth: 1, borderColor: '#1E293B' 
  },
  iconBox: { padding: 12, borderRadius: 16 },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '800' },
  cardSub: { fontSize: 12, color: '#64748B', marginTop: 3, fontWeight: '500' },
  arrowBox: { backgroundColor: '#020617', padding: 6, borderRadius: 10 },
  footer: { marginTop: 40, alignItems: 'center' },
  footerText: { color: '#1E293B', fontSize: 10, fontWeight: '700', letterSpacing: 1 }
});