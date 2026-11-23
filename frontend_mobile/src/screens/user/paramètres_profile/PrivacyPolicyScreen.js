import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Shield, Eye, Lock, FileText } from 'lucide-react-native';

export default function PrivacyPolicyScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ⬅️ Barre supérieure */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#FFF" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Confidentialité</Text>
          <Text style={styles.headerSub}>Politique de traitement des données</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* 🛡️ INTRODUCTION */}
        <View style={styles.introBox}>
          <Shield size={22} color="#10B981" style={styles.introIcon} />
          <Text style={styles.introText}>
            Chez Wuro'en, nous prenons la protection de vos travaux de recherche et de vos données personnelles très au sérieux.
          </Text>
        </View>

        {/* 📑 SECTION 1 : COLLECTE */}
        <Text style={styles.sectionTitle}>1. Collecte des données</Text>
        <View style={styles.section}>
          <View style={styles.row}>
            <View style={styles.iconBg}><FileText size={18} color="#2563EB" /></View>
            <View style={styles.textContainer}>
              <Text style={styles.rowTitle}>Informations de profil</Text>
              <Text style={styles.rowSub}>
                Nous collectons votre nom, prénom, spécialité et adresse email lors de votre inscription pour authentifier votre statut de chercheur.
              </Text>
            </View>
          </View>
        </View>

        {/* 📑 SECTION 2 : UTILISATION */}
        <Text style={styles.sectionTitle}>2. Utilisation des données</Text>
        <View style={styles.section}>
          <View style={styles.row}>
            <View style={styles.iconBg}><Eye size={18} color="#A855F7" /></View>
            <View style={styles.textContainer}>
              <Text style={styles.rowTitle}>Affichage public</Text>
              <Text style={styles.rowSub}>
                Vos publications, interactions (likes, commentaires) et votre domaine d'expertise sont visibles par la communauté selon vos réglages de confidentialité.
              </Text>
            </View>
          </View>
        </View>

        {/* 📑 SECTION 3 : SÉCURITÉ */}
        <Text style={styles.sectionTitle}>3. Sécurité & Stockage</Text>
        <View style={styles.section}>
          <View style={styles.row}>
            <View style={styles.iconBg}><Lock size={18} color="#0EA5E9" /></View>
            <View style={styles.textContainer}>
              <Text style={styles.rowTitle}>Chiffrement des données</Text>
              <Text style={styles.rowSub}>
                Toutes les données de session et les mots de passe sont chiffrés et stockés de manière sécurisée sur nos serveurs.
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.updateText}>Dernière mise à jour : Mai 2026</Text>
        <View style={{ height: 30 }} />

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
  introBox: { flexDirection: 'row', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: 16, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.2)', alignItems: 'center', marginBottom: 25 },
  introIcon: { marginRight: 15 },
  introText: { flex: 1, fontSize: 13, color: '#10B981', lineHeight: 20, fontWeight: '600' },
  sectionTitle: { fontSize: 11, fontWeight: '900', color: '#475569', marginBottom: 12, marginLeft: 10, letterSpacing: 1.5, textTransform: 'uppercase' },
  section: { backgroundColor: 'rgba(15, 23, 42, 0.6)', borderRadius: 24, paddingVertical: 4, marginBottom: 25, borderWidth: 1, borderColor: '#1E293B' },
  row: { flexDirection: 'row', alignItems: 'center', padding: 18 },
  iconBg: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#020617', justifyContent: 'center', alignItems: 'center', marginRight: 15, borderWidth: 1, borderColor: '#1E293B' },
  textContainer: { flex: 1 },
  rowTitle: { fontSize: 15, color: '#F8FAFC', fontWeight: '700' },
  rowSub: { fontSize: 12, color: '#94A3B8', marginTop: 6, lineHeight: 18 },
  updateText: { textAlign: 'center', color: '#334155', fontSize: 11, fontWeight: '700', marginTop: 10 }
});