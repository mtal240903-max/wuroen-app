import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { ArrowLeft, Bell, MoreVertical, CheckCircle2, FileText, UserPlus, DollarSign } from 'lucide-react-native';

// --- Composants extraits pour la lisibilité ---

const StatMiniCard = ({ title, count, subtitle, subColor, lineColor, path }) => (
  <View style={styles.miniCard}>
    <Text style={styles.miniTitle}>{title}</Text>
    <Text style={styles.miniCount}>{count}</Text>
    <Text style={[styles.miniSub, { color: subColor }]}>{subtitle}</Text>
    <View style={styles.sparklineContainer}>
      <Svg height="30" width="100%">
        <Path d={path} fill="none" stroke={lineColor} strokeWidth={1.8} />
      </Svg>
    </View>
  </View>
);

const ActivityRow = ({ icon: Icon, bgIcon, title, time, sub, rightElement }) => (
  <View style={styles.activityRow}>
    <View style={[styles.iconRound, { backgroundColor: bgIcon }]}>
      <Icon color="#FFF" size={16} />
    </View>
    <View style={styles.activityMeta}>
      <View style={styles.actTopLine}>
        <Text style={styles.actTitle}>{title}</Text>
        <Text style={styles.actTime}>{time}</Text>
      </View>
      <Text style={styles.actSub}>{sub}</Text>
    </View>
    {rightElement}
  </View>
);

// --- Écran principal ---

export default function WorkspaceDashboardScreen({ navigation }) {
  // TODO: Remplacer par const { stats, activities } = useWorkspaceData();
  
  return (
    <View style={styles.container}>
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconAction}>
          <ArrowLeft color="#FFF" size={22} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Tableau de bord</Text>
        <TouchableOpacity style={styles.iconAction}>
          <Bell color="#FFF" size={22} />
          <View style={styles.badgeCount}><Text style={styles.badgeText}>3</Text></View>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.heroCard}>
          <View style={styles.heroLayout}>
            <View style={styles.heroTexts}>
              <Text style={styles.heroWelcome}>Bienvenue,{"\n"}Ibrahim 👋</Text>
              <Text style={styles.heroLabel}>Aperçu de votre espace de travail</Text>
            </View>
            <View style={styles.imageBox}>
              <Image source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80' }} style={styles.heroAvatarMock} />
              <View style={styles.brandBadge}><Text style={styles.brandBadgeText}>WURO'EN</Text></View>
            </View>
          </View>
        </View>

        <View style={styles.tripleGrid}>
          <StatMiniCard title="Projets" count="12" subtitle="+3 ce mois" subColor="#10B981" lineColor="#10B981" path="M0 20 Q15 5, 30 15 T60 5 T90 25" />
          <StatMiniCard title="Tâches" count="24" subtitle="+5 ce mois" subColor="#F59E0B" lineColor="#F59E0B" path="M0 10 Q20 25, 40 10 T80 20 T100 5" />
          <StatMiniCard title="Membres" count="8" subtitle="+2 ce mois" subColor="#8B5CF6" lineColor="#8B5CF6" path="M0 25 Q20 20, 40 15 T80 5 T100 12" />
        </View>

        <Text style={styles.sectionHeading}>Activité récente</Text>

        <View style={styles.activityFeedBox}>
          <ActivityRow icon={CheckCircle2} bgIcon="#10B981" title="Tâche terminée" time="2h" sub="Analyse données nutritionnelles" />
          <ActivityRow icon={FileText} bgIcon="#3B82F6" title="Nouveau doc" time="5h" sub="Rapport étude avicole.pdf" />
          <ActivityRow 
            icon={UserPlus} bgIcon="#EF4444" title="Membre ajouté" time="1j" sub="Awa Diop a rejoint le projet"
            rightElement={
              <View style={styles.miniStack}>
                <Image source={{ uri: 'https://i.pravatar.cc/50?img=3' }} style={styles.miniStackImg} />
                <Image source={{ uri: 'https://i.pravatar.cc/50?img=4' }} style={[styles.miniStackImg, { marginLeft: -6 }]} />
              </View>
            }
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090D1A', paddingTop: 50 },
  navbar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 15 },
  iconAction: { padding: 6 },
  navTitle: { fontSize: 18, fontWeight: '700', color: '#FFF', flex: 1, textAlign: 'center' },
  badgeCount: { position: 'absolute', right: 2, top: 2, backgroundColor: '#EF4444', width: 14, height: 14, borderRadius: 7, justifyContent: 'center', alignItems: 'center' },
  badgeText: { color: '#FFF', fontSize: 8, fontWeight: '800' },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 100 },
  heroCard: { backgroundColor: '#1A152E', borderRadius: 24, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: '#2E1F4D' },
  heroLayout: { flexDirection: 'row', justifyContent: 'space-between' },
  heroTexts: { flex: 1 },
  heroWelcome: { fontSize: 22, fontWeight: '800', color: '#FFF' },
  heroLabel: { fontSize: 12, color: '#94A3B8', marginTop: 8 },
  imageBox: { width: 85, height: 85, position: 'relative' },
  heroAvatarMock: { width: '100%', height: '100%', borderRadius: 42 },
  brandBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#000', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  brandBadgeText: { color: '#FFF', fontSize: 7, fontWeight: '900' },
  tripleGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  miniCard: { width: '31.5%', backgroundColor: '#111726', borderRadius: 16, padding: 12, borderWidth: 1, borderColor: '#1E293B', height: 120 },
  miniTitle: { fontSize: 10, color: '#64748B' },
  miniCount: { fontSize: 18, fontWeight: '800', color: '#FFF', marginTop: 4 },
  miniSub: { fontSize: 9, fontWeight: '600' },
  sparklineContainer: { width: '100%', height: 30, marginTop: 4 },
  sectionHeading: { fontSize: 16, fontWeight: '700', color: '#FFF', marginBottom: 15 },
  activityFeedBox: { backgroundColor: '#111726', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#1E293B' },
  activityRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  iconRound: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  activityMeta: { flex: 1, marginLeft: 12 },
  actTopLine: { flexDirection: 'row', justifyContent: 'space-between' },
  actTitle: { fontSize: 13, fontWeight: '700', color: '#FFF' },
  actTime: { fontSize: 10, color: '#64748B' },
  actSub: { fontSize: 11, color: '#94A3B8' },
  miniStack: { flexDirection: 'row' },
  miniStackImg: { width: 18, height: 18, borderRadius: 9, borderWidth: 1, borderColor: '#111726' }
});