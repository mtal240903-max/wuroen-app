import React, { useContext, useState, useCallback } from 'react'; 
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  StatusBar, Platform, ActivityIndicator, RefreshControl, Alert
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';

import { AuthContext } from '../../context/AuthContext';
import { COLORS } from '../../theme/theme';
import { 
  Settings, FileText, Eye, ThumbsUp, LogOut, 
  ChevronRight, BookOpen, Bell, ShieldCheck, Users
} from 'lucide-react-native';

// --- Composant StatItem ---
const StatItem = ({ label, value, icon: Icon }) => (
  <View style={styles.statBox}>
    <View style={styles.iconCircle}>
      <Icon size={18} color={COLORS.primary} />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

// --- Composant ActionRow ---
const ActionRow = ({ label, icon: Icon, onPress, isLast, color = COLORS.textPrimary, badgeCount = 0 }) => (
  <TouchableOpacity 
    style={[styles.actionRow, isLast && { borderBottomWidth: 0 }]} 
    onPress={onPress}
  >
    <View style={styles.actionLeft}>
      <Icon size={20} color={color} style={styles.actionIcon} />
      <Text style={[styles.actionText, { color }]}>{label}</Text>
    </View>
    
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {badgeCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badgeCount > 99 ? '99+' : badgeCount}</Text>
        </View>
      )}
      <ChevronRight size={18} color={COLORS.textSecondary} />
    </View>
  </TouchableOpacity>
);

export default function ProfileScreen({ navigation }) {
  // ✅ On récupère collabCount et la fonction de mise à jour globale du contexte
  const { user, logout, userToken, collabCount, updateAllNotifications } = useContext(AuthContext);
  
  const [stats, setStats] = useState({ 
    articles: 0, 
    views: 0, 
    likes: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUserStats = async () => {
    if (!userToken) return;
    try {
      // 1. Récupération des stats de contenu (Articles, Vues, Likes)
      const response = await axios.get('https://wuroen-api.onrender.com/api/users/me/stats', {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      
      if (response.data) {
        setStats({
          articles: response.data.articles ?? 0,
          views: response.data.views ?? 0,
          likes: response.data.likes ?? 0
        });
      }

      // 2. ✅ Mise à jour synchronisée des badges (Messages & Collaborations)
      await updateAllNotifications();

    } catch (error) {
      console.error("Erreur stats profil:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUserStats();
    }, [userToken])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchUserStats();
  };

  const handleLogout = () => {
    Alert.alert(
      "Déconnexion",
      "Voulez-vous vraiment quitter Wuro’en ?",
      [
        { text: "Annuler", style: "cancel" },
        { text: "Déconnexion", onPress: logout, style: "destructive" }
      ]
    );
  };

  const userName = user?.name || "Chercheur";
  const userSpecialty = user?.specialty || "Scientifique";
  const userBio = user?.bio || "Passionné par l'innovation.";
  const firstLetter = userName.charAt(0).toUpperCase();

  if (loading && !refreshing) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
      }
    >
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <View style={styles.topActions}>
          <Text style={styles.headerTitle}>Mon Espace</Text>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Settings')}>
            <Settings size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.profileInfo}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarLetter}>{firstLetter}</Text>
            <View style={styles.onlineBadge} />
          </View>
          
          <Text style={styles.userName}>{userName}</Text>
          
          <View style={styles.specialtyBadge}>
            <ShieldCheck size={14} color={COLORS.primary} />
            <Text style={styles.specialtyText}>{userSpecialty}</Text>
          </View>

          <Text style={styles.userBio}>{userBio}</Text>
        </View>

        <TouchableOpacity 
          style={styles.editBtn} 
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Text style={styles.editBtnText}>Modifier mon profil</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <StatItem 
          label="Articles" 
          value={stats.articles.toString()} 
          icon={FileText} 
        />
        <StatItem 
          label="Vues" 
          value={stats.views.toString()} 
          icon={Eye} 
        />
        <StatItem 
          label="Likes" 
          value={stats.likes.toString()} 
          icon={ThumbsUp} 
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Réseau & Contenu</Text>
        <ActionRow 
          label="Collaborations" 
          icon={Users} 
          // ✅ Utilisation du badge global pour les collaborations
          badgeCount={collabCount} 
          onPress={() => navigation.navigate('CollaborationRequests')} 
        />
        <ActionRow label="Mes publications" icon={FileText} onPress={() => navigation.navigate('MyArticles')} />
        <ActionRow label="Bibliothèque" icon={BookOpen} onPress={() => navigation.navigate('SavedArticles')} />
        <ActionRow label="Notifications" icon={Bell} isLast />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sécurité</Text>
        <ActionRow label="Confidentialité" icon={ShieldCheck} />
        <ActionRow 
          label="Se déconnecter" 
          icon={LogOut} 
          color={COLORS.error} 
          onPress={handleLogout}
          isLast 
        />
      </View>
      
      <Text style={styles.versionText}>Wuro’en v1.0.2 • {userName}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FE' },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FE' },
    header: { 
      backgroundColor: '#FFF', 
      paddingTop: Platform.OS === 'ios' ? 60 : 40, 
      paddingBottom: 30, 
      paddingHorizontal: 20,
      borderBottomLeftRadius: 35, 
      borderBottomRightRadius: 35,
      elevation: 5,
      shadowColor: "#000",
      shadowOpacity: 0.05,
      shadowRadius: 10,
    },
    topActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.textPrimary },
    profileInfo: { alignItems: 'center' },
    avatarLarge: { 
      width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.primary, 
      justifyContent: 'center', alignItems: 'center', marginBottom: 15, borderWidth: 3, borderColor: '#F0F4FF'
    },
    onlineBadge: { 
      position: 'absolute', bottom: 5, right: 5, width: 18, height: 18, borderRadius: 9, 
      backgroundColor: '#4CAF50', borderWidth: 3, borderColor: '#FFF' 
    },
    avatarLetter: { color: '#FFF', fontSize: 40, fontWeight: 'bold' },
    userName: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary },
    specialtyBadge: { 
      flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F4FF', 
      paddingVertical: 5, paddingHorizontal: 15, borderRadius: 20, marginTop: 8 
    },
    specialtyText: { color: COLORS.primary, fontSize: 13, fontWeight: '700', marginLeft: 6 },
    userBio: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', marginTop: 12, lineHeight: 20, paddingHorizontal: 15 },
    editBtn: { marginTop: 20, backgroundColor: '#F8F9FE', paddingVertical: 12, width: '100%', borderRadius: 15, alignItems: 'center', borderWidth: 1, borderColor: '#E8EFFF' },
    editBtnText: { color: COLORS.primary, fontWeight: 'bold' },
    statsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: -25 },
    statBox: { 
      backgroundColor: '#FFF', padding: 15, borderRadius: 20, alignItems: 'center', width: '30%', 
      elevation: 8, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 12,
    },
    iconCircle: { backgroundColor: '#F0F4FF', padding: 8, borderRadius: 12, marginBottom: 5 },
    statValue: { fontSize: 18, fontWeight: 'bold', color: COLORS.textPrimary },
    statLabel: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
    section: { backgroundColor: '#FFF', marginTop: 20, marginHorizontal: 20, borderRadius: 25, padding: 20 },
    sectionTitle: { fontSize: 12, fontWeight: '800', color: COLORS.textSecondary, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1.2 },
    actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F8F9FE' },
    actionLeft: { flexDirection: 'row', alignItems: 'center' },
    actionIcon: { marginRight: 15 },
    actionText: { fontSize: 15, fontWeight: '600' },
    versionText: { textAlign: 'center', color: '#CBD5E1', fontSize: 11, marginVertical: 30 },
    iconBtn: { padding: 5 },
    badge: {
      backgroundColor: '#FF3B30', // Harmonisation avec le rouge des messages
      borderRadius: 10,
      minWidth: 20,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 8,
      paddingHorizontal: 6
    },
    badgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' }
});