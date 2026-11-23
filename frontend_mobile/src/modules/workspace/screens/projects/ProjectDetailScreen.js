import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity } from 'react-native';
import { ArrowLeft, MoreHorizontal, CheckCircle2, Clock, FileText, Download, Plus, Calendar, User } from 'lucide-react-native';

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

  // Tâches dynamiques provenant du projet ou valeurs par défaut
  const tasksList = project.tasks && project.tasks.length > 0 ? project.tasks : [
    { id: 1, title: 'Étude du terrain', status: 'done' },
    { id: 2, title: 'Budget prévisionnel', status: 'in_progress' },
    { id: 3, title: 'Recherche de financement', status: 'pending' },
    { id: 4, title: 'Construction bâtiment principal', status: 'pending' },
    { id: 5, title: 'Rapport final', status: 'pending' },
  ];

  const documentsList = project.documents && project.documents.length > 0 ? project.documents : [
    'Plan_technique.pdf', 
    'Budget_previsionnel.xlsx'
  ];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        
        {/* Photo de couverture */}
        <View style={styles.imageContainer}>
          {project.imageUrl ? (
            <Image source={{ uri: project.imageUrl }} style={styles.headerImage} />
          ) : (
            <View style={[styles.headerImage, styles.placeholderImage]}>
              <Text style={styles.placeholderLogo}>{project.name ? project.name.charAt(0).toUpperCase() : 'W'}</Text>
            </View>
          )}
          
          <View style={styles.imageOverlay} />

          {/* Boutons d'en-tête (Retour et Options) */}
          <TouchableOpacity style={[styles.iconButton, { left: 20 }]} onPress={() => navigation.goBack()}>
            <ArrowLeft color="#FFF" size={20} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconButton, { right: 20 }]}>
            <MoreHorizontal color="#FFF" size={20} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          
          {/* Titre et Chef de projet */}
          <Text style={styles.title}>{project.name || 'Construction Ferme'}</Text>
          <View style={styles.subTitleRow}>
            <User color="#94A3B8" size={14} style={{ marginRight: 6 }} />
            <Text style={styles.subTitle}>Chef de projet : <Text style={styles.managerName}>{project.manager || 'Ali O.'}</Text></Text>
          </View>
          
          {/* Section Progression */}
          <View style={styles.progressCard}>
            <View style={styles.progressHeaderRow}>
              <Text style={styles.progressLabel}>Progression globale</Text>
              <Text style={styles.progressPercent}>{project.progress || 60}%</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${project.progress || 60}%` }]} />
            </View>
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
                    <View style={styles.taskIconContainer}>
                      <FileText color="#6366F1" size={16} />
                    </View>
                    <Text style={styles.taskTitle}>{task.title}</Text>
                  </View>
                  
                  {/* Statut de la tâche */}
                  {task.status === 'done' && (
                    <View style={[styles.badge, styles.badgeDone]}>
                      <CheckCircle2 color="#10B981" size={14} style={{ marginRight: 4 }} />
                      <Text style={styles.badgeTextDone}>Terminé</Text>
                    </View>
                  )}
                  {task.status === 'in_progress' && (
                    <View style={[styles.badge, styles.badgeProgress]}>
                      <Clock color="#F59E0B" size={14} style={{ marginRight: 4 }} />
                      <Text style={styles.badgeTextProgress}>En cours</Text>
                    </View>
                  )}
                  {task.status === 'pending' && (
                    <View style={[styles.badge, styles.badgePending]}>
                      <Text style={styles.badgeTextPending}>En attente</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}

          {activeTab === 'Détails' && (
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitleHeader}>À propos du projet</Text>
              <Text style={styles.descText}>
                {project.description || 'Aucune description fournie pour ce projet. Ce module permet le suivi technique et opérationnel des activités de la structure.'}
              </Text>
              
              {project.startDate && (
                <View style={styles.metaInfoRow}>
                  <Calendar color="#6366F1" size={16} style={{ marginRight: 8 }} />
                  <Text style={styles.metaText}>Date de début : {project.startDate}</Text>
                </View>
              )}
            </View>
          )}

          {activeTab === 'Documents' && (
            <View style={styles.sectionContainer}>
              <View style={styles.card}>
                {documentsList.map((doc, i) => (
                  <View key={i} style={[styles.docRow, i > 0 && styles.docRowBorder]}>
                    <View style={styles.taskIconContainer}>
                      <FileText color="#94A3B8" size={16} />
                    </View>
                    <Text style={styles.docName} numberOfLines={1}>{doc}</Text>
                    <TouchableOpacity style={styles.downloadBtn}>
                      <Download color="#6366F1" size={16} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}

          {activeTab === 'Activité' && (
            <View style={styles.sectionCard}>
              <Text style={styles.descText}>
                {project.recentActivity || 'Aucune activité récente enregistrée sur ce projet.'}
              </Text>
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
  container: { flex: 1, backgroundColor: '#0B0F19' },
  centerContainer: { justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { color: '#94A3B8', fontSize: 15, marginBottom: 20, textAlign: 'center' },
  backBtnSimple: { backgroundColor: '#6366F1', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  backBtnText: { color: '#FFF', fontWeight: '600' },
  
  imageContainer: { width: '100%', height: 240, position: 'relative', backgroundColor: '#1E293B' },
  headerImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  placeholderImage: { justifyContent: 'center', alignItems: 'center' },
  placeholderLogo: { color: '#6366F1', fontWeight: 'bold', fontSize: 32 },
  imageOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)' },
  
  iconButton: { position: 'absolute', top: 45, width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  
  content: { padding: 20, backgroundColor: '#0B0F19', borderTopLeftRadius: 28, borderTopRightRadius: 28, marginTop: -30 },
  
  title: { fontSize: 22, fontWeight: '700', color: '#F8FAFC', marginBottom: 6 },
  subTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  subTitle: { fontSize: 13, color: '#94A3B8' },
  managerName: { color: '#CBD5E1', fontWeight: '600' },
  
  progressCard: { backgroundColor: '#111827', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#1F2937', marginBottom: 20 },
  progressHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  progressLabel: { fontSize: 13, fontWeight: '600', color: '#CBD5E1' },
  progressPercent: { fontSize: 13, fontWeight: '700', color: '#6366F1' },
  
  progressBarBg: { height: 8, backgroundColor: '#1F2937', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#6366F1', borderRadius: 4 },

  // Onglets
  tabsRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#1F2937', marginBottom: 20 },
  tabItem: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  activeTabItem: { borderBottomWidth: 2, borderBottomColor: '#6366F1' },
  tabText: { fontSize: 14, fontWeight: '500', color: '#64748B' },
  activeTabText: { color: '#6366F1', fontWeight: '600' },

  // Tâches
  tasksContainer: { marginTop: 5 },
  taskRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#1F2937' },
  taskLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 10 },
  taskIconContainer: { width: 32, height: 32, borderRadius: 8, backgroundColor: 'rgba(99, 102, 241, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  taskTitle: { fontSize: 14, color: '#E2E8F0', fontWeight: '500', flex: 1 },
  
  // Badges de statut
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  badgeDone: { backgroundColor: 'rgba(16, 185, 129, 0.1)' },
  badgeTextDone: { fontSize: 12, color: '#10B981', fontWeight: '600' },
  badgeProgress: { backgroundColor: 'rgba(245, 158, 11, 0.1)' },
  badgeTextProgress: { fontSize: 12, color: '#F59E0B', fontWeight: '600' },
  badgePending: { backgroundColor: '#1F2937', paddingHorizontal: 10, paddingVertical: 5 },
  badgeTextPending: { fontSize: 12, color: '#94A3B8', fontWeight: '500' },

  // Sections alternatives
  sectionCard: { backgroundColor: '#111827', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#1F2937', marginTop: 5 },
  sectionTitleHeader: { fontSize: 15, fontWeight: '600', color: '#F8FAFC', marginBottom: 8 },
  descText: { color: '#94A3B8', lineHeight: 22, fontSize: 14 },
  metaInfoRow: { flexDirection: 'row', alignItems: 'center', marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#1F2937' },
  metaText: { color: '#94A3B8', fontSize: 13 },
  
  card: { backgroundColor: '#111827', borderRadius: 16, padding: 6, borderWidth: 1, borderColor: '#1F2937' },
  docRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 8 },
  docRowBorder: { borderTopWidth: 1, borderTopColor: '#1F2937' },
  docName: { flex: 1, marginLeft: 10, color: '#E2E8F0', fontSize: 14, fontWeight: '500' },
  downloadBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: 'rgba(99, 102, 241, 0.1)', justifyContent: 'center', alignItems: 'center' },

  // Bouton Flottant
  floatingButton: { position: 'absolute', bottom: 30, right: 25, backgroundColor: '#6366F1', width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', shadowColor: '#6366F1', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 }
});