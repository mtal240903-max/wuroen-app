import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { Shield, ShieldAlert, UserMinus, Award, Calendar } from 'lucide-react-native';
import api from '../../../../services/api'; // Ton instance Axios sécurisée

export default function CompanyStaffScreen({ route, navigation }) {
  const { companyId } = route.params;
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState('member');

  // 1. Récupérer le personnel depuis le contrôleur getCompanyById
  const fetchStaffData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/workspace/companies/${companyId}`);
      setStaff(response.data.staff || []);
      
      // Optionnel : Trouver le rôle de l'utilisateur connecté dans la liste pour adapter l'affichage
      const me = response.data.staff.find(member => member.userId?._id === api.defaults.headers.common['UserId']); 
      if (me) setCurrentUserRole(me.level);
    } catch (error) {
      console.error("Erreur staff:", error);
      Alert.alert("Erreur", "Impossible de charger le personnel de l'entreprise.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffData();
  }, []);

  // 2. Action de révocation (Liaison avec removeCompanyStaff.js)
  const handleRemoveStaff = (staffMember) => {
    Alert.alert(
      "Révoquer le collaborateur",
      `Êtes-vous sûr de vouloir retirer ${staffMember.userId?.name} de ses fonctions actives ?`,
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Confirmer la révocation", 
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/workspace/companies/${companyId}/staff/${staffMember.userId?._id}`);
              Alert.alert("Succès", "Le collaborateur a été retiré avec succès.");
              fetchStaffData(); // Recharger la liste mise à jour
            } catch (error) {
              const errorMsg = error.response?.data?.message || "Impossible de révoquer ce membre.";
              Alert.alert("Action Refusée", errorMsg);
            }
          }
        }
      ]
    );
  };

  // Gestion visuelle des badges de niveau hiérarchique
  const getLevelBadge = (level) => {
    switch (level) {
      case 'founder': return { label: 'Direction', color: '#EF4444', icon: <Award size={12} color="#EF4444" /> };
      case 'administrator': return { label: 'Admin', color: '#F59E0B', icon: <ShieldAlert size={12} color="#F59E0B" /> };
      case 'manager': return { label: 'Manager', color: '#10B981', icon: <Shield size={12} color="#10B981" /> };
      default: return { label: 'Employé', color: '#3B82F6', icon: null };
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Personnel Actif ({staff.length})</Text>

      <FlatList
        data={staff}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => {
          const badge = getLevelBadge(item.level);
          return (
            <View style={styles.staffCard}>
              {/* Avatar & Infos Utilisateur */}
              <Image 
                source={{ uri: item.userId?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80' }} 
                style={styles.avatar} 
              />
              
              <View style={styles.infoContainer}>
                <Text style={styles.userName}>{item.userId?.name || 'Collaborateur'}</Text>
                <Text style={styles.positionText}>{item.position}</Text>
                
                {/* Niveau / Rôle Badge */}
                <View style={styles.badgeRow}>
                  <View style={[styles.badge, { borderColor: badge.color }]}>
                    {badge.icon}
                    <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
                  </View>
                </View>
              </View>

              {/* Actions : Bouton de révocation visible pour la direction */}
              {currentUserRole === 'founder' && item.level !== 'founder' && (
                <TouchableOpacity style={styles.removeBtn} onPress={() => handleRemoveStaff(item)}>
                  <UserMinus color="#EF4444" size={18} />
                </TouchableOpacity>
              )}
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090D1A', padding: 16 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#090D1A' },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#FFF', marginBottom: 16, letterSpacing: 0.5 },
  staffCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111726', padding: 12, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#1E293B' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1E293B' },
  infoContainer: { flex: 1, marginLeft: 12 },
  userName: { fontSize: 14, fontWeight: '700', color: '#FFF' },
  positionText: { fontSize: 12, color: '#64748B', marginTop: 2 },
  badgeRow: { flexDirection: 'row', marginTop: 6 },
  badge: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  badgeText: { fontSize: 9, fontWeight: '700', marginLeft: 4 },
  removeBtn: { width: 36, height: 36, backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
});