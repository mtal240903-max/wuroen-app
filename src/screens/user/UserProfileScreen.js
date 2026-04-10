import React, { useState, useEffect, useContext, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert, 
  ScrollView, 
  RefreshControl, 
  Platform 
} from 'react-native';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { COLORS, SPACING } from '../../theme/theme';
import { 
  UserPlus, 
  UserCheck, 
  MessageCircle, 
  Building2, 
  MapPin, 
  Award, 
  Info,
  ChevronRight,
  FileText,
  Clock
} from 'lucide-react-native';

export default function UserProfileScreen({ route, navigation }) {
  const { userId } = route.params || {}; 
  const { userToken } = useContext(AuthContext); 
  
  const [profile, setProfile] = useState(null);
  const [collabStatus, setCollabStatus] = useState('none'); // 'none', 'pending', 'accepted'
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [requestPending, setRequestPending] = useState(false);

  // Charger les données initiales
  const loadData = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      await Promise.all([fetchProfile(), checkCollabStatus()]);
    } catch (err) {
      console.error("Erreur chargement profil:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const fetchProfile = async () => {
    const res = await axios.get(`http://192.168.115.239:5000/api/users/${userId}`);
    if (res.data) setProfile(res.data);
  };

  const checkCollabStatus = async () => {
    const res = await axios.get(`http://192.168.115.239:5000/api/collaborations/status/${userId}`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    setCollabStatus(res.data.status);
  };

  // Gestion du bouton principal (Demander / Annuler / Rompre)
  const handleCollabAction = async () => {
    if (!userToken) {
      Alert.alert("Connexion", "Veuillez vous connecter pour collaborer.");
      return;
    }

    try {
      setRequestPending(true);

      if (collabStatus === 'none') {
        // ENVOYER UNE DEMANDE
        await axios.post(
          `http://192.168.115.239:5000/api/collaborations/request`, 
          { receiverId: userId },
          { headers: { Authorization: `Bearer ${userToken}` } }
        );
        setCollabStatus('pending');
        Alert.alert("Succès", "Demande de collaboration envoyée.");
      } 
      else {
        // RUPTURE OU ANNULATION
        Alert.alert(
          "Gérer la collaboration",
          collabStatus === 'accepted' 
            ? "Voulez-vous mettre fin à cette collaboration scientifique ?" 
            : "Voulez-vous annuler votre demande en cours ?",
          [
            { text: "Retour", style: "cancel" },
            { 
              text: "Confirmer", 
              style: "destructive", 
              onPress: async () => {
                await axios.delete(`http://192.168.115.239:5000/api/collaborations/terminate/${userId}`, {
                  headers: { Authorization: `Bearer ${userToken}` }
                });
                setCollabStatus('none');
              }
            }
          ]
        );
      }
    } catch (err) {
      Alert.alert("Erreur", "Le serveur n'a pas pu traiter la demande.");
    } finally {
      setRequestPending(false);
    }
  };

  const getInitiale = () => profile?.name ? profile.name.charAt(0).toUpperCase() : "?";

  if (loading) return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={() => { setRefreshing(true); loadData(); }} 
            tintColor={COLORS.primary}
          />
        }
      >
        
        {/* --- HEADER --- */}
        <View style={styles.header}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarText}>{getInitiale()}</Text>
          </View>

          <Text style={styles.name}>{profile?.name || "Chercheur"}</Text>
          <Text style={styles.specialty}>{profile?.specialty || "Scientifique"}</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{profile?.articlesCount || 0}</Text>
              <Text style={styles.statLabel}>Articles</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{profile?.totalLikes || 0}</Text>
              <Text style={styles.statLabel}>Likes</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{profile?.followers?.length || 0}</Text>
              <Text style={styles.statLabel}>Collabs</Text>
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity 
              style={[
                styles.btn, 
                collabStatus === 'accepted' ? styles.btnAccepted : 
                collabStatus === 'pending' ? styles.btnPending : styles.btnPrimary
              ]} 
              onPress={handleCollabAction}
              disabled={requestPending}
            >
              {requestPending ? (
                <ActivityIndicator size="small" color={collabStatus === 'accepted' ? COLORS.primary : "#FFF"} />
              ) : (
                <>
                  {collabStatus === 'accepted' ? <UserCheck color={COLORS.primary} size={20} /> : 
                   collabStatus === 'pending' ? <Clock color="#64748B" size={20} /> : 
                   <UserPlus color="#FFF" size={20} />}
                  
                  <Text style={[
                    styles.btnText, 
                    collabStatus === 'accepted' && { color: COLORS.primary },
                    collabStatus === 'pending' && { color: '#64748B' }
                  ]}>
                    {collabStatus === 'none' && "Collaborer"}
                    {collabStatus === 'pending' && "En attente"}
                    {collabStatus === 'accepted' && "Collaborateur"}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {collabStatus === 'accepted' && (
              <TouchableOpacity 
                style={styles.btnChat}
                onPress={() => navigation.navigate('ChatDetail', { 
                  chatId: profile._id, 
                  userName: profile.name 
                })}
              >
                <MessageCircle color={COLORS.primary} size={24} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* --- DETAILS --- */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Parcours Professionnel</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Building2 color={COLORS.primary} size={20} />
              <Text style={styles.infoText}>{profile?.institution || "Institution non renseignée"}</Text>
            </View>
            <View style={styles.infoRow}>
              <Award color={COLORS.primary} size={20} />
              <Text style={styles.infoText}>{profile?.grade || "Grade non défini"}</Text>
            </View>
            <View style={styles.infoRow}>
              <MapPin color={COLORS.primary} size={20} />
              <Text style={styles.infoText}>{profile?.location || "Bénin"}</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Résumé de recherche</Text>
          <View style={styles.bioCard}>
            <Info color={COLORS.primary} size={18} style={{ marginBottom: 8 }} />
            <Text style={styles.bioText}>
              {profile?.bio || "Pas de biographie scientifique disponible."}
            </Text>
          </View>

          <View style={styles.articlesHeader}>
              <Text style={styles.sectionTitle}>Publications</Text>
              <TouchableOpacity>
                <Text style={styles.seeAll}>Tout voir</Text>
              </TouchableOpacity>
          </View>

          {profile?.articlesCount > 0 ? (
            <TouchableOpacity style={styles.articleMiniCard}>
                <View style={styles.articleIcon}>
                   <FileText color={COLORS.primary} size={20} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                   <Text style={styles.articleTitle} numberOfLines={1}>Dernière publication</Text>
                   <Text style={styles.articleDate}>Disponible sur Wuro’en</Text>
                </View>
                <ChevronRight color="#CBD5E1" size={20} />
            </TouchableOpacity>
          ) : (
            <Text style={styles.noArticles}>Aucune publication enregistrée.</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FE' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { 
    alignItems: 'center', 
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 25,
    paddingHorizontal: 20, 
    backgroundColor: '#FFF', 
    borderBottomLeftRadius: 35, 
    borderBottomRightRadius: 35,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  avatarLarge: { 
    width: 100, height: 100, borderRadius: 30, 
    backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center',
    borderWidth: 4, borderColor: '#EEF2FF'
  },
  avatarText: { color: '#FFF', fontSize: 40, fontWeight: 'bold' },
  name: { fontSize: 22, fontWeight: 'bold', marginTop: 15, color: '#1A1C1E' },
  specialty: { color: '#64748B', marginBottom: 20, fontSize: 14, fontWeight: '500' },
  statsRow: { 
    flexDirection: 'row', 
    backgroundColor: '#F8FAFC', 
    borderRadius: 20, 
    paddingVertical: 15, 
    width: '100%', 
    marginBottom: 25,
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: '#F1F5F9'
  },
  statItem: { alignItems: 'center', flex: 1 },
  statNumber: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary },
  statLabel: { fontSize: 12, color: '#64748B', marginTop: 2 },
  statDivider: { width: 1, height: '50%', backgroundColor: '#E2E8F0', alignSelf: 'center' },

  actions: { flexDirection: 'row', gap: 12 },
  btn: { flexDirection: 'row', paddingHorizontal: 25, paddingVertical: 14, borderRadius: 18, alignItems: 'center', gap: 10, elevation: 3 },
  btnPrimary: { backgroundColor: COLORS.primary },
  btnAccepted: { backgroundColor: '#FFF', borderWidth: 2, borderColor: COLORS.primary, elevation: 0 },
  btnPending: { backgroundColor: '#F1F5F9', elevation: 0 },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  btnChat: { 
    width: 52, height: 52, borderRadius: 16, borderWidth: 2, 
    borderColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0F7FF' 
  },

  detailsSection: { padding: 25 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B', marginBottom: 15 },
  infoCard: { backgroundColor: '#FFF', padding: 20, borderRadius: 20, elevation: 2, marginBottom: 25 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, gap: 15 },
  infoText: { fontSize: 15, color: '#475569', fontWeight: '500' },
  
  bioCard: { 
    backgroundColor: '#FFF', 
    padding: 20, 
    borderRadius: 20, 
    borderLeftWidth: 5, 
    borderLeftColor: COLORS.primary, 
    elevation: 2, 
    marginBottom: 25 
  },
  bioText: { fontSize: 14, color: '#475569', lineHeight: 24 },

  articlesHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  seeAll: { color: COLORS.primary, fontWeight: 'bold', fontSize: 13 },
  articleMiniCard: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', 
    padding: 15, borderRadius: 18, elevation: 2, marginTop: 5 
  },
  articleIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F0F7FF', justifyContent: 'center', alignItems: 'center' },
  articleTitle: { fontSize: 15, fontWeight: '600', color: '#1E293B' },
  articleDate: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  noArticles: { textAlign: 'center', color: '#94A3B8', fontStyle: 'italic', marginTop: 10 }
});