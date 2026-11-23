import React from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, 
  Platform 
} from 'react-native';
import { 
  ShieldCheck, FileSearch, Share2, 
  ChevronRight, ShieldAlert, LayoutGrid
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../theme/theme'; // Vérifie le chemin vers ton theme

export default function AdminMenu({ user }) {
  const navigation = useNavigation();

  // 🛡️ Sécurité : Rôle staff requis
  if (!user || !['admin', 'moderator', 'superadmin'].includes(user.role?.toLowerCase())) {
    return null;
  }

  const role = user.role.toLowerCase();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ShieldCheck color={COLORS.primary} size={16} />
        <Text style={styles.headerText}>PANEL DE GESTION WURO’EN</Text>
      </View>

      {/* --- 1. ESPACE MODÉRATEUR --- */}
      <TouchableOpacity 
        style={styles.menuCard} 
        onPress={() => navigation.navigate('ModerationScreen')}
        activeOpacity={0.8}
      >
        <View style={[styles.iconBox, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
          <FileSearch color="#10B981" size={22} />
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>Espace Modérateur</Text>
          <Text style={styles.cardSubTitle}>Valider et réviser les articles</Text>
        </View>
        <ChevronRight size={18} color="#475569" />
      </TouchableOpacity>

      {/* --- 2. ESPACE ADMINISTRATEUR --- */}
      {(role === 'admin' || role === 'superadmin') && (
        <TouchableOpacity 
          style={styles.menuCard} 
          onPress={() => navigation.navigate('AdminDashboard')}
          activeOpacity={0.8}
        >
          <View style={[styles.iconBox, { backgroundColor: 'rgba(255, 159, 28, 0.1)' }]}>
            <Share2 color="#FF9F1C" size={22} />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Espace Administrateur</Text>
            <Text style={styles.cardSubTitle}>Dispatching et base de données</Text>
          </View>
          <ChevronRight size={18} color="#475569" />
        </TouchableOpacity>
      )}

      {/* --- 3. ESPACE SUPERADMIN --- */}
      {role === 'superadmin' && (
        <TouchableOpacity 
          style={[styles.menuCard, styles.superAdminCard]} 
          onPress={() => navigation.navigate('SuperAdminDashboard')}
          activeOpacity={0.9}
        >
          <View style={styles.superAdminIconBox}>
            <LayoutGrid color="#FFF" size={22} />
          </View>
          <View style={styles.cardContent}>
            <Text style={[styles.cardTitle, { color: '#FFF' }]}>Espace SuperAdmin</Text>
            <Text style={[styles.cardSubTitle, { color: 'rgba(255, 255, 255, 0.7)' }]}>
              Membres et paramètres système
            </Text>
          </View>
          <ShieldAlert size={18} color="#FFF" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    paddingHorizontal: 20, 
    marginTop: 10, 
    marginBottom: 20 
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 15, 
    paddingLeft: 5, 
    gap: 8 
  },
  headerText: { 
    fontSize: 11, 
    fontWeight: '900', 
    color: '#64748B', 
    letterSpacing: 1.5 
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.5)', // Sombre translucide
    padding: 14,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  superAdminCard: {
    backgroundColor: '#6366F1', // Indigo vibrant
    borderColor: '#818CF8',
    borderWidth: 0,
    elevation: 8,
    shadowColor: '#6366F1',
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  iconBox: { 
    padding: 10, 
    borderRadius: 14, 
    marginRight: 15 
  },
  superAdminIconBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 10,
    borderRadius: 14,
    marginRight: 15
  },
  cardContent: { 
    flex: 1 
  },
  cardTitle: { 
    fontSize: 15, 
    fontWeight: '800', 
    color: '#F8FAFC' 
  },
  cardSubTitle: { 
    fontSize: 11, 
    color: '#94A3B8', 
    marginTop: 2, 
    fontWeight: '600' 
  },
});