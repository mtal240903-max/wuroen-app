import React, { useContext } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  SafeAreaView, TouchableOpacity, StatusBar, Alert
} from 'react-native';
import { COLORS } from '../../../theme/theme';
import { AuthContext } from '../../../context/AuthContext';
import {
  BookOpen, FileStack, Fingerprint,
  ShieldCheck, ChevronRight, LayoutGrid,
  Lock
} from 'lucide-react-native';

// ─────────────────────────────────────────────────────────────
// COMPOSANT CARTE
// ─────────────────────────────────────────────────────────────
const AdminRoleCard = ({ label, description, icon: Icon, color, onPress, locked }) => (
  <TouchableOpacity
    style={[styles.roleCard, locked && styles.roleCardLocked]}
    onPress={locked
      ? () => Alert.alert("Accès restreint", "Votre profil admin ne vous donne pas accès à cette section.")
      : onPress
    }
    activeOpacity={locked ? 1 : 0.7}
  >
    <View style={[styles.roleIconBox, { backgroundColor: locked ? '#1E293B' : color + '15' }]}>
      {locked
        ? <Lock color="#334155" size={22} />
        : <Icon color={color} size={24} />
      }
    </View>
    <View style={{ flex: 1 }}>
      <View style={styles.cardHeaderRow}>
        <Text style={[styles.roleLabel, { color: locked ? '#334155' : color }]}>{label}</Text>
        <View style={styles.chevronBox}>
          <ChevronRight color={locked ? '#1E293B' : color} size={16} />
        </View>
      </View>
      <Text style={[styles.roleDesc, locked && { color: '#1E293B' }]}>
        {locked ? "Section non autorisée pour votre profil" : description}
      </Text>
    </View>
  </TouchableOpacity>
);

// ─────────────────────────────────────────────────────────────
// ÉCRAN PRINCIPAL
// ─────────────────────────────────────────────────────────────
export default function AdminDashboardScreen({ navigation }) {
  const { user } = useContext(AuthContext);

  // ✅ adminType détermine les accès :
  // 'content'   → accès articles uniquement
  // 'library'   → accès bibliothèque uniquement
  // 'workspace' → accès aux deux (admin général)
  // null/autre  → superadmin, accès total
  const adminType   = user?.adminType;
  const isSuperAdmin = user?.role === 'superadmin';

  const canAccessContent  = isSuperAdmin || adminType === 'content'  || adminType === 'workspace';
  const canAccessLibrary  = isSuperAdmin || adminType === 'library'  || adminType === 'workspace';

  // Label du type d'admin affiché dans le header
  const adminTypeLabel = {
    content:   'Admin Contenu',
    library:   'Admin Bibliothèque',
    workspace: 'Admin Général',
  }[adminType] || 'Administrateur';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* HEADER */}
        <View style={styles.headerSection}>
          <View style={styles.headerTextStack}>
            <Text style={styles.headerTitle}>Dashboard</Text>
            <Text style={styles.headerSubtitle}>
              {adminTypeLabel.toUpperCase()}
            </Text>
          </View>
          <View style={styles.adminBadge}>
            <ShieldCheck color={COLORS.primary} size={20} />
          </View>
        </View>

        {/* CARTE INFO */}
        <View style={styles.glassCard}>
          <LayoutGrid color={COLORS.primary} size={20} />
          <Text style={styles.infoText}>
            Bienvenue, <Text style={styles.boldUser}>{user?.name || 'Administrateur'}</Text>.
            {' '}Votre profil <Text style={styles.boldUser}>{adminTypeLabel}</Text> vous donne accès aux sections ci-dessous.
          </Text>
        </View>

        {/* SECTION OUTILS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Vos outils</Text>
          <View style={styles.titleLine} />
        </View>

        <View style={styles.rolesWrapper}>

          {/* BIBLIOTHÈQUE */}
          <AdminRoleCard
            label="BIBLIOTHÈQUE"
            description="Indexation des documents, gestion des dossiers et archivage Cloud."
            icon={BookOpen}
            color="#3B82F6"
            locked={!canAccessLibrary}
            onPress={() => navigation.navigate('LibraryManagement')}
          />

          {/* ARTICLES */}
          <AdminRoleCard
            label="FLUX ARTICLES"
            description="Supervision des publications, assignation aux modérateurs."
            icon={FileStack}
            color="#10B981"
            locked={!canAccessContent}
            onPress={() => navigation.navigate('AdminArticles')}
          />

        </View>

        {/* FOOTER SÉCURITÉ */}
        <View style={styles.securityWrapper}>
          <View style={styles.securityDivider} />
          <View style={styles.securityInfo}>
            <Fingerprint color="#334155" size={18} />
            <Text style={styles.securityText}>
              SESSION SÉCURISÉE • PROTOCOLE WURO'EN V3{"\n"}
              ID: {user?._id?.substring(0, 12).toUpperCase() || 'SESSION_ACTIVE'}
            </Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#020617' },
  scrollContent:   { padding: 25 },
  headerSection:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30, marginTop: 10 },
  headerTextStack: { flex: 1 },
  headerTitle:     { fontSize: 32, fontWeight: '900', color: '#FFF', letterSpacing: -0.5 },
  headerSubtitle:  { fontSize: 12, color: COLORS.primary, fontWeight: '800', letterSpacing: 2, marginTop: 4 },
  adminBadge:      { backgroundColor: '#0F172A', padding: 12, borderRadius: 16, borderWidth: 1, borderColor: '#1E293B' },
  glassCard:       { backgroundColor: '#0F172A', padding: 20, borderRadius: 24, borderWidth: 1, borderColor: '#1E293B', flexDirection: 'row', alignItems: 'center', gap: 15, marginBottom: 35 },
  infoText:        { color: '#94A3B8', fontSize: 14, lineHeight: 22, flex: 1 },
  boldUser:        { color: '#FFF', fontWeight: '700' },
  sectionHeader:   { flexDirection: 'row', alignItems: 'center', gap: 15, marginBottom: 20 },
  sectionTitle:    { fontSize: 13, fontWeight: '900', color: '#475569', textTransform: 'uppercase', letterSpacing: 1.5 },
  titleLine:       { flex: 1, height: 1, backgroundColor: '#1E293B' },
  rolesWrapper:    { gap: 18 },
  roleCard:        { backgroundColor: '#0F172A', flexDirection: 'row', padding: 22, borderRadius: 28, alignItems: 'center', gap: 20, borderWidth: 1, borderColor: '#1E293B' },
  roleCardLocked:  { opacity: 0.4 },
  cardHeaderRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  chevronBox:      { backgroundColor: '#020617', padding: 4, borderRadius: 8 },
  roleIconBox:     { padding: 15, borderRadius: 20 },
  roleLabel:       { fontSize: 16, fontWeight: '900', letterSpacing: 0.5 },
  roleDesc:        { fontSize: 12, color: '#64748B', lineHeight: 18, fontWeight: '500' },
  securityWrapper: { marginTop: 60, marginBottom: 20 },
  securityDivider: { height: 1, backgroundColor: '#1E293B', width: '40%', alignSelf: 'center', marginBottom: 20 },
  securityInfo:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, opacity: 0.6 },
  securityText:    { color: '#475569', fontSize: 10, textAlign: 'left', fontWeight: '700', letterSpacing: 1, lineHeight: 14 },
});