import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, StatusBar, Dimensions } from 'react-native';
import { ArrowLeft, HardDrive, Activity, LayoutGrid } from 'lucide-react-native';
import { COLORS } from '../../../theme/theme';

const { width } = Dimensions.get('window');

const StorageCard = ({ percent, label, used, color }) => (
  <View style={styles.statCard}>
    <View style={styles.cardTop}>
      <View style={[styles.colorIndicator, { backgroundColor: color }]} />
      <Text style={styles.cardLabel}>{label}</Text>
    </View>
    <View style={styles.valueRow}>
      <Text style={[styles.cardPercent, { color }]}>{percent}%</Text>
      <Text style={styles.cardUsed}>{used}</Text>
    </View>
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${percent}%`, backgroundColor: color }]} />
    </View>
  </View>
);

export default function StorageStatsScreen({ navigation }) {
  const sectorsData = [
    { id: '1', name: 'Élevage', percent: 45, used: '4.1 GB', color: '#10B981' },
    { id: '2', name: 'Agronomie', percent: 20, used: '1.8 GB', color: '#3B82F6' },
    { id: '3', name: 'Technologie', percent: 15, used: '1.4 GB', color: '#7C3AED' },
    { id: '4', name: 'Santé Animale', percent: 10, used: '0.9 GB', color: '#EF4444' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* HEADER NAV */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backCircle}>
          <ArrowLeft color="#FFF" size={22} />
        </TouchableOpacity>
        <View>
          <Text style={styles.navSubtitle}>ANALYTICS CLOUD</Text>
          <Text style={styles.navTitle}>Stockage Système</Text>
        </View>
        <View style={styles.statusBadge}>
          <Activity color={COLORS.primary} size={14} />
          <Text style={styles.statusText}>Live</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollArea} showsVerticalScrollIndicator={false}>
        
        {/* CARTE GLOBALE */}
        <View style={styles.mainStorageBox}>
          <View style={styles.storageHeader}>
            <HardDrive color="#FFF" size={24} />
            <Text style={styles.storageMainValue}>9.2 GB <Text style={styles.totalCap}>/ 20 GB</Text></Text>
          </View>
          <View style={styles.mainProgressTrack}>
            <View style={[styles.mainProgressFill, { width: '46%' }]} />
          </View>
          <Text style={styles.storageDesc}>46% de la capacité totale allouée à Wuro'en est utilisée.</Text>
        </View>

        <View style={styles.sectionHeader}>
          <LayoutGrid color="#475569" size={16} />
          <Text style={styles.sectionTitle}>Répartition par secteur technique</Text>
        </View>
        
        <View style={styles.grid}>
          {sectorsData.map(sector => (
            <StorageCard 
              key={sector.id}
              label={sector.name}
              percent={sector.percent}
              used={sector.used}
              color={sector.color}
            />
          ))}
        </View>

        {/* INFO BANNER */}
        <View style={styles.infoBanner}>
          <Text style={styles.infoText}>
            Les données sont synchronisées en temps réel avec Cloudinary et votre instance MongoDB.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  navBar: { flexDirection: 'row', alignItems: 'center', padding: 20, gap: 15, borderBottomWidth: 1, borderBottomColor: '#1E293B' },
  backCircle: { backgroundColor: '#1E293B', padding: 10, borderRadius: 14 },
  navSubtitle: { color: COLORS.primary, fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  navTitle: { color: '#FFF', fontSize: 20, fontWeight: '800' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#0F172A', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#1E293B' },
  statusText: { color: '#FFF', fontSize: 10, fontWeight: '700' },

  scrollArea: { padding: 20 },
  mainStorageBox: { backgroundColor: COLORS.primary, padding: 25, borderRadius: 30, marginBottom: 35 },
  storageHeader: { flexDirection: 'row', alignItems: 'center', gap: 15, marginBottom: 20 },
  storageMainValue: { color: '#FFF', fontSize: 28, fontWeight: '900' },
  totalCap: { color: 'rgba(255,255,255,0.5)', fontSize: 16 },
  mainProgressTrack: { height: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 4, marginBottom: 15 },
  mainProgressFill: { height: 8, backgroundColor: '#FFF', borderRadius: 4 },
  storageDesc: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '600' },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  sectionTitle: { color: '#475569', fontSize: 12, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
  
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statCard: { 
    width: '48%', 
    backgroundColor: '#0F172A', 
    padding: 20, 
    borderRadius: 24, 
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#1E293B'
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  colorIndicator: { width: 8, height: 8, borderRadius: 4 },
  cardLabel: { color: '#94A3B8', fontSize: 12, fontWeight: '700' },
  valueRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 },
  cardPercent: { fontSize: 20, fontWeight: '900' },
  cardUsed: { color: '#475569', fontSize: 10, fontWeight: '700' },
  progressTrack: { height: 4, backgroundColor: '#020617', borderRadius: 2 },
  progressFill: { height: 4, borderRadius: 2 },

  infoBanner: { marginTop: 20, backgroundColor: '#0F172A', padding: 15, borderRadius: 16, borderStyle: 'dashed', borderWidth: 1, borderColor: '#1E293B' },
  infoText: { color: '#475569', fontSize: 11, textAlign: 'center', lineHeight: 16, fontWeight: '600' }
});