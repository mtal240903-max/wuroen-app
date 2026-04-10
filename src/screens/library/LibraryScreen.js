import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { COLORS, SPACING, SIZES } from '../../theme/theme';
import { GraduationCap, Layers, Calendar, BookOpen, FileText, CheckCircle } from 'lucide-react-native';

const FilterItem = ({ title, icon: Icon, subtitle }) => (
  <TouchableOpacity style={styles.filterCard}>
    <View style={styles.iconContainer}>
      <Icon color={COLORS.primary} size={24} />
    </View>
    <View>
      <Text style={styles.filterTitle}>{title}</Text>
      <Text style={styles.filterSubtitle}>{subtitle}</Text>
    </View>
  </TouchableOpacity>
);

export default function LibraryScreen() {
  const recentExams = [
    { id: '1', subject: 'Génétique Animale', type: 'Examen Final', year: '2025' },
    { id: '2', subject: 'Nutrition Ruminants', type: 'Partiel', year: '2024' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Bibliothèque</Text>
        <Text style={styles.subtitle}>Épreuves et Corrigés</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Filtrer par</Text>
        <FilterItem title="Faculté" subtitle="Agronomie, Sciences..." icon={GraduationCap} />
        <FilterItem title="Niveau" subtitle="Licence 1, 2, 3 / Master" icon={Layers} />
        <FilterItem title="Semestre" subtitle="S1, S2, S3..." icon={Calendar} />
        <FilterItem title="Matière" subtitle="Physiologie, Bio..." icon={BookOpen} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Documents récents</Text>
        {recentExams.map((item) => (
          <View key={item.id} style={styles.examCard}>
            <View style={styles.examInfo}>
              <Text style={styles.examSubject}>{item.subject}</Text>
              <Text style={styles.examMeta}>{item.type} • {item.year}</Text>
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.btnIcon}><FileText size={20} color={COLORS.primary} /></TouchableOpacity>
              <TouchableOpacity style={[styles.btnIcon, {backgroundColor: COLORS.secondary + '20'}]}><CheckCircle size={20} color={COLORS.secondary} /></TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: SPACING.l, backgroundColor: '#FFF', borderBottomLeftRadius: 30, borderBottomRightRadius: 30, marginBottom: SPACING.m },
  title: { fontSize: 28, fontWeight: 'bold', color: COLORS.textPrimary },
  subtitle: { fontSize: 16, color: COLORS.primary, fontWeight: '500' },
  section: { paddingHorizontal: SPACING.m, marginBottom: SPACING.l },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: SPACING.m },
  filterCard: { backgroundColor: '#FFF', padding: 15, borderRadius: SIZES.radius, flexDirection: 'row', alignItems: 'center', marginBottom: 12, elevation: 2 },
  iconContainer: { width: 50, height: 50, borderRadius: 10, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  filterTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.textPrimary },
  filterSubtitle: { fontSize: 12, color: COLORS.textSecondary },
  examCard: { backgroundColor: '#FFF', padding: 15, borderRadius: SIZES.radius, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  examSubject: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary },
  examMeta: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  actionButtons: { flexDirection: 'row', gap: 10 },
  btnIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' }
});