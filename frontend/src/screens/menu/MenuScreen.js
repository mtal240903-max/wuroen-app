import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, FlatList, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../../context/AuthContext';
import { COLORS } from '../../theme/theme';
import { BASE_URL } from '../../api/apiConfig';
import { User, Users, BookOpen, Settings, LogOut, X, ShieldAlert } from 'lucide-react-native';

const SERVER_BASE = BASE_URL.replace('/api', '');

export default function MenuScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);

  const avatarUri = user?.avatar 
    ? `${user.avatar.startsWith('http') ? user.avatar : `${SERVER_BASE}/${user.avatar.replace(/^\//, '')}`}?t=${Date.now()}`
    : null;

  const handleLogout = () => {
    Alert.alert("Déconnexion", "Êtes-vous sûr de vouloir vous déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      { text: "Se déconnecter", style: "destructive", onPress: () => logout() }
    ]);
  };

  const navigateTo = (screenName) => {
    // 1. Fermer le menu
    navigation.goBack();

    // 2. Tenter la navigation
    try {
      // Si l'écran est un onglet, on utilise la syntaxe imbriquée
      const isTab = ['Profil', 'Biblio'].includes(screenName);
      
      if (isTab) {
        navigation.navigate('Main', { screen: screenName });
      } else {
        navigation.navigate(screenName);
      }
    } catch (error) {
      console.error("Navigation échouée pour:", screenName, error);
      Alert.alert("Erreur", "Impossible d'accéder à cette section.");
    }
  };

  const menuItems = [
    { title: "Profil", icon: <User color={COLORS.primary} size={24} />, screen: 'Profil' },
    { title: "Collaborations", icon: <Users color="#22C55E" size={24} />, screen: 'CollaborationRequests' },
    { title: "Bibliothèque", icon: <BookOpen color="#E2E8F0" size={24} />, screen: 'Biblio' },
    { title: "Réglages", icon: <Settings color="#64748B" size={24} />, screen: 'Settings' }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Menu Général</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <X color="#FFF" size={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase() || 'U'}</Text>
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>{user?.name || 'Chercheur Wuro’en'}</Text>
            <View style={styles.roleBadge}>
              <ShieldAlert color={COLORS.primary} size={12} />
              <Text style={styles.roleText}>{user?.role || 'Membre'}</Text>
            </View>
          </View>
        </View>

        <FlatList
          data={menuItems}
          numColumns={2}
          keyExtractor={(item) => item.screen}
          columnWrapperStyle={styles.row}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.gridItem} onPress={() => navigateTo(item.screen)}>
              <View style={styles.iconBox}>{item.icon}</View>
              <Text style={styles.gridTitle}>{item.title}</Text>
            </TouchableOpacity>
          )}
        />

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut color="#EF4444" size={20} />
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  // ... garde tes styles actuels, ils sont parfaits
  container: { flex: 1, backgroundColor: '#020617' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center' },
  headerTitle: { color: '#FFF', fontSize: 20, fontWeight: '800' },
  content: { padding: 20, flex: 1 },
  profileCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F172A', padding: 20, borderRadius: 20, marginBottom: 25, borderWidth: 1, borderColor: '#1E293B' },
  avatarContainer: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#1E293B', justifyContent: 'center', alignItems: 'center', marginRight: 15, overflow: 'hidden' },
  avatarImage: { width: 60, height: 60 },
  avatarText: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
  userName: { color: '#F8FAFC', fontSize: 18, fontWeight: '700' },
  roleBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  roleText: { color: '#94A3B8', fontSize: 12, marginLeft: 5, textTransform: 'uppercase' },
  row: { justifyContent: 'space-between', marginBottom: 15 },
  gridItem: { backgroundColor: '#0F172A', width: '47%', aspectRatio: 1, borderRadius: 20, padding: 15, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#1E293B' },
  iconBox: { backgroundColor: '#1E293B', padding: 15, borderRadius: 15, marginBottom: 10 },
  gridTitle: { color: '#F8FAFC', fontSize: 14, fontWeight: '600', textAlign: 'center' },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 15, backgroundColor: 'rgba(239, 68, 68, 0.05)', borderRadius: 15, marginTop: 20 },
  logoutText: { color: '#EF4444', fontWeight: '700', marginLeft: 10 }
});