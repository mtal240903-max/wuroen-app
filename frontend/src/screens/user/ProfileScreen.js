import React, { useContext, useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Platform, ActivityIndicator, RefreshControl,
  Alert, Dimensions, Image, Modal
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import { COLORS } from '../../theme/theme';
import {
  Settings, FileText, Eye, ThumbsUp, LogOut,
  ChevronRight, BookOpen, Bell, ShieldCheck,
  Users, TrendingUp, Award, BarChart2, Zap, X, UserCheck, Calendar, MapPin, Phone, Info
} from 'lucide-react-native';
import AdminMenu from '../../components/AdminMenu';
import api from '../../services/api';

const { width: W, height: H } = Dimensions.get('window');

// ─────────────────────────────────────────────────────────────
// MINI GRAPHE SPARKBAR (OPTIMISÉ PRODUCTION)
// ─────────────────────────────────────────────────────────────
const SparkBar = React.memo(({ values = [], color = COLORS.primary, height = 36 }) => {
  const max = Math.max(...values, 1);
  const days = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  return (
    <View style={{ gap: 6 }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 5, height }}>
        {values.map((v, i) => (
          <View key={i} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
            <View style={{
              width: '100%',
              height: Math.max(4, (v / max) * height),
              backgroundColor: i === values.length - 1 ? color : color + '50',
              borderRadius: 4,
            }} />
          </View>
        ))}
      </View>
      <View style={{ flexDirection: 'row', gap: 5 }}>
        {days.map((d, i) => (
          <Text key={i} style={{ flex: 1, textAlign: 'center', color: '#475569', fontSize: 9, fontWeight: '700' }}>
            {d}
          </Text>
        ))}
      </View>
    </View>
  );
});

// ─────────────────────────────────────────────────────────────
// GRAPHE DE RÉPARTITION SIMPLIFIÉ (OPTIMISÉ PRODUCTION)
// ─────────────────────────────────────────────────────────────
const DonutChart = React.memo(({ total, published, pending, rejected }) => {
  const seg = (v) => total > 0 ? Math.round((v / total) * 100) : 0;
  const segments = [
    { label: 'Publiés',     value: seg(published), color: '#10B981' },
    { label: 'En attente', value: seg(pending),   color: '#F59E0B' },
    { label: 'Rejetés',   value: seg(rejected),  color: '#EF4444' },
  ];

  return (
    <View style={donut.container}>
      <View style={donut.center}>
        <View style={donut.ring}>
          {segments.map((s, i) => (
            <View
              key={i}
              style={[donut.segment, {
                flex: s.value || 1,
                backgroundColor: s.color,
                opacity: s.value === 0 ? 0.15 : 1,
              }]}
            />
          ))}
        </View>
      </View>
      <View style={donut.legend}>
        {segments.map((s, i) => (
          <View key={i} style={donut.legendRow}>
            <View style={[donut.dot, { backgroundColor: s.color }]} />
            <Text style={donut.legendLabel}>{s.label}</Text>
            <Text style={[donut.legendVal, { color: s.color }]}>{s.value}%</Text>
          </View>
        ))}
      </View>
    </View>
  );
});

const donut = StyleSheet.create({
  container: { gap: 20 },
  center:    { position: 'relative', height: 12, borderRadius: 6, overflow: 'hidden', marginBottom: 4 },
  ring:      { flexDirection: 'row', height: '100%', borderRadius: 6, overflow: 'hidden', gap: 2 },
  segment:   { borderRadius: 4 },
  legend:    { gap: 8 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dot:       { width: 8, height: 8, borderRadius: 4 },
  legendLabel:{ color: '#94A3B8', fontSize: 12, fontWeight: '600', flex: 1 },
  legendVal: { fontSize: 12, fontWeight: '900' },
});

// ─────────────────────────────────────────────────────────────
// CARTE STAT PRINCIPALE (OPTIMISÉ PRODUCTION)
// ─────────────────────────────────────────────────────────────
const StatCard = React.memo(({ icon: Icon, label, value, color, sub }) => (
  <View style={[stat.card, { borderColor: color + '25' }]}>
    <View style={[stat.iconBox, { backgroundColor: color + '15' }]}>
      <Icon size={18} color={color} />
    </View>
    <Text style={stat.value}>{value}</Text>
    <Text style={stat.label}>{label}</Text>
    {sub && <Text style={stat.sub}>{sub}</Text>}
  </View>
));

const stat = StyleSheet.create({
  card:    { width: (W - 52) / 3, backgroundColor: '#0A0F1E', borderRadius: 18, padding: 14, alignItems: 'center', borderWidth: 1 },
  iconBox: { width: 36, height: 36, borderRadius: 11, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  value:   { color: '#FFF', fontSize: 20, fontWeight: '900' },
  label:   { color: '#475569', fontSize: 10, fontWeight: '700', marginTop: 3, textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center' },
  sub:     { color: '#10B981', fontSize: 9, fontWeight: '700', marginTop: 4 },
});

// ─────────────────────────────────────────────────────────────
// LIGNE D'ACTION INTERACTIVE (OPTIMISÉ PRODUCTION)
// ─────────────────────────────────────────────────────────────
const ActionRow = React.memo(({ label, icon: Icon, onPress, isLast, color = '#F8FAFC', badgeCount = 0 }) => (
  <TouchableOpacity
    style={[styles.actionRow, isLast && { borderBottomWidth: 0 }]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.actionLeft}>
      <View style={[styles.actionIconBox, { backgroundColor: (color === '#F8FAFC' ? '#1E293B' : color + '15') }]}>
        <Icon size={16} color={color === '#F8FAFC' ? '#94A3B8' : color} />
      </View>
      <Text style={[styles.actionText, { color }]}>{label}</Text>
    </View>
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {badgeCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badgeCount > 99 ? '99+' : badgeCount}</Text>
        </View>
      )}
      <ChevronRight size={16} color="#334155" />
    </View>
  </TouchableOpacity>
));

// ─────────────────────────────────────────────────────────────
// LIGNE D'INFO DU MODAL (OPTIMISÉ PRODUCTION)
// ─────────────────────────────────────────────────────────────
const InfoDetailsRow = React.memo(({ icon: Icon, label, value }) => (
  <View style={styles.infoDetailRow}>
    <View style={styles.infoDetailIconBox}>
      <Icon size={16} color={COLORS.primary || '#00AEEF'} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.infoDetailLabel}>{label}</Text>
      <Text style={styles.infoDetailValue}>{value || "Non renseigné"}</Text>
    </View>
  </View>
));

// ─────────────────────────────────────────────────────────────
// ÉCRAN PRINCIPAL DU PROFIL
// ─────────────────────────────────────────────────────────────
export default function ProfileScreen({ navigation }) {
  const { user, logout, collabCount, updateAllNotifications } = useContext(AuthContext);

  const [profileData, setProfileData]   = useState(null);
  const [myArticles, setMyArticles]     = useState([]);
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);
  
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [isInfoModalVisible, setIsInfoModalVisible]   = useState(false);

  const isStaff = useMemo(() => ['admin', 'moderator', 'superadmin'].includes(user?.role), [user?.role]);

  const fetchAll = useCallback(async () => {
    try {
      const [profileRes, articlesRes] = await Promise.allSettled([
        api.get('/users/me/profile'),
        api.get('/articles/my'),
      ]);

      if (profileRes.status === 'fulfilled') setProfileData(profileRes.value.data);
      if (articlesRes.status === 'fulfilled') {
        const data = articlesRes.value.data?.articles ?? articlesRes.value.data ?? [];
        setMyArticles(Array.isArray(data) ? data : []);
      }

      if (updateAllNotifications) {
        await updateAllNotifications();
      }
    } catch (err) {
      // Les logs verbeux sont retirés ici pour la sécurité en production.
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [updateAllNotifications]);

  useFocusEffect(
    useCallback(() => {
      fetchAll();
    }, [fetchAll])
  );

  // ─── MÉMOÏSATION DES ANALYSES STATISTIQUES (OPTIMISATION RENDU) ───
  const computedStats = useMemo(() => {
    const stats = profileData?.stats || {};
    const articlesCount = stats.articlesCount ?? myArticles.length ?? 0;
    const totalViews    = stats.totalViews    ?? myArticles.reduce((s, a) => s + (a.views || 0), 0);
    const totalLikes    = stats.totalLikes    ?? myArticles.reduce((s, a) => s + (a.likes?.length || 0), 0);

    const published = myArticles.filter(a => a.status === 'published').length;
    const pending   = myArticles.filter(a => a.status === 'pending' || a.status === 'assigned').length;
    const rejected  = myArticles.filter(a => a.status === 'rejected').length;

    const viewsWeek = stats.weeklyViews && stats.weeklyViews.length === 7 ? stats.weeklyViews : [0, 0, 0, 0, 0, 0, 0];
    const likesWeek = stats.weeklyLikes && stats.weeklyLikes.length === 7 ? stats.weeklyLikes : [0, 0, 0, 0, 0, 0, 0];

    return { articlesCount, totalViews, totalLikes, published, pending, rejected, viewsWeek, likesWeek };
  }, [profileData, myArticles]);

  const userName    = profileData?.name     || user?.name     || 'Chercheur';
  const specialty   = profileData?.specialty|| user?.specialty|| 'Scientifique';
  const bio         = profileData?.bio      || user?.bio      || "Passionné par les sciences.";
  const firstLetter = userName.charAt(0).toUpperCase();
  const followers   = profileData?.stats?.followersCount  ?? 0;
  const following   = profileData?.stats?.followingCount  ?? 0;
  
  const fullAvatarUrl = useMemo(() => {
    const avatarUri = profileData?.avatar || user?.avatar || null;
    if (!avatarUri) return null;
    return avatarUri.startsWith('http') ? avatarUri : `${api.defaults.baseURL}${avatarUri}`;
  }, [profileData?.avatar, user?.avatar]);

  const handleLogout = useCallback(() => {
    Alert.alert(
      "Déconnexion",
      "Voulez-vous vraiment couper la session sur ce terminal ?",
      [
        { text: "Annuler", style: "cancel" },
        { text: "Déconnexion", style: "destructive", onPress: logout }
      ]
    );
  }, [logout]);

  if (loading && !refreshing) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={COLORS.primary || '#00AEEF'} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#020617' }}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={() => { setRefreshing(true); fetchAll(); }} 
            tintColor={COLORS.primary || '#00AEEF'} 
          />
        }
      >
        <StatusBar barStyle="light-content" />

        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>Mon Espace</Text>
            <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Settings')}>
              <Settings size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <View style={styles.profileCenter}>
            <TouchableOpacity 
              activeOpacity={0.85} 
              style={styles.avatarWrapper}
              onPress={() => fullAvatarUrl ? setIsImageModalVisible(true) : Alert.alert("Profil", "Aucune photo de profil définie.")}
            >
              <View style={styles.avatarRing}>
                <View style={styles.avatar}>
                  {fullAvatarUrl ? (
                    <Image source={{ uri: fullAvatarUrl }} style={styles.avatarImage} />
                  ) : (
                    <Text style={styles.avatarText}>{firstLetter}</Text>
                  )}
                </View>
              </View>
              {user?.isVerified && (
                <View style={styles.verifiedBadge}>
                  <Award size={12} color="#FFF" />
                </View>
              )}
              <View style={styles.onlineDot} />
            </TouchableOpacity>

            <Text style={styles.userName}>{userName}</Text>

            <View style={styles.specialtyPill}>
              <ShieldCheck size={12} color={COLORS.primary || '#00AEEF'} />
              <Text style={styles.specialtyText}>{specialty}</Text>
            </View>

            <Text style={styles.bio}>{bio}</Text>

            <View style={styles.networkRow}>
              <View style={styles.networkItem}>
                <Text style={styles.networkVal}>{following}</Text>
                <Text style={styles.networkLabel}>Abonnements</Text>
              </View>
              <View style={styles.networkSep} />
              <View style={styles.networkItem}>
                <Text style={styles.networkVal}>{followers}</Text>
                <Text style={styles.networkLabel}>Abonnés</Text>
              </View>
              <View style={styles.networkSep} />
              <View style={styles.networkItem}>
                <Text style={styles.networkVal}>{computedStats.articlesCount}</Text>
                <Text style={styles.networkLabel}>Publications</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('EditProfile')}>
            <Text style={styles.editBtnText}>Modifier mon profil</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <StatCard icon={FileText}  label="Articles" value={computedStats.articlesCount} color="#00AEEF" sub={`+${computedStats.published} publiés`} />
          <StatCard icon={Eye}       label="Vues"     value={computedStats.totalViews > 999 ? `${(computedStats.totalViews/1000).toFixed(1)}k` : computedStats.totalViews} color="#10B981" />
          <StatCard icon={ThumbsUp}  label="Likes"     value={computedStats.totalLikes}    color="#F43F5E" />
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <BarChart2 size={16} color={COLORS.primary || '#00AEEF'} />
              <Text style={styles.cardTitle}>Vues cette semaine</Text>
            </View>
            <View style={styles.trendBadge}>
              <TrendingUp size={10} color="#10B981" />
              <Text style={styles.trendText}>+{Math.round((computedStats.viewsWeek[6] / Math.max(computedStats.viewsWeek[0], 1) - 1) * 100)}%</Text>
            </View>
          </View>
          <Text style={styles.bigNumber}>{computedStats.viewsWeek[6]} <Text style={styles.bigSub}>aujourd'hui</Text></Text>
          <SparkBar values={computedStats.viewsWeek} color={COLORS.primary || '#00AEEF'} height={50} />
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <Zap size={16} color="#F43F5E" />
              <Text style={styles.cardTitle}>Engagement (likes)</Text>
            </View>
            <View style={[styles.trendBadge, { backgroundColor: '#F43F5E15' }]}>
              <TrendingUp size={10} color="#F43F5E" />
              <Text style={[styles.trendText, { color: '#F43F5E' }]}>
                +{Math.round((computedStats.likesWeek[6] / Math.max(computedStats.likesWeek[0], 1) - 1) * 100)}%
              </Text>
            </View>
          </View>
          <Text style={styles.bigNumber}>{computedStats.likesWeek[6]} <Text style={styles.bigSub}>aujourd'hui</Text></Text>
          <SparkBar values={computedStats.likesWeek} color="#F43F5E" height={50} />
        </View>

        {computedStats.articlesCount > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleRow}>
                <FileText size={16} color="#8B5CF6" />
                <Text style={styles.cardTitle}>Répartition publications</Text>
              </View>
              <Text style={styles.totalPill}>{computedStats.articlesCount} total</Text>
            </View>
            <DonutChart
              total={computedStats.articlesCount}
              published={computedStats.published}
              pending={computedStats.pending}
              rejected={computedStats.rejected}
            />
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Réseau & Contenu</Text>
          <ActionRow label="Détails du compte" icon={Info} color={COLORS.primary || '#00AEEF'} onPress={() => setIsInfoModalVisible(true)} />
          <ActionRow label="Collaborations"   icon={Users}    badgeCount={collabCount} onPress={() => navigation.navigate('CollaborationRequests')} />
          <ActionRow label="Mes publications" icon={FileText}  onPress={() => navigation.navigate('MyArticles')} />
          <ActionRow label="Bibliothèque"     icon={BookOpen}  onPress={() => navigation.navigate('SavedArticles')} />
          <ActionRow label="Notifications"    icon={Bell}      onPress={() => navigation.navigate('Notifications')} isLast />
        </View>

        {isStaff && <AdminMenu user={user} />}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sécurité</Text>
          <ActionRow label="Confidentialité" icon={ShieldCheck} onPress={() => Alert.alert("Confidentialité", "Paramètres de chiffrement activés.")} />
          <ActionRow label="Se déconnecter" icon={LogOut} color="#EF4444" isLast onPress={handleLogout} />
        </View>

        <Text style={styles.version}>Wuro'en v1.4.0 • MTal Studio</Text>
      </ScrollView>

      {/* ── MODAL 1 : VISIONNEUSE ── */}
      <Modal visible={isImageModalVisible} transparent={true} animationType="fade" onRequestClose={() => setIsImageModalVisible(false)}>
        <View style={styles.modalBackground}>
          <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setIsImageModalVisible(false)}>
            <X size={24} color="#FFF" />
          </TouchableOpacity>
          {fullAvatarUrl && <Image source={{ uri: fullAvatarUrl }} style={styles.modalFullImage} resizeMode="contain" />}
        </View>
      </Modal>

      {/* ── MODAL 2 : DETAILS ── */}
      <Modal visible={isInfoModalVisible} transparent={true} animationType="slide" onRequestClose={() => setIsInfoModalVisible(false)}>
        <View style={styles.infoModalBackground}>
          <View style={styles.infoModalContainer}>
            <View style={styles.infoModalHeader}>
              <Text style={styles.infoModalTitle}>DÉTAILS DU PROFIL</Text>
              <TouchableOpacity style={styles.infoModalClose} onPress={() => setIsInfoModalVisible(false)}>
                <X size={20} color="#94A3B8" />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.infoModalScroll} showsVerticalScrollIndicator={false}>
              <InfoDetailsRow icon={UserCheck} label="Prénom" value={profileData?.firstName || user?.firstName} />
              <InfoDetailsRow icon={UserCheck} label="Nom de famille" value={profileData?.lastName || user?.lastName} />
              <InfoDetailsRow icon={ShieldCheck} label="Spécialité / Emploi" value={profileData?.specialty || user?.specialty} />
              <InfoDetailsRow icon={Calendar} label="Date de naissance" value={profileData?.birthDate || user?.birthDate} />
              <InfoDetailsRow icon={MapPin} label="Localisation" value={profileData?.location || user?.location} />
              <InfoDetailsRow icon={Phone} label="Numéro de Téléphone" value={profileData?.phone || user?.phone} />
              <View style={{ marginTop: 10, gap: 6 }}>
                <Text style={styles.infoDetailLabel}>BIOGRAPHIE COMPLÈTE</Text>
                <Text style={styles.infoBioText}>{profileData?.bio || user?.bio || "Aucune biographie rédigée pour le moment."}</Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  loader:    { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#020617' },
  header:       { backgroundColor: '#0A0F1E', paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingBottom: 28, paddingHorizontal: 20, borderBottomLeftRadius: 36, borderBottomRightRadius: 36, borderWidth: 1, borderColor: '#1E293B' },
  headerTop:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  headerTitle:  { color: '#FFF', fontSize: 18, fontWeight: '800' },
  iconBtn:      { width: 38, height: 38, backgroundColor: '#1E293B', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  profileCenter:{ alignItems: 'center' },
  avatarWrapper:{ position: 'relative', marginBottom: 16 },
  avatarRing:   { width: 108, height: 108, borderRadius: 34, borderWidth: 2, borderColor: (COLORS.primary || '#00AEEF') + '60', padding: 4, justifyContent: 'center', alignItems: 'center' },
  avatar:       { width: '100%', height: '100%', borderRadius: 30, backgroundColor: COLORS.primary || '#00AEEF', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  avatarImage:  { width: '100%', height: '100%', resizeMode: 'cover' },
  avatarText:   { color: '#FFF', fontSize: 38, fontWeight: '900' },
  verifiedBadge:{ position: 'absolute', top: -4, right: -4, width: 24, height: 24, borderRadius: 8, backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#020617' },
  onlineDot:    { position: 'absolute', bottom: 4, right: 4, width: 16, height: 16, borderRadius: 8, backgroundColor: '#22C55E', borderWidth: 3, borderColor: '#0A0F1E' },
  userName:     { color: '#FFF', fontSize: 24, fontWeight: '900' },
  specialtyPill:{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: (COLORS.primary || '#00AEEF') + '15', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, marginTop: 10, borderWidth: 1, borderColor: (COLORS.primary || '#00AEEF') + '30' },
  specialtyText:{ color: COLORS.primary || '#00AEEF', fontSize: 13, fontWeight: '700' },
  bio:          { color: '#64748B', fontSize: 13, textAlign: 'center', marginTop: 12, lineHeight: 20, paddingHorizontal: 24 },
  networkRow:   { flexDirection: 'row', alignItems: 'center', marginTop: 20, backgroundColor: '#020617', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#1E293B' },
  networkItem:  { flex: 1, alignItems: 'center' },
  networkVal:   { color: '#FFF', fontSize: 18, fontWeight: '900' },
  networkLabel: { color: '#475569', fontSize: 10, fontWeight: '700', marginTop: 2 },
  networkSep:   { width: 1, height: 28, backgroundColor: '#1E293B' },
  editBtn:      { marginTop: 20, backgroundColor: '#1E293B', paddingVertical: 14, borderRadius: 18, alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  editBtnText:  { color: '#FFF', fontWeight: '700', fontSize: 14 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: -20, gap: 6 },
  card:        { backgroundColor: '#0A0F1E', marginHorizontal: 20, marginTop: 16, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#1E293B' },
  cardHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardTitleRow:{ flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle:   { color: '#FFF', fontSize: 14, fontWeight: '800' },
  trendBadge:  { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#10B98115', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  trendText:   { color: '#10B981', fontSize: 10, fontWeight: '800' },
  bigNumber:   { color: '#FFF', fontSize: 28, fontWeight: '900', marginBottom: 16 },
  bigSub:      { color: '#475569', fontSize: 14, fontWeight: '600' },
  totalPill:   { color: '#8B5CF6', fontSize: 11, fontWeight: '800', backgroundColor: '#8B5CF615', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  section:       { backgroundColor: '#0A0F1E', marginTop: 16, marginHorizontal: 20, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#1E293B' },
  sectionTitle:  { fontSize: 10, fontWeight: '900', color: '#334155', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 2 },
  actionRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#1E293B' },
  actionLeft:    { flexDirection: 'row', alignItems: 'center', gap: 14 },
  actionIconBox: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  actionText:    { fontSize: 14, fontWeight: '600' },
  badge:         { backgroundColor: '#EF4444', borderRadius: 10, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 5, marginRight: 8 },
  badgeText:     { color: '#FFF', fontSize: 10, fontWeight: '900' },
  version: { textAlign: 'center', color: '#1E293B', fontSize: 11, marginVertical: 40, fontWeight: '700' },
  modalBackground: { flex: 1, backgroundColor: 'rgba(2, 6, 23, 0.95)', justifyContent: 'center', alignItems: 'center' },
  modalCloseBtn: { position: 'absolute', top: Platform.OS === 'ios' ? 60 : 40, right: 20, width: 44, height: 44, backgroundColor: '#1E293B', borderRadius: 22, justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  modalFullImage: { width: W, height: H * 0.7 },
  infoModalBackground: { flex: 1, backgroundColor: 'rgba(2, 6, 23, 0.8)', justifyContent: 'flex-end' },
  infoModalContainer: { backgroundColor: '#0A0F1E', borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingHorizontal: 24, paddingTop: 24, maxHeight: H * 0.75, borderWidth: 1, borderColor: '#1E293B' },
  infoModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#1E293B' },
  infoModalTitle: { color: '#FFF', fontSize: 14, fontWeight: '900', letterSpacing: 1 },
  infoModalClose: { width: 32, height: 32, backgroundColor: '#1E293B', borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  infoModalScroll: { paddingBottom: 40 },
  infoDetailRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#0F172A' },
  infoDetailIconBox: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#1E293B', justifyContent: 'center', alignItems: 'center' },
  infoDetailLabel: { color: '#475569', fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  infoDetailValue: { color: '#F8FAFC', fontSize: 14, fontWeight: '600', marginTop: 2 },
  infoBioText: { color: '#94A3B8', fontSize: 13, lineHeight: 20, backgroundColor: '#020617', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#1E293B', marginTop: 4 }
});