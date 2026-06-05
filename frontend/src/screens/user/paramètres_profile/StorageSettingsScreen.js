import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Database, Trash2, Wifi, Image } from 'lucide-react-native';

export default function StorageSettingsScreen({ navigation }) {
  const [autoDownload, setAutoDownload] = useState(false);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#FFF" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Stockage</Text>
          <Text style={styles.headerSub}>Optimisez l'espace de votre appareil</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.usageCard}>
          <View style={styles.usageHeader}>
            <Database size={20} color="#2563EB" />
            <Text style={styles.usageTitle}>Espace utilisé</Text>
          </View>
          <Text style={styles.usageValue}>124 MB</Text>
          <View style={styles.progressBar}><View style={[styles.progressFill, { width: '30%' }]} /></View>
          <Text style={styles.usageSub}>Cache et fichiers temporaires</Text>
        </View>

        <Text style={styles.sectionTitle}>Téléchargement automatique</Text>
        <View style={styles.section}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={styles.iconBg}><Image size={18} color="#A855F7" /></View>
              <Text style={styles.rowTitle}>Utiliser les données mobiles</Text>
            </View>
            <Switch 
              value={autoDownload} 
              onValueChange={setAutoDownload}
              trackColor={{ false: "#1E293B", true: "#2563EB" }}
            />
          </View>
        </View>

        <TouchableOpacity 
          style={styles.clearBtn} 
          onPress={() => Alert.alert("Cache vidé", "L'espace a été libéré.")}
        >
          <Trash2 size={20} color="#EF4444" />
          <Text style={styles.clearText}>Vider le cache de l'application</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  header: { padding: 25, flexDirection: 'row', alignItems: 'center' },
  backBtn: { marginRight: 20, padding: 8, backgroundColor: '#0F172A', borderRadius: 12 },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#FFF' },
  headerSub: { fontSize: 13, color: '#64748B' },
  scroll: { paddingHorizontal: 20 },
  usageCard: { backgroundColor: 'rgba(37, 99, 235, 0.1)', padding: 20, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(37, 99, 235, 0.2)', marginBottom: 25 },
  usageHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  usageTitle: { color: '#2563EB', fontWeight: '800', marginLeft: 10, fontSize: 12, textTransform: 'uppercase' },
  usageValue: { color: '#FFF', fontSize: 32, fontWeight: '900' },
  progressBar: { height: 6, backgroundColor: '#1E293B', borderRadius: 3, marginVertical: 15 },
  progressFill: { height: '100%', backgroundColor: '#2563EB', borderRadius: 3 },
  usageSub: { color: '#64748B', fontSize: 12 },
  sectionTitle: { fontSize: 11, fontWeight: '900', color: '#475569', marginBottom: 12, letterSpacing: 1 },
  section: { backgroundColor: 'rgba(15, 23, 42, 0.6)', borderRadius: 24, borderWidth: 1, borderColor: '#1E293B' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 18 },
  rowLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBg: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#020617', justifyContent: 'center', alignItems: 'center', marginRight: 15, borderWidth: 1, borderColor: '#1E293B' },
  rowTitle: { color: '#FFF', fontWeight: '700' },
  clearBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 20, padding: 18, borderRadius: 20, backgroundColor: 'rgba(239, 68, 68, 0.1)', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.2)' },
  clearText: { color: '#EF4444', fontWeight: '800', marginLeft: 10 }
});