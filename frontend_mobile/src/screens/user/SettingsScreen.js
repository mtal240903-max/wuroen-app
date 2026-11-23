import React, { useContext, useState } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, ScrollView, 
  Switch, Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ChevronRight, Bell, Lock, Eye, LogOut, 
  Info, ShieldCheck, Globe, Moon, Database 
} from 'lucide-react-native';
import { COLORS } from '../../theme/theme';
import { AuthContext } from '../../context/AuthContext';

// Composant interne pour chaque ligne de paramètre
const SettingItem = ({ icon: Icon, title, subtitle, onPress, value, type = 'link', color = COLORS.primary }) => (
  <TouchableOpacity 
    style={styles.item} 
    onPress={onPress} 
    activeOpacity={0.7}
    disabled={type === 'switch'}
  >
    <View style={styles.itemLeft}>
      <View style={[styles.iconBg, { borderColor: `${color}30` }]}>
        <Icon size={18} color={color} />
      </View>
      <View>
        <Text style={styles.itemText}>{title}</Text>
        {subtitle && <Text style={styles.itemSubtitle}>{subtitle}</Text>}
      </View>
    </View>
    
    {type === 'link' && <ChevronRight size={18} color="#475569" />}
    {type === 'switch' && (
      <Switch 
        value={value} 
        onValueChange={onPress}
        trackColor={{ false: "#1E293B", true: `${COLORS.primary}80` }}
        thumbColor={value ? COLORS.primary : "#94A3B8"}
      />
    )}
  </TouchableOpacity>
);

export default function SettingsScreen({ navigation }) {
  const { logout } = useContext(AuthContext);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      "Déconnexion",
      "Voulez-vous vraiment quitter votre session sur Wuro'en ?",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Déconnexion", 
          style: "destructive", 
          onPress: async () => {
            await logout();
          } 
        }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Attention", 
      "La suppression de votre compte est irréversible. Toutes vos données seront effacées.",
      [
        { text: "Annuler", style: "cancel" },
        { text: "Supprimer", style: "destructive", onPress: () => {} }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Paramètres</Text>
        <Text style={styles.headerSub}>Gérez votre compte et vos préférences</Text>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scroll}
      >
        
        {/* 🔒 SECTION : SÉCURITÉ */}
        <Text style={styles.sectionTitle}>SÉCURITÉ & COMPTE</Text>
        <View style={styles.section}>
          <SettingItem 
            icon={Lock} 
            title="Confidentialité du profil" 
            subtitle="Gérez qui peut voir vos publications"
            onPress={() => navigation.navigate('ProfilePrivacy')} 
          />
          <SettingItem 
            icon={ShieldCheck} 
            title="Sécurité & Mot de passe" 
            onPress={() => navigation.navigate('Security')} 
          />
          <SettingItem 
            icon={Bell} 
            title="Notifications Push" 
            onPress={() => navigation.navigate('NotificationsSettings')} 
          />
        </View>

        {/* 🌐 SECTION : PRÉFÉRENCES */}
        <Text style={styles.sectionTitle}>PRÉFÉRENCES</Text>
        <View style={styles.section}>
          <SettingItem 
            icon={Globe} 
            title="Langue" 
            subtitle="Français (Bénin)"
            onPress={() => navigation.navigate('LanguageSettings')} 
          />
          <SettingItem 
            icon={Moon} 
            title="Mode Sombre" 
            type="switch"
            value={isDarkMode}
            onPress={() => setIsDarkMode(!isDarkMode)} 
          />
          <SettingItem 
            icon={Database} 
            title="Stockage & Données" 
            onPress={() => navigation.navigate('StorageSettings')} 
          />
        </View>

        {/* ℹ️ SECTION : SUPPORT */}
        <Text style={styles.sectionTitle}>SUPPORT & LÉGAL</Text>
        <View style={styles.section}>
          <SettingItem 
            icon={Info} 
            title="À propos de Wuro'en" 
            onPress={() => navigation.navigate('About')} 
          />
          <SettingItem 
            icon={Eye} 
            title="Politique de confidentialité" 
            onPress={() => navigation.navigate('PrivacyPolicy')} 
          />
        </View>

        {/* 🚪 ACTIONS DE COMPTE */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <View style={styles.logoutIconBg}>
            <LogOut size={20} color="#EF4444" />
          </View>
          <Text style={styles.logoutText}>Déconnexion</Text>
        </TouchableOpacity>

        <TouchableOpacity 
            style={[styles.logoutBtn, { marginTop: 12, borderColor: 'rgba(239, 68, 68, 0.1)', backgroundColor: 'transparent' }]} 
            onPress={handleDeleteAccount}
        >
          <Text style={[styles.logoutText, { fontSize: 13, opacity: 0.6 }]}>Supprimer le compte</Text>
        </TouchableOpacity>
        
        <Text style={styles.versionText}>Wuro'en v1.0.4 • MTaL Studio</Text>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  header: { padding: 25, paddingBottom: 15 },
  headerTitle: { fontSize: 32, fontWeight: '900', color: '#FFF' },
  headerSub: { fontSize: 14, color: '#64748B', marginTop: 5 },
  scroll: { paddingHorizontal: 20, paddingTop: 10 },
  sectionTitle: { 
    fontSize: 11, 
    fontWeight: '900', 
    color: '#475569', 
    marginBottom: 12, 
    marginLeft: 10,
    letterSpacing: 1.5,
    textTransform: 'uppercase'
  },
  section: { 
    backgroundColor: 'rgba(15, 23, 42, 0.6)', 
    borderRadius: 24, 
    paddingVertical: 8, 
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#1E293B'
  },
  item: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: 16 
  },
  itemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconBg: { 
    width: 42, 
    height: 42, 
    borderRadius: 14, 
    backgroundColor: '#020617', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 15,
    borderWidth: 1,
  },
  itemText: { fontSize: 16, color: '#F8FAFC', fontWeight: '700' },
  itemSubtitle: { fontSize: 12, color: '#64748B', marginTop: 2 },
  logoutBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)', 
    padding: 18, 
    borderRadius: 22,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)'
  },
  logoutIconBg: {
    marginRight: 12
  },
  logoutText: { color: '#EF4444', fontWeight: '800', fontSize: 16 },
  versionText: { 
    textAlign: 'center', 
    color: '#334155', 
    fontSize: 12, 
    marginTop: 40,
    fontWeight: '700' 
  }
});