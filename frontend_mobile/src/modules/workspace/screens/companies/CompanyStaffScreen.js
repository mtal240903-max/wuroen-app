import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, FlatList, TouchableOpacity, 
  ActivityIndicator, Alert, StatusBar 
} from 'react-native';
import { FolderGit2, Plus, Clock, CheckCircle2, AlertCircle } from 'lucide-react-native';
import api from '../../../../services/api';

const DARK_COLORS = {
  background: '#090D1A',
  surface: '#111726',
  textMain: '#FFFFFF',
  textSub: '#64748B',
  primary: '#6366F1',
  border: '#1E293B',
  success: '#10B981',
  warning: '#F59E0B'
};

export default function CompanyProjectsScreen({ route, navigation }) {
  const { companyId } = route.params || {};
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/workspace/companies/${companyId}/projects`);
      setProjects(response.data.projects || []);
    } catch (error) {
      console.error("Erreur projets:", error);
      Alert.alert("Erreur", "Impossible de charger les projets de l'entreprise.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [companyId]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed': 
        return { label: 'Terminé', color: DARK_COLORS.success, icon: <CheckCircle2 size={12} color={DARK_COLORS.success} /> };
      case 'in_progress': 
        return { label: 'En cours', color: DARK_COLORS.primary, icon: <Clock size={12} color={DARK_COLORS.primary} /> };
      default: 
        return { label: 'En attente', color: DARK_COLORS.warning, icon: <AlertCircle size={12} color={DARK_COLORS.warning} /> };
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={DARK_COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Projets de l'entreprise ({projects.length})</Text>
        <TouchableOpacity 
          style={styles.addBtn} 
          onPress={() => navigation.navigate('CreateProject', { companyId })}
        >
          <Plus size={18} color="#FFF" />
          <Text style={styles.addBtnText}>Nouveau</Text>
        </TouchableOpacity>
      </View>

      <FlatList 
        data={projects}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => {
          const statusInfo = getStatusBadge(item.status);
          return (
            <TouchableOpacity 
              style={styles.projectCard}
              onPress={() => navigation.navigate('ProjectDetails', { projectId: item._id })}
            >
              <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                  <FolderGit2 size={20} color={DARK_COLORS.primary} />
                </View>
                <View style={styles.titleContainer}>
                  <Text style={styles.projectName}>{item.name}</Text>
                  <Text style={styles.projectDesc} numberOfLines={2}>
                    {item.description || "Aucune description fournie pour ce projet."}
                  </Text>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <View style={[styles.statusBadge, { borderColor: statusInfo.color }]}>
                  {statusInfo.icon}
                  <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
                </View>
                <Text style={styles.dateText}>
                  Échéance : {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'Non définie'}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucun projet enregistré pour le moment.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DARK_COLORS.background, padding: 16 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: DARK_COLORS.background },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: DARK_COLORS.textMain, letterSpacing: 0.5 },
  addBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: DARK_COLORS.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, gap: 4 },
  addBtnText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  listContainer: { paddingBottom: 24 },
  projectCard: { backgroundColor: DARK_COLORS.surface, borderRadius: 16, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: DARK_COLORS.border },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  iconContainer: { width: 38, height: 38, borderRadius: 10, backgroundColor: 'rgba(99, 102, 241, 0.1)', justifyContent: 'center', alignItems: 'center' },
  titleContainer: { flex: 1 },
  projectName: { fontSize: 15, fontWeight: '700', color: DARK_COLORS.textMain },
  projectDesc: { fontSize: 12, color: DARK_COLORS.textSub, marginTop: 4, lineHeight: 16 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, paddingTop: 10, borderTopWidth: 1, borderColor: DARK_COLORS.border },
  statusBadge: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, gap: 4 },
  statusText: { fontSize: 10, fontWeight: '700' },
  dateText: { fontSize: 11, color: DARK_COLORS.textSub },
  emptyContainer: { paddingVertical: 40, alignItems: 'center' },
  emptyText: { color: DARK_COLORS.textSub, fontSize: 13 }
});
