import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Users, Archive, BellRing, ShieldAlert, ArrowLeft } from 'lucide-react-native';
import { COLORS } from '../../theme/theme';

export default function MessageOptionsScreen({ navigation }) {
  
  const OptionItem = ({ icon: Icon, title, subtitle, onPress, color = "#FFF" }) => (
    <TouchableOpacity style={styles.optionCard} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.iconWrapper, { backgroundColor: '#0F172A' }]}>
        <Icon size={22} color={color} />
      </View>
      <View style={styles.optionText}>
        <Text style={styles.optionTitle}>{title}</Text>
        <Text style={styles.optionSubtitle}>{subtitle}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Options Messagerie</Text>
        <View style={{ width: 44 }} /> 
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionLabel}>Actions de groupe</Text>
        <OptionItem 
          icon={Users} 
          title="Créer un groupe" 
          subtitle="Discuter avec plusieurs experts"
          color={COLORS.primary}
          onPress={() => navigation.navigate('CreateGroup')} 
        />

        <Text style={styles.sectionLabel}>Gestion & Alertes</Text>
        <OptionItem 
          icon={Archive} 
          title="Discussions archivées" 
          subtitle="Retrouver vos anciens échanges"
          onPress={() => navigation.navigate('ArchivedChats')}
        />
        
        {/* ✅ Mise à jour : Redirection vers l'écran de réglages complet */}
        <OptionItem 
          icon={BellRing} 
          title="Notifications & Alertes" 
          subtitle="Activer ou désactiver le mode silencieux"
          color={COLORS.primary}
          onPress={() => navigation.navigate('MuteSettings')} 
        />

        <Text style={styles.sectionLabel}>Sécurité</Text>
        <OptionItem 
          icon={ShieldAlert} 
          title="Signalements & Blocus" 
          subtitle="Gérer les contacts restreints"
          color="#EF4444"
          onPress={() => navigation.navigate('BlockedUsers')}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 15, 
    paddingVertical: 10 
  },
  backBtn: {
    padding: 10,
    backgroundColor: '#0F172A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E293B'
  },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  scrollContent: { padding: 20 },
  sectionLabel: { 
    color: '#475569', 
    fontSize: 11, 
    fontWeight: '900', 
    textTransform: 'uppercase', 
    marginBottom: 15, 
    marginTop: 20, 
    letterSpacing: 1.5 
  },
  optionCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#0F172A', 
    padding: 16, 
    borderRadius: 20, 
    marginBottom: 12, 
    borderWidth: 1, 
    borderColor: '#1E293B' 
  },
  iconWrapper: { 
    width: 48, 
    height: 48, 
    borderRadius: 16, 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: '#1E293B' 
  },
  optionText: { marginLeft: 15, flex: 1 },
  optionTitle: { color: '#F8FAFC', fontSize: 16, fontWeight: '700' },
  optionSubtitle: { color: '#64748B', fontSize: 13, marginTop: 2 }
});