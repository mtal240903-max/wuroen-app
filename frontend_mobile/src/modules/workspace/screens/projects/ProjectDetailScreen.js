import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity } from 'react-native';
import { ArrowLeft, MoreHorizontal, CheckCircle2, Clock, FileText, Download, Tag, AlignLeft, BarChart2, Plus } from 'lucide-react-native';

export default function ProjectDetailScreen({ route, navigation }) {
  const { project } = route.params || {};
  const [activeTab, setActiveTab] = useState('Tâches');

  if (!project) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <Text style={styles.errorText}>Aucune information trouvée pour ce projet.</Text>
        <TouchableOpacity style={styles.backBtnSimple} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Exemple de données pour les tâches (peut être remplacé par project.tasks)
  const tasksList = project.tasks || [
    { id: 1, title: 'Étude du terrain', status: 'done' },
    { id: 2, title: 'Budget prévisionnel', status: 'in_progress' },
    { id: 3, title: 'Recherche de financement', status: 'pending' },
    { id: 4, title: 'Construction bâtiment principal', status: 'pending' },
    { id: 5, title: 'Rapport final', status: 'pending' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* Photo de couverture */}
        <View style={styles.imageContainer}>
          {project.imageUrl ? (
            <Image source={{ uri: project.imageUrl }} style={styles.headerImage} />
          ) : (
            <View style={[styles.headerImage, { backgroundColor: '#1E293B', justifyContent: 'center', alignItems: 'center' }]}>
              <Text style={{ color: '#6366F1', fontWeight: 'bold', fontSize: 24 }}>W</Text>
            </View>
          )}
          
          {/* Boutons d'en-tête (Retour et Options) */}
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeft color="#FFF" size={22} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionsButton}>
            <MoreHorizontal color="#FFF" size={22} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          
          {/* Titre et Chef de projet */}
          <Text style={styles.title}>{project.name || 'Construction Ferme'}</Text>
          <Text style={styles.subTitle}>Chef projet : {project.manager || 'Ali O.'}</Text>
          
          {/* Section Progression */}
          <View style={styles.progressHeaderRow}>
            <Text style={styles.progressLabel}>Progression</Text>
            <Text style={styles.progressPercent}>{project.progress || 60}%</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${project.progress || 60}%` }]} />
          </View>

          {/* Onglets de navigation */}
          <View style={styles.tabsRow}>
            {['Tâches', 'Détails', 'Documents', 'Activité'].map((tab) => (
              <TouchableOpacity 
                key={tab} 
                style={[styles.tabItem, activeTab === tab && styles.activeTabItem]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Contenu dynamique selon l'onglet actif */}
          {activeTab === 'Tâches' && (
            <View style={styles.tasksContainer}>
              {tasksList.map((task, index) => (
                <View key={task.id || index} style={styles.taskRow}>
                  <View style={styles.taskLeft}>
                    <FileText color="#3B82F6" size={18} style={{ marginRight: 10 }} />
                    <Text style={styles.taskTitle}>{task.title}</Text>
                  </View>
                  
                  {/* Statut de la tâche */}
                  {task.status === 'done' && (
                    <CheckCircle2 color="#10B981" size={20} />
                  )}
                  {task.status === 'in_progress' && (
                    <View style={styles.statusOrangeDot} />
                  )}
                  {task.status === 'pending' && (
                    <Text style={styles.statusPendingText}>En attente</Text>
                  )}
                </View>
              ))}
            </View>
          )}

          {activeTab === 'Détails' && (
            <View style={styles.sectionContainer}>
              <Text style={styles.descText}>
                {project.description || 'Aucune description fournie pour ce projet.'}
              </Text>
            </View>
          )}

          {activeTab === 'Documents' && (
            <View style={styles.sectionContainer}>
              <View style={styles.card}>
                {['Plan_technique.pdf', 'Budget_previsionnel.xlsx'].map((doc, i) => (
                  <View key={i} style={[styles.docRow, i > 0 && styles.docRowBorder]}>
                    <FileText color="#94A3B8" size={18} />
                    <Text style={styles.docName} numberOfLines={1}>{doc}</Text>
                    <TouchableOpacity style={styles.downloadBtn}>
                      <Download color="#6366F1" size={18} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}

          {activeTab === 'Activité' && (
            <View style={styles.sectionContainer}>
              <Text style={styles.descText}>Aucune activité récente enregistrée.</Text>
            </View>
          )}

        </View>
      </ScrollView>

      {/* Bouton Flottant '+' */}
      <TouchableOpacity style={styles.floatingButton}>
        <Plus color="#FFF" size={24} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  centerContainer: { justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { color: '#64748B', fontSize: 16, marginBottom: 20, textAlign: 'center' },
  backBtnSimple: { backgroundColor: '#3B82F6', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  backBtnText: { color: '#FFF', fontWeight: '600' },
  
  imageContainer: { width: '100%', height: 220, position: 'relative' },
  headerImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  backButton: { position: 'absolute', top: 45, left: 20, backgroundColor: 'rgba(0, 0, 0, 0.4)', padding: 8, borderRadius: 12 },
  optionsButton: { position: 'absolute', top: 45, right: 20, backgroundColor: 'rgba(0, 0, 0, 0.4)', padding: 8, borderRadius: 12 },
  
  content: { padding: 20, backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -20 },
  
  title: { fontSize: 20, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  subTitle: { fontSize: 13, color: '#64748B', marginBottom: 20 },
  
  progressHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel: { fontSize: 14, fontWeight: '600', color: '#0F172A' },
  progressPercent: { fontSize: 14, fontWeight: '600', color: '#0F172A' },
  
  progressBarBg: { height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden', marginBottom: 25 },
  progressBarFill: { height: '100%', backgroundColor: '#2563EB', borderRadius: 4 },

  // Onglets
  tabsRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E2E8F0', marginBottom: 15 },
  tabItem: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  activeTabItem: { borderBottomWidth: 2, borderBottomColor: '#2563EB' },
  tabText: { fontSize: 14, fontWeight: '500', color: '#64748B' },
  activeTabText: { color: '#2563EB', fontWeight: '600' },

  // Tâches
  tasksContainer: { marginTop: 5 },
  taskRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  taskLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  taskTitle: { fontSize: 14, color: '#1E293B', fontWeight: '500' },
  statusOrangeDot: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#F59E0B' },
  statusPendingText: { fontSize: 12, color: '#94A3B8', fontWeight: '500' },

  // Sections alternatives
  sectionContainer: { marginTop: 15 },
  descText: { color: '#64748B', lineHeight: 20, fontSize: 14 },
  card: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 4, borderWidth: 1, borderColor: '#E2E8F0' },
  docRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 12 },
  docRowBorder: { borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  docName: { flex: 1, marginLeft: 10, color: '#1E293B', fontSize: 14, fontWeight: '500' },
  downloadBtn: { padding: 6, backgroundColor: '#E2E8F0', borderRadius: 8 },

  // Bouton Flottant
  floatingButton: { position: 'absolute', bottom: 30, right: 25, backgroundColor: '#2563EB', width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', shadowColor: '#2563EB', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 5 }
});