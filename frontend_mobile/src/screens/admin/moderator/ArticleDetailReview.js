import React, { useState, useEffect, useCallback, useRef, useContext } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Image,
  TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../../../context/AuthContext';
import { ArrowLeft, CheckCircle, XCircle, User, Calendar, Tag, FileText, MessageSquare, BarChart3 } from 'lucide-react-native';
import { COLORS } from '../../../theme/theme';
import api from '../../../services/api';

const Section = ({ title, content, icon: Icon }) => {
  if (!content) return null;
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.iconBox}><Icon size={16} color={COLORS.primary} /></View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <Text style={styles.sectionContent}>{content}</Text>
    </View>
  );
};

export default function ArticleDetailReview({ navigation, route }) {
  const { articleId } = route.params;
  const { user } = useContext(AuthContext);
  const isMounted = useRef(true);

  const [article, setArticle]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [reviewComment, setReviewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const fetchArticle = useCallback(async () => {
    try {
      const res = await api.get(`/articles/${articleId}`);
      if (isMounted.current) setArticle(res.data);
    } catch (err) {
      console.error("Erreur article:", err.response?.status);
      Alert.alert("Erreur", "Impossible de charger l'article.", [
        { text: "Retour", onPress: () => navigation.goBack() }
      ]);
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [articleId]);

  useEffect(() => { fetchArticle(); }, [fetchArticle]);

  const handleReview = useCallback(async (action) => {
    const isApprove = action === 'approve';

    if (!isApprove && !reviewComment.trim()) {
      Alert.alert("Motif requis", "Saisissez un motif de rejet avant de continuer.");
      return;
    }

    Alert.alert(
      isApprove ? "Valider la publication" : "Rejeter l'article",
      isApprove
        ? "Cet article sera publié dans le flux public."
        : "Cette soumission sera rejetée avec votre commentaire.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: isApprove ? "Publier" : "Rejeter",
          style: isApprove ? "default" : "destructive",
          onPress: async () => {
            setSubmitting(true);
            try {
              // ✅ Routes modérateur sécurisées — vérifient que l'article est assigné
              const endpoint = isApprove
                ? `/moderator/approve/${article._id}`
                : `/moderator/reject/${article._id}`;

              await api.patch(endpoint, { comment: reviewComment.trim() });

              Alert.alert(
                isApprove ? "✅ Publié" : "❌ Rejeté",
                isApprove ? "L'article est maintenant visible." : "L'auteur sera informé.",
                [{ text: "OK", onPress: () => navigation.goBack() }]
              );
            } catch (err) {
              const msg = err.response?.data?.message || "Action impossible.";
              Alert.alert("Erreur", msg);
            } finally {
              setSubmitting(false);
            }
          }
        }
      ]
    );
  }, [article?._id, reviewComment]);

  if (loading) return (
    <View style={styles.loaderContainer}>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  );

  if (!article) return (
    <View style={styles.loaderContainer}>
      <Text style={{ color: '#EF4444', fontSize: 16 }}>Article introuvable.</Text>
      <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
        <Text style={{ color: COLORS.primary, fontWeight: '700' }}>← Retour</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navBtn}>
          <ArrowLeft size={22} color="#FFF" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerSub}>RÉVISION SCIENTIFIQUE</Text>
          <View style={styles.titleRow}>
            <Text style={styles.headerTitle} numberOfLines={1}>Analyse Article</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>ASSIGNÉ</Text>
            </View>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          <Text style={styles.mainTitle}>{article.title}</Text>

          <View style={styles.expertCard}>
            <View style={styles.expertRow}>
              <User size={16} color={COLORS.primary} />
              <Text style={styles.expertLabel}>Auteur :</Text>
              <Text style={styles.expertName}>{article.author?.name || 'Inconnu'}</Text>
            </View>
            <View style={styles.expertRow}>
              <Tag size={16} color={COLORS.primary} />
              <Text style={styles.expertLabel}>Domaine :</Text>
              <Text style={styles.expertName}>{article.category || 'Général'}</Text>
            </View>
            <View style={styles.expertRow}>
              <Calendar size={16} color={COLORS.primary} />
              <Text style={styles.expertLabel}>Soumis :</Text>
              <Text style={styles.expertName}>{new Date(article.createdAt).toLocaleDateString('fr-FR')}</Text>
            </View>
          </View>

          {(article.image || article.imageUrl) && (
            <Image source={{ uri: article.image || article.imageUrl }} style={styles.coverImage} />
          )}

          <Section title="Introduction"        content={article.intro}   icon={FileText} />
          <Section title="Méthodologie"        content={article.methodo} icon={BarChart3} />
          <Section title="Résultats & Analyse" content={article.results} icon={CheckCircle} />

          {article.references?.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.iconBox}><FileText size={16} color={COLORS.primary} /></View>
                <Text style={styles.sectionTitle}>Références</Text>
              </View>
              {article.references.map((ref, i) => (
                <Text key={i} style={[styles.sectionContent, { marginBottom: 4 }]}>• {ref}</Text>
              ))}
            </View>
          )}

          <View style={styles.reviewBox}>
            <View style={styles.reviewHeader}>
              <MessageSquare size={18} color={COLORS.primary} />
              <Text style={styles.reviewTitle}>Feedback de révision</Text>
            </View>
            <TextInput
              style={styles.reviewInput}
              placeholder="Commentaire pour l'auteur (obligatoire pour rejeter)..."
              placeholderTextColor="#475569"
              value={reviewComment}
              onChangeText={setReviewComment}
              multiline
              textAlignVertical="top"
            />
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>

        <View style={styles.actionPad}>
          {submitting ? (
            <ActivityIndicator color={COLORS.primary} style={{ flex: 1 }} />
          ) : (
            <>
              <TouchableOpacity style={styles.btnReject} onPress={() => handleReview('reject')}>
                <XCircle size={20} color="#FFF" />
                <Text style={styles.btnLabel}>Rejeter</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnApprove} onPress={() => handleReview('approve')}>
                <CheckCircle size={20} color="#FFF" />
                <Text style={styles.btnLabel}>Publier</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#020617' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#020617' },
  header:          { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: '#0F172A', borderBottomWidth: 1, borderBottomColor: '#1E293B' },
  navBtn:          { backgroundColor: '#1E293B', padding: 10, borderRadius: 12, marginRight: 15 },
  headerSub:       { color: COLORS.primary, fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  titleRow:        { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 2 },
  headerTitle:     { color: '#FFF', fontSize: 18, fontWeight: '800', flex: 1 },
  badge:           { backgroundColor: '#10B98120', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeText:       { color: '#10B981', fontSize: 9, fontWeight: '900' },
  scroll:          { flex: 1 },
  scrollContent:   { padding: 20 },
  mainTitle:       { fontSize: 22, fontWeight: '900', color: '#F8FAFC', marginBottom: 25, lineHeight: 30 },
  expertCard:      { backgroundColor: '#0F172A', borderRadius: 20, padding: 20, marginBottom: 25, borderWidth: 1, borderColor: '#1E293B', gap: 12 },
  expertRow:       { flexDirection: 'row', alignItems: 'center', gap: 12 },
  expertLabel:     { color: '#64748B', fontSize: 13, fontWeight: '600', width: 70 },
  expertName:      { color: '#E2E8F0', fontSize: 13, fontWeight: '700', flex: 1 },
  coverImage:      { width: '100%', height: 200, borderRadius: 20, marginBottom: 20 },
  section:         { backgroundColor: '#0F172A', borderRadius: 20, padding: 20, marginBottom: 15, borderWidth: 1, borderColor: '#1E293B' },
  sectionHeader:   { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  iconBox:         { backgroundColor: '#1E293B', padding: 8, borderRadius: 10 },
  sectionTitle:    { color: '#F1F5F9', fontSize: 16, fontWeight: '800' },
  sectionContent:  { color: '#94A3B8', fontSize: 14, lineHeight: 22 },
  reviewBox:       { backgroundColor: '#0F172A', borderRadius: 20, padding: 20, marginTop: 10, borderWidth: 1, borderColor: COLORS.primary + '40' },
  reviewHeader:    { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 15 },
  reviewTitle:     { color: '#FFF', fontSize: 15, fontWeight: '800' },
  reviewInput:     { backgroundColor: '#020617', borderRadius: 14, padding: 15, color: '#E2E8F0', fontSize: 14, minHeight: 120, borderWidth: 1, borderColor: '#1E293B' },
  actionPad:       { flexDirection: 'row', padding: 20, backgroundColor: '#0F172A', borderTopWidth: 1, borderTopColor: '#1E293B', gap: 15 },
  btnReject:       { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#EF4444', borderRadius: 18, height: 56, gap: 10 },
  btnApprove:      { flex: 1.5, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#10B981', borderRadius: 18, height: 56, gap: 10 },
  btnLabel:        { color: '#FFF', fontWeight: '900', fontSize: 16 },
});