import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Check, Globe } from 'lucide-react-native';

const languages = [
  { id: 'fr', name: 'Français (Bénin)', sub: 'Langue par défaut' },
  { id: 'en', name: 'English', sub: 'United States' },
  { id: 'ff', name: 'Fulfulde', sub: 'Pulaar / Peul' },
  { id: 'fon', name: 'Fon', sub: 'Fongbe (Bénin)' },
];

export default function LanguageSettingsScreen({ navigation }) {
  const [selected, setSelected] = useState('fr');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#FFF" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Langue</Text>
          <Text style={styles.headerSub}>Choisissez votre langue d'affichage</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.section}>
          {languages.map((lang) => (
            <TouchableOpacity 
              key={lang.id} 
              style={styles.langItem}
              onPress={() => setSelected(lang.id)}
            >
              <View style={styles.langLeft}>
                <View style={[styles.langIcon, selected === lang.id && styles.activeIcon]}>
                  <Globe size={18} color={selected === lang.id ? "#FFF" : "#475569"} />
                </View>
                <View>
                  <Text style={[styles.langName, selected === lang.id && styles.activeText]}>{lang.name}</Text>
                  <Text style={styles.langSub}>{lang.sub}</Text>
                </View>
              </View>
              {selected === lang.id && <Check size={20} color="#2563EB" />}
            </TouchableOpacity>
          ))}
        </View>
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
  scroll: { padding: 20 },
  section: { backgroundColor: 'rgba(15, 23, 42, 0.6)', borderRadius: 24, borderWidth: 1, borderColor: '#1E293B', overflow: 'hidden' },
  langItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#1E293B' },
  langLeft: { flexDirection: 'row', alignItems: 'center' },
  langIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#020617', justifyContent: 'center', alignItems: 'center', marginRight: 15, borderWidth: 1, borderColor: '#1E293B' },
  activeIcon: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  langName: { color: '#F8FAFC', fontSize: 16, fontWeight: '700' },
  activeText: { color: '#FFF' },
  langSub: { color: '#64748B', fontSize: 12, marginTop: 2 }
});