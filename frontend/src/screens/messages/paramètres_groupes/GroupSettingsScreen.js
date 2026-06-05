import api from '../../../services/api';
import React, { useState, useContext, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  Alert, Platform, ActivityIndicator 
} from 'react-native';
import { 
  ChevronLeft, Phone, Video, UserPlus, Bell, BellOff,
  Settings, Users, Palette, ShieldAlert, LogOut, FileText 
} from 'lucide-react-native';
import { COLORS } from '../../../theme/theme';
import { AuthContext } from '../../../context/AuthContext';

export default function GroupSettingsScreen({ route, navigation }) {
  const { groupId, userName } = route.params || { groupId: '123', userName: 'Groupe' };
  const { user } = useContext(AuthContext);
  
  const [isMuted, setIsMuted] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const socket = global.socket;

  // --- Fonctions d'Action sécurisées ---

  const handleCall = (isVideo) => {
    // SÉCURITÉ : Utilisation du chaînage optionnel et valeur par défaut
    const callerName = user?.name || "Utilisateur"; 
    
    const roomId = `group_${groupId}`;
    socket?.emit('emit_call', { 
      roomId, 
      isVideo, 
      targetId: groupId, 
      callerName, 
      isGroup: true 
    });
    navigation.navigate('CallScreen', { roomId, isVideo, chatId: groupId, userName });
  };

  const toggleMute = async () => {
    try {
      const newState = !isMuted;
      await api.patch(`/groups/${groupId}/mute`, { muted: newState });
      setIsMuted(newState);
    } catch (err) {
      Alert.alert("Erreur", "Impossible de modifier les notifications.");
    }
  };

  const handleLeaveGroup = () => {
    Alert.alert(
      "Quitter le groupe",
      "Êtes-vous sûr de vouloir quitter ce groupe ? Cette action est irréversible.",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Quitter", 
          style: "destructive",
          onPress: async () => {
            setLeaving(true);
            try {
              await api.delete(`/groups/${groupId}/leave`);
              navigation.navigate('Inbox');
            } catch (err) {
              setLeaving(false);
              Alert.alert("Erreur", "Impossible de quitter le groupe.");
            }
          }
        }
      ]
    );
  };

  // --- Composants ---

  const ActionButton = ({ icon: Icon, label, onPress, active = false }) => (
    <TouchableOpacity style={styles.actionBtn} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.iconCircle, active && { backgroundColor: COLORS.primary + '30' }]}>
        <Icon color={active ? COLORS.primary : "#FFF"} size={22} />
      </View>
      <Text style={[styles.actionText, active && { color: COLORS.primary, fontWeight: '700' }]}>{label}</Text>
    </TouchableOpacity>
  );

  const MenuOption = ({ icon: Icon, label, color = "#FFF", subLabel, onPress }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.6}>
      <View style={[styles.menuIconBox, { backgroundColor: color + '15' }]}>
        <Icon color={color} size={20} />
      </View>
      <View style={styles.menuTexts}>
        <Text style={[styles.menuLabel, { color }]}>{label}</Text>
        {subLabel && <Text style={styles.subLabel}>{subLabel}</Text>}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color="#FFF" size={28} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileArea}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarLarge}>
              {/* SÉCURITÉ : Accès sécurisé à la première lettre */}
              <Text style={styles.avatarText}>{userName?.charAt(0)?.toUpperCase() || 'G'}</Text>
            </View>
            <TouchableOpacity style={styles.editBadge} onPress={() => Alert.alert("Info", "Personnalisation à venir")}>
              <Palette size={14} color="#FFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.nameText}>{userName || "Groupe"}</Text>
          <Text style={styles.statusText}>Discussion de groupe</Text>
        </View>

        <View style={styles.actionsBar}>
          <ActionButton icon={Phone} label="Audio" onPress={() => handleCall(false)} />
          <ActionButton icon={Video} label="Vidéo" onPress={() => handleCall(true)} />
          <ActionButton icon={UserPlus} label="Ajouter" onPress={() => navigation.navigate('AddMembersScreen', { groupId })} />
          <ActionButton icon={isMuted ? BellOff : Bell} label={isMuted ? "Muté" : "Sourdine"} active={isMuted} onPress={toggleMute} />
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Paramètres du groupe</Text>
          <MenuOption icon={Users} label="Voir les membres" subLabel="Gérer les participants" onPress={() => navigation.navigate('GroupMembersScreen', { groupId })} />
          <MenuOption icon={FileText} label="Fichiers partagés" subLabel="Documents et médias" onPress={() => navigation.navigate('SharedFilesScreen', { groupId })} />
          <MenuOption icon={Settings} label="Options avancées" onPress={() => navigation.navigate('ChatAdvancedSettingsScreen', { groupId })} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Confidentialité</Text>
          <MenuOption icon={LogOut} label="Quitter le groupe" color="#EF4444" onPress={handleLeaveGroup} />
          <MenuOption icon={ShieldAlert} label="Signaler un problème" color="#F59E0B" onPress={() => Alert.alert("Signalement", "Rapport transmis.")} />
        </View>

        {leaving && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        )}
        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
  );
}

// Les styles restent inchangés
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  header: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, paddingTop: Platform.OS === 'ios' ? 50 : 20, paddingHorizontal: 15 },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 8, alignSelf: 'flex-start' },
  profileArea: { alignItems: 'center', marginTop: 80, paddingHorizontal: 20 },
  avatarContainer: { position: 'relative' },
  avatarLarge: { width: 110, height: 110, borderRadius: 55, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: '#0F172A' },
  avatarText: { fontSize: 40, fontWeight: '900', color: '#FFF' },
  editBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#334155', padding: 8, borderRadius: 20, borderWidth: 3, borderColor: '#020617' },
  nameText: { color: '#FFF', fontSize: 22, fontWeight: '800', marginTop: 15, textAlign: 'center' },
  statusText: { color: '#64748B', fontSize: 13, marginTop: 5 },
  actionsBar: { flexDirection: 'row', justifyContent: 'space-evenly', marginTop: 30, paddingHorizontal: 10 },
  actionBtn: { alignItems: 'center', width: 70 },
  iconCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#1E293B', justifyContent: 'center', alignItems: 'center' },
  actionText: { color: '#94A3B8', fontSize: 12, marginTop: 8, fontWeight: '500', textAlign: 'center' },
  divider: { height: 1, backgroundColor: '#1E293B', marginVertical: 30, marginHorizontal: 20 },
  section: { paddingHorizontal: 20, marginBottom: 25 },
  sectionTitle: { color: '#475569', fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 15 },
  menuItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  menuIconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  menuTexts: { flex: 1 },
  menuLabel: { fontSize: 16, fontWeight: '600' },
  subLabel: { color: '#475569', fontSize: 12, marginTop: 2 },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(2, 6, 23, 0.7)', justifyContent: 'center', alignItems: 'center', zIndex: 999 }
});