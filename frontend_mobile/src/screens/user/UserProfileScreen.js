import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, 
  Alert, ScrollView, RefreshControl, Platform, Dimensions, Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';

// Import de l'instance API centralisée et du contexte
import api from '../../services/api'; 
import { AuthContext } from '../../context/AuthContext';
import { COLORS } from '../../theme/theme';
import {
  UserPlus, UserMinus, MessageCircle, Settings, Building2, MapPin, 
  Award, ChevronRight, FileText, Clock, ShieldCheck, Lock, Camera
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

// Composant réutilisable pour les lignes d'informations holographiques
const CyberInfoRow = ({ Icon, title, text }) => (
  <View style={styles.cyberInfoRow}>
    <View style={styles.cyberIconBg}>
      <Icon size={16} color={COLORS.primary || '#00AEEF'} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.cyberInfoTitle}>{title}</Text>
      <Text style={styles.cyberInfoText}>{text}</Text>
    </View>
  </View>
);

export default function UserProfileScreen({ route, navigation }) {
  const params = route?.params || {};
  const userId = params.userId || params.id; 

  const { userToken, user, updateUserProfileLocal } = useContext(AuthContext);

  const [profile, setProfile] = useState(null);
  const [collabStatus, setCollabStatus] = useState('none');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [requestPending, setRequestPending] = useState(false);
  const [uploading, setUploading] = useState(false);

  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const isOwnProfile = userId === user?.id || userId === user?._id;

  // 📥 Chargement des données depuis l'API
  const loadData = useCallback(async (isRefresh = false) => {
    if (!userId) {
      console.warn("⚠️ [UserProfileScreen] userId absent des paramètres de navigation.");
      setLoading(false);
      return;
    }

    if (!isRefresh) setLoading(true);

    try {
      const [profileRes, collabRes] = await Promise.all([
        api.get(`/users/${userId}`),
        userToken && !isOwnProfile
          ? api.get(`/collaborations/status/${userId}`).catch(() => ({ data: { status: 'none' } }))
          : Promise.resolve({ data: { status: 'none' } })
      ]);

      if (!isMounted.current) return;
      
      const profileData = profileRes.data?.user || profileRes.data;
      
      if (!profileData) {
        throw new Error("Données renvoyées par le serveur invalides.");
      }

      setProfile({
        ...profileData,
        isAccessible: profileRes.data.isAccessible !== false,
        articlesCount: profileRes.data.articlesCount || profileData.articlesCount || 0,
        totalViews: profileRes.data.totalViews || 0,
        totalLikes: profileRes.data.totalLikes || 0
      });
      
      if (!isOwnProfile) {
        // ✅ getStatus retourne { status, collabId, isSender }
        const rawStatus = collabRes.data?.status || 'none';
        setCollabStatus(rawStatus.trim().toLowerCase());
      }

    } catch (err) {
      if (!isMounted.current) return;
      console.error("🔥 [UserProfileScreen] Exception :", err.message);
      Alert.alert("Erreur Terminal", "Échec de synchronisation avec le profil cible.");
    } finally {
      if (!isMounted.current) return;
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId, userToken, isOwnProfile]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 📸 Sélectionner et uploader l'image de profil
  const handlePickAvatar = async () => {
    if (!isOwnProfile) return;

    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission requise", "L'accès aux documents est requis pour modifier l'avatar.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) return;

    const selectedImage = result.assets[0];
    
    setUploading(true);
    const formData = new FormData();
    
    formData.append('avatar', {
      uri: Platform.OS === 'ios' ? selectedImage.uri.replace('file://', '') : selectedImage.uri,
      type: 'image/jpeg',
      name: `avatar-${userId || 'profile'}.jpg`,
    });

    try {
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      const res = await api.post('/users/upload-avatar', formData, config);
      
      const updatedAvatarUrl = res.data?.avatar || res.data?.user?.avatar;
      
      if (updatedAvatarUrl) {
        setProfile(prev => ({ ...prev, avatar: updatedAvatarUrl }));
        if (updateUserProfileLocal) {
          updateUserProfileLocal({ avatar: updatedAvatarUrl });
        }
        Alert.alert("Succès", "Mise à jour du canal d'image validée.");
      } else {
        loadData(true);
      }
    } catch (uploadErr) {
      console.error("Erreur d'upload avatar:", uploadErr);
      Alert.alert("Échec de transmission", "Impossible de synchroniser l'image avec le serveur.");
    } finally {
      setUploading(false);
    }
  };

  // ⚔️ Actions réseau (Demande / Rupture)
  const handleCollabAction = async () => {
    if (!userToken) {
      Alert.alert("Identification Requise", "Activez votre clé d'authentification pour interagir.");
      return;
    }
    if (collabStatus === 'pending') return;

    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    if (collabStatus === 'accepted') {
      Alert.alert(
        "Rompre la collaboration", 
        "Voulez-vous révoquer les accès et dissocier ce terminal de vos partenaires ?", 
        [
          { text: "Annuler", style: "cancel" },
          { 
            text: "Désactiver le flux", 
            style: "destructive", 
            onPress: async () => {
              setRequestPending(true);
              try {
                await api.delete(`/collaborations/terminate/${userId}`);
                setCollabStatus('none');
                loadData(true);
              } catch (err) { 
                console.error("Erreur d'annulation collab:", err);
                setCollabStatus('none'); 
                Alert.alert("Erreur", "Action réseau refusée par le serveur.");
              } finally { 
                setRequestPending(false); 
              }
            }
          }
        ]
      );
      return;
    }

    setRequestPending(true);
    try {
      await api.post('/collaborations/request', { receiverId: userId });
      setCollabStatus('pending');
      Alert.alert("Signal Envoyé", "Demande de connexion mise en attente d'approbation.");
    } catch (err) {
      console.error("Erreur demande collab:", err);
      Alert.alert("Erreur", "Le protocole de demande de collaboration a échoué.");
    } finally {
      setRequestPending(false);
    }
  };

  const getInitial = () => profile?.name ? profile.name.charAt(0).toUpperCase() : "?";

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary || '#00AEEF'} />
        <Text style={styles.cyberLoadingText}>INITIALISATION DU TERMINAL SCIENTIFIQUE...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={() => { setRefreshing(true); loadData(true); }} 
            tintColor={COLORS.primary || '#00AEEF'} 
          />
        }
      >
        {/* ─── EN-TÊTE FUTURISTE ─── */}
        <View style={styles.cyberHeader}>
          <TouchableOpacity 
            style={styles.avatarZone} 
            onPress={handlePickAvatar} 
            disabled={!isOwnProfile || uploading}
            activeOpacity={0.8}
          >
            <View style={[styles.neonRing, isOwnProfile && styles.neonRingEditable]}>
              <View style={styles.avatarCore}>
                {uploading ? (
                  <ActivityIndicator size="small" color={COLORS.primary || '#00AEEF'} />
                ) : profile?.avatar || profile?.profilePicture ? (
                  <Image 
                    source={{ uri: profile.avatar || profile.profilePicture }} 
                    style={styles.avatarImage} 
                  />
                ) : (
                  <Text style={styles.avatarLetter}>{getInitial()}</Text>
                )}
              </View>
            </View>
            
            {isOwnProfile ? (
              <View style={styles.cameraBadge}>
                <Camera size={12} color="#020617" />
              </View>
            ) : (
              <View style={styles.cyberBadge}>
                <ShieldCheck size={14} color="#020617" />
              </View>
            )}
          </TouchableOpacity>

          <Text style={styles.cyberName}>{profile?.name}</Text>
          <View style={styles.tagHologram}>
            <Text style={styles.tagText}>{profile?.specialty || "EXPERT SCIENTIFIQUE"}</Text>
          </View>

          {/* ─── ZONE D'ACTIONS RÉAJUSTÉE ─── */}
          <View style={styles.cyberActionsContainer}>
            
            {!isOwnProfile && (
              <TouchableOpacity 
                style={[
                  styles.actionMainBtn, 
                  collabStatus === 'pending' && styles.actionPendingBtn,
                  collabStatus === 'accepted' && styles.actionTerminateBtn
                ]} 
                onPress={handleCollabAction}
                disabled={requestPending}
              >
                {requestPending ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <>
                    {collabStatus === 'none' && <UserPlus size={18} color="#020617" />}
                    {collabStatus === 'pending' && <Clock size={18} color="#64748B" />}
                    {collabStatus === 'accepted' && <UserMinus size={18} color="#EF4444" />}
                    <Text style={[
                      styles.actionBtnText, 
                      collabStatus === 'pending' && { color: '#64748B' }, 
                      collabStatus === 'accepted' && { color: '#EF4444' }
                    ]}>
                      {collabStatus === 'none' && "COLLABORATION"}
                      {collabStatus === 'pending' && "SIGNAL EN ATTENTE"}
                      {collabStatus === 'accepted' && "ÉTEINDRE COLLABORATEUR"}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}

            {collabStatus === 'accepted' && !isOwnProfile && (
              <TouchableOpacity 
                style={styles.actionIconBtnInbox}
                onPress={() => navigation.navigate('ChatDetail', { 
                  recipientId: userId, 
                  userName: profile?.name 
                })}
              >
                <MessageCircle size={22} color="#020617" />
              </TouchableOpacity>
            )}

            <TouchableOpacity 
              style={[styles.actionIconBtn, isOwnProfile && { flex: 1, height: 50, flexDirection: 'row', gap: 8 }]}
              onPress={() => navigation.navigate(isOwnProfile ? 'EditProfile' : 'PartnerSettings', { userId, profile })}
            >
              <Settings size={20} color="#94A3B8" />
              {isOwnProfile && <Text style={{ color: '#94A3B8', fontWeight: '800', fontSize: 12, letterSpacing: 0.5 }}>MODIFIER LE PROFIL</Text>}
            </TouchableOpacity>

          </View>
        </View>

        {/* ─── PANNEAU DE SÉCURITÉ CONTEXTUEL ─── */}
        {profile?.isPrivate && !profile?.isAccessible && !isOwnProfile ? (
          <View style={styles.privateLockPanel}>
            <View style={styles.lockHexagon}>
              <Lock size={32} color="#EF4444" />
            </View>
            <Text style={styles.lockTitle}>PROTÉGÉ PAR PROTOCOLE PRIVÉ</Text>
            <Text style={styles.lockDesc}>
              Ce chercheur a activé le chiffrement de son profil. Vous devez faire partie de ses partenaires approuvés pour accéder à sa base de données.
            </Text>
          </View>
        ) : (
          /* ─── BLOC DE CONTENU GÉNÉRAL ─── */
          <View style={styles.cyberContent}>
            <Text style={styles.cyberSectionHeader}>// RÉSUMÉ DES RECHERCHES</Text>
            <View style={styles.cyberCard}>
              <Text style={styles.cyberBioText}>
                {profile?.bio || "Aucune transmission de données biographiques enregistrée."}
              </Text>
            </View>

            <Text style={styles.cyberSectionHeader}>// STRUCTURE & IDENTIFIANT GÉOGRAPHIQUE</Text>
            <View style={styles.cyberCard}>
              <CyberInfoRow Icon={Building2} title="INSTITUTION COMPOSITE" text={profile?.institution || "Chercheur Indépendant"} />
              <CyberInfoRow Icon={Award} title="GRADE DE RECHERCHE" text={profile?.grade || "Non répertorié"} />
              <CyberInfoRow Icon={MapPin} title="SECTEUR OPÉRATIONNEL" text={profile?.location || "Bénin (Afrique de l'Ouest)"} />
            </View>

            <View style={styles.publicationsHeaderRow}>
              <Text style={styles.cyberSectionHeader}>// BASE DOCUMENTAIRE ({profile?.articlesCount || 0})</Text>
              {profile?.articlesCount > 0 && (
                <TouchableOpacity onPress={() => navigation.navigate('UserArticles', { userId })}>
                  <Text style={styles.cyberLinkText}>ACCÉDER AUX FLUX</Text>
                </TouchableOpacity>
              )}
            </View>

            {profile?.articlesCount > 0 ? (
              <TouchableOpacity 
                style={styles.cyberArticleCard} 
                activeOpacity={0.8}
                onPress={() => navigation.navigate('UserArticles', { userId })}
              >
                <View style={styles.cyberArticleIconContainer}>
                  <FileText size={20} color={COLORS.primary || '#00AEEF'} />
                </View>
                <View style={{ flex: 1, marginLeft: 16 }}>
                  <Text style={styles.cyberArticleTitle}>EXPLORER LE FLUX DE PRODUCTION</Text>
                  <Text style={styles.cyberArticleSubTitle}>Analyse et téléchargement de ses {profile.articlesCount} articles</Text>
                </View>
                <ChevronRight size={18} color={COLORS.primary || '#00AEEF'} />
              </TouchableOpacity>
            ) : (
              <View style={styles.cyberEmptyCard}>
                <Text style={styles.cyberEmptyText}>Aucun flux d'article détecté sur ce terminal.</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#020617' },
  cyberLoadingText: { color: '#64748B', marginTop: 16, fontSize: 11, fontWeight: '800', letterSpacing: 2 },
  
  cyberHeader: { alignItems: 'center', paddingHorizontal: 20, paddingTop: 15, paddingBottom: 15 },
  avatarZone: { position: 'relative', marginBottom: 16 },
  neonRing: { padding: 4, borderRadius: 36, borderWidth: 2, borderColor: 'rgba(0, 174, 239, 0.4)', backgroundColor: '#020617' },
  neonRingEditable: { borderColor: COLORS.primary || '#00AEEF' },
  avatarCore: { width: 90, height: 90, borderRadius: 32, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#1E293B', overflow: 'hidden' },
  avatarImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  avatarLetter: { color: '#FFF', fontSize: 36, fontWeight: '900' },
  cyberBadge: { position: 'absolute', bottom: -2, right: -2, backgroundColor: COLORS.primary || '#00AEEF', borderRadius: 12, padding: 5, borderWidth: 2, borderColor: '#020617' },
  cameraBadge: { position: 'absolute', bottom: -2, right: -2, backgroundColor: '#FFF', borderRadius: 12, padding: 6, borderWidth: 2, borderColor: '#020617', alignItems: 'center', justifyContent: 'center' },
  cyberName: { fontSize: 24, fontWeight: '900', color: '#FFF', letterSpacing: -0.5 },
  tagHologram: { backgroundColor: 'rgba(0, 174, 239, 0.06)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8, marginTop: 8, borderWidth: 1, borderColor: 'rgba(0, 174, 239, 0.2)' },
  tagText: { fontSize: 10, color: COLORS.primary || '#00AEEF', fontWeight: '800', letterSpacing: 1.5 },

  cyberActionsContainer: { flexDirection: 'row', marginTop: 24, gap: 12, width: '100%', paddingHorizontal: 5 },
  actionMainBtn: { flex: 1, height: 52, backgroundColor: COLORS.primary || '#00AEEF', borderRadius: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
  actionPendingBtn: { backgroundColor: '#0F172A', borderWidth: 1, borderColor: '#1E293B' },
  actionTerminateBtn: { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderWidth: 1, borderColor: '#EF4444' },
  actionBtnText: { fontSize: 11, fontWeight: '800', color: '#020617', letterSpacing: 0.3 },
  actionIconBtn: { width: 52, height: 52, borderRadius: 14, backgroundColor: '#0F172A', borderWidth: 1, borderColor: '#1E293B', justifyContent: 'center', alignItems: 'center' },
  actionIconBtnInbox: { width: 52, height: 52, borderRadius: 14, backgroundColor: COLORS.primary || '#00AEEF', justifyContent: 'center', alignItems: 'center' },

  privateLockPanel: { padding: 30, alignItems: 'center', marginTop: 10 },
  lockHexagon: { width: 70, height: 70, backgroundColor: 'rgba(239, 68, 68, 0.06)', borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.2)' },
  lockTitle: { color: '#EF4444', fontSize: 14, fontWeight: '900', letterSpacing: 1 },
  lockDesc: { color: '#64748B', fontSize: 13, textAlign: 'center', marginTop: 10, lineHeight: 20 },

  cyberContent: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 40 },
  cyberSectionHeader: { color: '#475569', fontSize: 11, fontWeight: '800', letterSpacing: 1.5, marginTop: 24, marginBottom: 12 },
  cyberCard: { backgroundColor: '#0F172A', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#1E293B' },
  cyberBioText: { color: '#94A3B8', fontSize: 14, lineHeight: 22 },
  
  cyberInfoRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 10 },
  cyberIconBg: { width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(0, 174, 239, 0.05)', justifyContent: 'center', alignItems: 'center', marginRight: 16, borderWidth: 1, borderColor: 'rgba(0, 174, 239, 0.1)' },
  cyberInfoTitle: { color: '#475569', fontSize: 9, fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase' },
  cyberInfoText: { color: '#E2E8F0', fontSize: 14, fontWeight: '600', marginTop: 2 },

  publicationsHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  cyberLinkText: { color: COLORS.primary || '#00AEEF', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  cyberArticleCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F172A', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#1E293B' },
  cyberArticleIconContainer: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(0, 174, 239, 0.05)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0, 174, 239, 0.1)' },
  cyberArticleTitle: { color: '#FFF', fontSize: 13, fontWeight: '800', letterSpacing: 0.5 },
  cyberArticleSubTitle: { color: '#64748B', fontSize: 11, marginTop: 4, fontWeight: '500' },
  cyberEmptyCard: { backgroundColor: '#0F172A', borderRadius: 16, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: '#1E293B', borderStyle: 'dashed' },
  cyberEmptyText: { color: '#475569', fontSize: 13, fontWeight: '600' }
});