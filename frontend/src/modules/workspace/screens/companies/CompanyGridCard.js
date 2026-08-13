import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Dimensions } from 'react-native';
import { MoreVertical, Briefcase, Users, Wallet } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

// 🌐 Remplacez par l'adresse IP de votre serveur backend
const API_BASE_URL = 'http://192.168.229.69:5000';

// Fonction utilitaire pour s'assurer que l'URL de l'image est complète
const getImageUrl = (imagePath, defaultUrl) => {
  if (!imagePath) return defaultUrl;
  // Si le chemin commence déjà par http ou https, on le laisse tel quel
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  // Sinon, on concatène l'URL de base du serveur
  return `${API_BASE_URL}/${imagePath.replace(/^\/+/, '')}`;
};

export default function CompanyGridCard({ item, onPress }) {
  const getStatusStyle = (status) => {
    if (status === 'En activité') return { bg: 'rgba(16, 185, 129, 0.2)', text: '#10B981' };
    if (status === 'En création') return { bg: 'rgba(245, 158, 11, 0.2)', text: '#F59E0B' };
    return { bg: 'rgba(59, 130, 246, 0.2)', text: '#3B82F6' };
  };

  const statusStyle = getStatusStyle(item.status);

  // 🖼️ Génération des URLs absolues
  const bgImageUrl = getImageUrl(item.bgImage, 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=400&q=80');
  const logoUrl = getImageUrl(item.logoUrl, 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=100&q=80');

  return (
    <TouchableOpacity style={styles.companyCard} activeOpacity={0.9} onPress={onPress}>
      {/* Image de couverture en arrière-plan */}
      <Image 
        source={{ uri: bgImageUrl }} 
        style={styles.cardBgImage} 
      />
      <LinearGradient colors={['rgba(9, 13, 26, 0.2)', '#111726']} style={styles.cardGradient} />

      <View style={styles.cardTopRow}>
        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
          <Text style={[styles.statusText, { color: statusStyle.text }]}>{item.status || 'Inconnu'}</Text>
        </View>
        <TouchableOpacity style={styles.moreBtn} onPress={(e) => e.stopPropagation()}>
          <MoreVertical color="#FFF" size={16} />
        </TouchableOpacity>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.logoAndTitleRow}>
          <Image 
            source={{ uri: logoUrl }} 
            style={styles.companyLogo} 
          />
          <View style={styles.titleContainer}>
            <View style={styles.nameVerifiedRow}>
              <Text style={styles.companyName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.verifiedCheck}>✓</Text>
            </View>
            <Text style={styles.companySector} numberOfLines={1}>{item.sector || 'Secteur non défini'}</Text>
            <Text style={styles.companyLocation} numberOfLines={1}>📍 {item.location || 'Non localisé'}</Text>
          </View>
        </View>

        <View style={styles.metricsGrid}>
          <View style={styles.metricItem}>
            <View style={styles.metricHeader}>
              <Briefcase color="#A5B4FC" size={10} />
              <Text style={styles.metricLabel}>Projets</Text>
            </View>
            <Text style={styles.metricValue}>{item.projects || 0}</Text>
          </View>
          
          <View style={styles.metricItem}>
            <View style={styles.metricHeader}>
              <Users color="#A5B4FC" size={10} />
              <Text style={styles.metricLabel}>Employés</Text>
            </View>
            <Text style={styles.metricValue}>{item.employees || item.staffCount || 0}</Text>
          </View>
          
          <View style={styles.metricItem}>
            <View style={styles.metricHeader}>
              <Wallet color="#A5B4FC" size={10} />
              <Text style={styles.metricLabel}>Invest.</Text>
            </View>
            <Text style={styles.metricValue}>{item.investment || '0M'}</Text>
          </View>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressTexts}>
            <Text style={styles.progressPercent}>{item.progress || 0}%</Text>
            <Text style={styles.progressLabel}>Progression</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${item.progress || 0}%`, backgroundColor: statusStyle.text }]} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
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
});