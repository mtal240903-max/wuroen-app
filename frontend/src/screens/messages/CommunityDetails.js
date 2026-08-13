import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { COLORS } from '../../theme/theme'; // Ajuste le chemin selon ton dossier theme

// --- COMPOSANTS INTERNES ---
const MemberItem = ({ member }) => {
  const getLevelColor = (level) => {
    switch (level) {
      case 3: return '#eab308'; // Or (Admin)
      case 2: return '#3b82f6'; // Bleu (Resp)
      default: return '#94a3b8'; // Gris (Membre)
    }
  };

  return (
    <View style={styles.memberCard}>
      <Text style={styles.memberName}>{member.name}</Text>
      <View style={[styles.levelBadge, { backgroundColor: getLevelColor(member.level) }]}>
        <Text style={styles.levelText}>Niveau {member.level}</Text>
      </View>
    </View>
  );
};

// --- ÉCRAN PRINCIPAL ---
export default function CommunityDetails({ route }) {
  const { communityId } = route.params; // ID reçu via navigation
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ICI : Remplace par ton appel API réel : api.get(`/communities/${communityId}`)
    setTimeout(() => {
      setData({
        name: "Wuro'en Tech",
        groups: ['Admin', 'Production', 'Vente', 'Support'],
        members: [
          { id: '1', name: 'Jean Dupont', level: 3 },
          { id: '2', name: 'Marie Curie', level: 2 },
          { id: '3', name: 'Paul Martin', level: 1 },
        ]
      });
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) return <View style={styles.loader}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{data.name}</Text>
      
      <Text style={styles.sectionTitle}>Groupes internes</Text>
      <View style={styles.groupContainer}>
        {data.groups.map((g, i) => (
          <TouchableOpacity key={i} style={styles.groupBadge}>
            <Text style={styles.groupText}>{g}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Membres de la communauté</Text>
      <FlatList
        data={data.members}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MemberItem member={item} />}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#020617' }, // Fond sombre cohérent
  title: { fontSize: 28, fontWeight: '900', color: '#FFF', marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: '#475569', marginTop: 15, marginBottom: 10, textTransform: 'uppercase' },
  groupContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  groupBadge: { backgroundColor: '#0F172A', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#1E293B' },
  groupText: { color: '#E2E8F0', fontSize: 12, fontWeight: '600' },
  memberCard: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, backgroundColor: '#0F172A', marginBottom: 8, borderRadius: 12, borderWidth: 1, borderColor: '#1E293B' },
  memberName: { color: '#F8FAFC', fontSize: 15, fontWeight: '600' },
  levelBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  levelText: { color: '#FFF', fontSize: 10, fontWeight: '900' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#020617' }
});