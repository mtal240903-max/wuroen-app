import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';

const AVATAR_COLORS = [
  '#3b82f6', // Bleu
  '#8b5cf6', // Violet
  '#06b6d4', // Cyan
  '#f43f5e', // Rose
  '#10b981', // Émeraude
  '#f59e0b'  // Ambre
];

export default function CollaboratorList({ collaborators, navigation }) {
  const getAvatarColor = (index) => AVATAR_COLORS[index % AVATAR_COLORS.length];

  return (
    <View style={styles.container}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={collaborators}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => {
          const avatarColor = getAvatarColor(index);
          const avatarSource = item.avatarUrl || item.avatar || item.photo;
          const hasAvatar = !!avatarSource;

          return (
            <TouchableOpacity 
              style={styles.collabCard} 
              activeOpacity={0.7}
              // ✅ Redirection directe vers la messagerie privée (ChatDetail)
              onPress={() =>
                navigation.navigate('ChatDetail', {
                  chatId: item._id,
                  userName: item.name,
                  isGroup: false,
                })
              }
            >
              <View style={[
                styles.avatar, 
                { backgroundColor: avatarColor + '30', borderColor: avatarColor }
              ]}>
                {hasAvatar ? (
                  <Image 
                    source={{ uri: avatarSource }} 
                    style={styles.avatarImage} 
                  />
                ) : (
                  <Text style={[styles.avatarText, { color: avatarColor }]}>
                    {item.name?.[0]?.toUpperCase() || '?'}
                  </Text>
                )}
              </View>
              <Text style={styles.name} numberOfLines={1}>{item.name?.split(' ')[0] || 'Expert'}</Text>
              <Text style={styles.role} numberOfLines={1}>{item.specialite || 'Collaborateur'}</Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 0 },
  list: { paddingLeft: 12, paddingRight: 20 },
  collabCard: { alignItems: 'center', width: 75, marginHorizontal: 4 },
  avatar: { 
    width: 58, 
    height: 58, 
    borderRadius: 14, 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderWidth: 1.5,
    overflow: 'hidden'
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover'
  },
  avatarText: { fontSize: 18, fontWeight: '900' },
  name: { color: '#F8FAFC', fontSize: 11, fontWeight: '700', marginTop: 8, textAlign: 'center' },
  role: { color: '#64748B', fontSize: 9, marginTop: 2, textAlign: 'center' }
});