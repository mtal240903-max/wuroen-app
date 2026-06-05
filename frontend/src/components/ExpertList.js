import React, { useContext } from 'react';
import { ScrollView, TouchableOpacity, View, Text, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../theme/theme';
import { AuthContext } from '../context/AuthContext';

export default function ExpertList({ experts, onExpertPress }) {
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);

  if (!experts || experts.length === 0) return null;

  const handlePress = (targetUserId) => {
    const currentUserId = user?._id?.toString() || user?.id?.toString();
    if (targetUserId?.toString() === currentUserId) {
      navigation.navigate('Profil');
    } else {
      onExpertPress?.(targetUserId);
    }
  };

  const AVATAR_COLORS = ['#00AEEF', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899'];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Chercheurs & Experts 👥</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {experts.map((item, index) => {
          const displayName = item.name || item.username || 'Expert';
          const firstLetter = displayName[0]?.toUpperCase() || '?';
          const avatarColor = AVATAR_COLORS[index % AVATAR_COLORS.length];

          return (
            <TouchableOpacity
              key={item._id}
              style={styles.expertItem}
              onPress={() => handlePress(item._id)}
              activeOpacity={0.7}
            >
              {/* ✅ AFFICHAGE CONDITIONNEL : Image si disponible, sinon initiales */}
              {item.avatar ? (
                <Image source={{ uri: item.avatar }} style={styles.avatarImage} />
              ) : (
                <View style={[styles.avatarCircle, { borderColor: avatarColor }]}>
                  <Text style={[styles.avatarLetter, { color: avatarColor }]}>{firstLetter}</Text>
                  <View style={styles.onlineBadge} />
                </View>
              )}

              <Text style={styles.expertName} numberOfLines={1}>
                {displayName.split(' ')[0]}
              </Text>
              {item.specialty && (
                <Text style={styles.expertSpec} numberOfLines={1}>
                  {item.specialty.split(' ')[0]}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:     { marginVertical: 15, paddingVertical: 10 },
  sectionTitle:  { fontSize: 15, fontWeight: '800', color: '#F8FAFC', marginLeft: 20, marginBottom: 14, letterSpacing: 0.5 },
  scrollContent: { paddingLeft: 20, paddingRight: 8 },
  expertItem:    { alignItems: 'center', marginRight: 18, width: 68 },
  
  /* ✅ Nouveau style pour l'image */
  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: '#0F172A',
    borderWidth: 1.5,
    borderColor: '#1E293B',
  },
  
  avatarCircle:  {
    width: 60, height: 60, borderRadius: 20,
    backgroundColor: '#0F172A',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, position: 'relative',
    elevation: 4, shadowOpacity: 0.2, shadowRadius: 4
  },
  avatarLetter:  { fontSize: 22, fontWeight: '900' },
  onlineBadge:   {
    position: 'absolute', bottom: -1, right: -1,
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: '#22C55E', borderWidth: 2, borderColor: '#020617'
  },
  expertName:    { fontSize: 11, marginTop: 8, color: '#E2E8F0', fontWeight: '700' },
  expertSpec:    { fontSize: 9, color: '#475569', marginTop: 2, fontWeight: '600' },
});