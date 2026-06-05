import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Code2, Heart, Award, ShieldCheck } from 'lucide-react-native';

export default function AboutScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ⬅️ Barre supérieure */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#FFF" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>À propos</Text>
          <Text style={styles.headerSub}>L'histoire derrière l'application</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* 🚀 LOGO & MISSION */}
        <View style={styles.brandSection}>
          <Text style={styles.appName}>Wuro'en</Text>
          <Text style={styles.appVersion}>Version 1.0.4</Text>
          <Text style={styles.missionText}>
            Wuro'en est une plateforme dédiée à la vulgarisation scientifique et à la connexion entre les chercheurs, les étudiants et les passionnés de sciences au Bénin et dans toute la région.
          </Text>
        </View>

        {/* 📑 SECTION VALEURS */}
        <Text style={styles.sectionTitle}>Nos Piliers</Text>
        <View style={styles.section}>
          
          <View style={styles.row}>
            <View style={[styles.iconBg, { borderColor: 'rgba(59, 130, 246, 0.3)' }]}>
              <Award size={18} color="#3B82F6" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.rowTitle}>Excellence Scientifique</Text>
              <Text style={styles.rowSub}>Partager des savoirs rigoureux et vérifiés.</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={[styles.iconBg, { borderColor: 'rgba(16, 185, 129, 0.3)' }]}>
              <ShieldCheck size={18} color="#10B981" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.rowTitle}>Intégrité & Éthique</Text>
              <Text style={styles.rowSub}>Garantir le respect des droits d'auteur et des données.</Text>
            </View>
          </View>

        </View>

        {/* 💻 CRÉDITS */}
        <Text style={styles.sectionTitle}>Développement</Text>
        <View style={styles.section}>
          <View style={styles.row}>
            <View style={[styles.iconBg, { borderColor: 'rgba(168, 85, 247, 0.3)' }]}>
              <Code2 size={18} color="#A855F7" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.rowTitle}>Créé par MTaL Studio</Text>
              <Text style={styles.rowSub}>Conçu avec passion pour la communauté scientifique.</Text>
            </View>
          </View>
        </View>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Fait avec </Text>
          <Heart size={14} color="#EF4444" fill="#EF4444" />
          <Text style={styles.footerText}> pour la science</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  header: { padding: 25, paddingBottom: 15, flexDirection: 'row', alignItems: 'center' },
  backBtn: { marginRight: 20, padding: 8, backgroundColor: '#0F172A', borderRadius: 12, borderWidth: 1, borderColor: '#1E293B' },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#FFF' },
  headerSub: { fontSize: 13, color: '#64748B', marginTop: 2 },
  scroll: { paddingHorizontal: 20, paddingTop: 15 },
  brandSection: { alignItems: 'center', backgroundColor: 'rgba(15, 23, 42, 0.4)', borderRadius: 24, padding: 25, marginBottom: 25, borderWidth: 1, borderColor: '#1E293B' },
  appName: { fontSize: 28, fontWeight: '900', color: '#FFF', letterSpacing: 0.5 },
  appVersion: { fontSize: 12, color: '#2563EB', fontWeight: '700', marginTop: 4, textTransform: 'uppercase' },
  missionText: { fontSize: 14, color: '#94A3B8', textAlign: 'center', marginTop: 15, lineHeight: 22, fontWeight: '500' },
  sectionTitle: { fontSize: 11, fontWeight: '900', color: '#475569', marginBottom: 12, marginLeft: 10, letterSpacing: 1.5, textTransform: 'uppercase' },
  section: { backgroundColor: 'rgba(15, 23, 42, 0.6)', borderRadius: 24, paddingVertical: 4, marginBottom: 25, borderWidth: 1, borderColor: '#1E293B' },
  row: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  iconBg: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#020617', justifyContent: 'center', alignItems: 'center', marginRight: 15, borderWidth: 1 },
  textContainer: { flex: 1 },
  rowTitle: { fontSize: 15, color: '#F8FAFC', fontWeight: '700' },
  rowSub: { fontSize: 12, color: '#64748B', marginTop: 4, lineHeight: 16 },
  divider: { height: 1, backgroundColor: '#1E293B', marginHorizontal: 16 },
  footerRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10, marginBottom: 30 },
  footerText: { color: '#334155', fontSize: 12, fontWeight: '700' }
});