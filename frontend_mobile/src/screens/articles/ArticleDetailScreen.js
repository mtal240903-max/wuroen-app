import React, { useState, useEffect, useCallback, useRef, useContext } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Image, TextInput, KeyboardAvoidingView, Platform,
  ActivityIndicator, Alert, Share, StatusBar, Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../theme/theme';
import {
  ArrowLeft, Share2, Heart, Send, Clock,
  Eye, MessageCircle, ChevronRight, BookOpen
} from 'lucide-react-native';
import { AuthContext } from '../../context/AuthContext';

// ✅ FIX : api au lieu de axios + IP codée en dur
import api from '../../services/api';

// ─────────────────────────────────────────────────────────────
// COMPOSANT SECTION
// ─────────────────────────────────────────────────────────────
const Section = ({ title, content, color = COLORS.primary }) => {
  if (!content) return null;
  return (
    <View style={styles.section}>
      <View style={styles.sectionLabel}>
        <View style={[styles.sectionDot, { backgroundColor: color }]} />
        <Text style={[styles.sectionTitle, { color }]}>{title}</Text>
      </View>
      <Text style={styles.sectionContent}>{content}</Text>
    </View>
  );
};

// ─────────────────────────────────────────────────────────────
// ÉCRAN PRINCIPAL
// ─────────────────────────────────────────────────────────────
export default function ArticleDetailScreen({ navigation, route }) {
  const { articleId, article: initialArticle } = route.params;
  const { userToken, user } = useContext(AuthContext);

  const [article,      setArticle]      = useState(initialArticle || null);
  const [commentText,  setCommentText]  = useState('');
  const [isSending,    setIsSending]    = useState(false);
  const [isLiking,     setIsLiking]     = useState(false);
  const [loading,      setLoading]      = useState(!initialArticle);

  const likeScale = useRef(new Animated.Value(1)).current;
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  // ─── Chargement de l'article ──────────────────────────────
  useEffect(() => {
    const fetchArticle = async () => {
      const id = articleId || initialArticle?._id;
      if (!id) return;
      try {
        // ✅ api injecte le token — nécessaire pour les articles non publiés (modérateurs)
        const res = await api.get(`/articles/${id}`);
        if (isMounted.current) {
          setArticle(res.data);
          setLoading(false);
        }
      } catch (err) {
        console.error("Erreur article:", err.response?.status);
        if (isMounted.current) {
          Alert.alert("Erreur", "Article introuvable.");
          navigation.goBack();
        }
      }
    };
    fetchArticle();
  }, [articleId]);

  // ─── Image ───────────────────────────────────────────────
  const imageUrl = (() => {
    const img = article?.image || article?.imageUrl;
    if (!img) return null;
    return img.startsWith('http') ? img : null;
  })();

  // ─── Auteur ───────────────────────────────────────────────
  // ✅ FIX : author.name au lieu de firstName/lastName (User.js n'a qu'un champ name)
  const authorName   = article?.author?.name || "Chercheur Wuro'en";
  const authorLetter = authorName[0]?.toUpperCase() || 'W';
  const isOwnArticle = article?.author?._id?.toString() === user?._id?.toString();

  // ─── Like ─────────────────────────────────────────────────
  const isLiked = article?.likes?.some(
    id => id?.toString() === user?._id?.toString()
  );
  const likesCount = article?.likes?.length || 0;

  const handleLike = useCallback(async () => {
    if (!userToken) return Alert.alert("Connexion requise", "Connectez-vous pour liker.");
    if (isLiking) return;

    // Animation cœur
    Animated.sequence([
      Animated.spring(likeScale, { toValue: 1.4, useNativeDriver: true, speed: 30 }),
      Animated.spring(likeScale, { toValue: 1,   useNativeDriver: true, speed: 30 }),
    ]).start();

    setIsLiking(true);
    // ✅ Optimistic update — met à jour l'UI avant la réponse serveur
    setArticle(prev => {
      if (!prev) return prev;
      const userId = user._id.toString();
      const already = prev.likes?.some(id => id?.toString() === userId);
      return {
        ...prev,
        likes: already
          ? prev.likes.filter(id => id?.toString() !== userId)
          : [...(prev.likes || []), userId]
      };
    });

    try {
      await api.post(`/articles/${article._id}/like`);
    } catch (err) {
      // Revenir en arrière si erreur
      setArticle(prev => {
        if (!prev) return prev;
        const userId = user._id.toString();
        const already = prev.likes?.some(id => id?.toString() === userId);
        return {
          ...prev,
          likes: already
            ? prev.likes.filter(id => id?.toString() !== userId)
            : [...(prev.likes || []), userId]
        };
      });
      Alert.alert("Erreur", err.response?.data?.message || "Like impossible.");
    } finally {
      if (isMounted.current) setIsLiking(false);
    }
  }, [article?._id, user?._id, userToken, isLiking]);

  // ─── Partage ──────────────────────────────────────────────
  const handleShare = useCallback(async () => {
    if (!article) return;
    try {
      // ✅ Lien deep link vers l'article — les utilisateurs qui cliquent arrivent directement sur l'article
      // Format : wuroen://article/{id} pour l'app, ou URL web si tu as un site
      const deepLink = `https://wuroen.app/articles/${article._id}`;

      const result = await Share.share({
        title:   article.title,
        message: `📄 ${article.title}\n\nPar ${authorName} sur Wuro'en — Réseau Scientifique\n\n${article.intro?.substring(0, 150)}...\n\n🔗 Voir l'article : ${deepLink}`,
        url:     deepLink, // iOS uniquement
      });

      // ✅ Incrémenter le compteur seulement si réellement partagé
      if (result.action === Share.sharedAction) {
        await api.post(`/articles/${article._id}/share`).catch(() => {});
        setArticle(prev => prev ? { ...prev, shareCount: (prev.shareCount || 0) + 1 } : prev);
      }
    } catch (err) {
      console.error("Partage:", err.message);
    }
  }, [article, authorName]);

  // ─── Commentaire ──────────────────────────────────────────
  const handleSendComment = useCallback(async () => {
    if (!commentText.trim()) return;
    if (!userToken) return Alert.alert("Connexion requise", "Connectez-vous pour commenter.");

    setIsSending(true);
    try {
      const res = await api.post(`/articles/${article._id}/comments`, { text: commentText.trim() });
      if (isMounted.current) {
        // ✅ Le backend retourne uniquement les commentaires — on les met à jour
        setArticle(prev => prev ? { ...prev, comments: res.data } : prev);
        setCommentText('');
      }
    } catch (err) {
      Alert.alert("Erreur", err.response?.data?.message || "Commentaire impossible.");
    } finally {
      if (isMounted.current) setIsSending(false);
    }
  }, [commentText, userToken, article?._id]);

  // ─── Auteur press ─────────────────────────────────────────
  const handleAuthorPress = useCallback(() => {
    if (!article?.author?._id) return;
    isOwnArticle
      ? navigation.navigate('Main', { screen: 'Profil' })
      : navigation.navigate('UserProfile', { userId: article.author._id });
  }, [article?.author?._id, isOwnArticle]);

  // ─── Loader ───────────────────────────────────────────────
  if (loading || !article) {
    return (
      <View style={styles.loader}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // ─────────────────────────────────────────────────────────
  // RENDU
  // ─────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <ArrowLeft color="#FFF" size={22} />
        </TouchableOpacity>
        <View style={styles.headerStats}>
          <View style={styles.statPill}>
            <Eye size={12} color="#64748B" />
            <Text style={styles.statText}>{article.views || 0}</Text>
          </View>
          <View style={styles.statPill}>
            <MessageCircle size={12} color="#64748B" />
            <Text style={styles.statText}>{article.comments?.length || 0}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.iconBtn} onPress={handleShare}>
          <Share2 color="#FFF" size={20} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

          {/* CATÉGORIE */}
          <View style={styles.categoryBadge}>
            <BookOpen size={11} color={COLORS.primary} />
            <Text style={styles.categoryText}>{article.category || 'Général'}</Text>
          </View>

          {/* TITRE */}
          <Text style={styles.title}>{article.title}</Text>

          {/* AUTEUR */}
          <TouchableOpacity style={styles.authorCard} onPress={handleAuthorPress} activeOpacity={0.8}>
            <View style={styles.avatar}>
              {/* ✅ FIX : authorLetter depuis name (pas firstName) */}
              <Text style={styles.avatarText}>{authorLetter}</Text>
            </View>
            <View style={{ flex: 1 }}>
              {/* ✅ FIX : authorName depuis author.name */}
              <Text style={styles.authorName}>{authorName}</Text>
              <Text style={styles.authorRole}>{article.author?.specialty || 'Scientifique'}</Text>
            </View>
            <ChevronRight size={16} color="#334155" />
          </TouchableOpacity>

          {/* DATE + SHARES */}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Clock size={12} color="#475569" />
              <Text style={styles.metaText}>
                {article.publishedAt
                  ? new Date(article.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
                  : new Date(article.createdAt).toLocaleDateString('fr-FR')}
              </Text>
            </View>
            {article.shareCount > 0 && (
              <View style={styles.metaItem}>
                <Share2 size={12} color="#475569" />
                <Text style={styles.metaText}>{article.shareCount} partages</Text>
              </View>
            )}
          </View>

          {/* IMAGE */}
          {imageUrl && (
            <View style={styles.imageContainer}>
              <Image source={{ uri: imageUrl }} style={styles.articleImage} resizeMode="cover" />
            </View>
          )}

          {/* CONTENU */}
          <Section title="RÉSUMÉ"             content={article.intro}   color={COLORS.primary} />
          <Section title="MÉTHODOLOGIE"       content={article.methodo} color="#8B5CF6" />
          <Section title="RÉSULTATS"          content={article.results} color="#10B981" />

          {/* RÉFÉRENCES */}
          {article.references?.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionLabel}>
                <View style={[styles.sectionDot, { backgroundColor: '#F59E0B' }]} />
                <Text style={[styles.sectionTitle, { color: '#F59E0B' }]}>RÉFÉRENCES</Text>
              </View>
              {article.references.map((ref, i) => (
                <Text key={i} style={[styles.sectionContent, { marginBottom: 4 }]}>
                  [{i + 1}] {ref}
                </Text>
              ))}
            </View>
          )}

          {/* ✅ BOUTON LIKE */}
          <View style={styles.likeSection}>
            <TouchableOpacity style={styles.likeBtn} onPress={handleLike} disabled={isLiking}>
              <Animated.View style={{ transform: [{ scale: likeScale }] }}>
                <Heart
                  size={26}
                  color={isLiked ? '#F43F5E' : '#475569'}
                  fill={isLiked ? '#F43F5E' : 'transparent'}
                />
              </Animated.View>
              <Text style={[styles.likeCount, isLiked && { color: '#F43F5E' }]}>
                {likesCount} {likesCount > 1 ? 'mentions J\'aime' : 'J\'aime'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
              <Share2 size={18} color={COLORS.primary} />
              <Text style={styles.shareBtnText}>Partager</Text>
            </TouchableOpacity>
          </View>

          {/* COMMENTAIRES */}
          <View style={styles.commentsSection}>
            <Text style={styles.discussionTitle}>
              Discussion ({article.comments?.length || 0})
            </Text>
            {article.comments?.map((c, i) => (
              <View key={c._id || i} style={styles.commentItem}>
                <View style={styles.commentAvatar}>
                  <Text style={styles.commentAvatarText}>
                    {(c.userName || c.user?.name || 'U')[0].toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.commentHeader}>
                    {/* ✅ FIX : affiche userName ou user.name */}
                    <Text style={styles.commentUser}>
                      {c.userName || c.user?.name || 'Utilisateur'}
                    </Text>
                    <Text style={styles.commentDate}>
                      {new Date(c.createdAt).toLocaleDateString('fr-FR')}
                    </Text>
                  </View>
                  <Text style={styles.commentText}>{c.text}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>

        {/* BARRE COMMENTAIRE */}
        <View style={styles.bottomBar}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder={userToken ? "Participer à la discussion..." : "Connectez-vous pour commenter"}
              placeholderTextColor="#475569"
              value={commentText}
              onChangeText={setCommentText}
              editable={!!userToken}
              multiline
              maxLength={2000}
            />
            <TouchableOpacity
              onPress={handleSendComment}
              disabled={isSending || !commentText.trim()}
              style={[styles.sendBtn, commentText.trim() && styles.sendBtnActive]}
            >
              {isSending
                ? <ActivityIndicator size="small" color={COLORS.primary} />
                : <Send color={commentText.trim() ? COLORS.primary : '#334155'} size={20} />
              }
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: '#020617' },
  loader:        { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#020617' },

  header:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10 },
  iconBtn:       { padding: 10, backgroundColor: '#0F172A', borderRadius: 12, borderWidth: 1, borderColor: '#1E293B' },
  headerStats:   { flexDirection: 'row', gap: 10 },
  statPill:      { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#0F172A', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  statText:      { color: '#64748B', fontSize: 11, fontWeight: '700' },

  content:       { padding: 20 },
  categoryBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.primary + '15', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10, marginBottom: 14 },
  categoryText:  { color: COLORS.primary, fontSize: 11, fontWeight: '900', textTransform: 'uppercase' },
  title:         { fontSize: 24, fontWeight: '900', color: '#FFF', marginBottom: 20, lineHeight: 32 },

  authorCard:    { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0A0F1E', padding: 14, borderRadius: 18, borderWidth: 1, borderColor: '#1E293B', marginBottom: 16 },
  avatar:        { width: 44, height: 44, borderRadius: 14, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText:    { color: '#FFF', fontWeight: '900', fontSize: 18 },
  authorName:    { fontSize: 15, fontWeight: '800', color: '#F8FAFC' },
  authorRole:    { fontSize: 12, color: '#64748B', marginTop: 2 },

  metaRow:       { flexDirection: 'row', gap: 16, marginBottom: 20 },
  metaItem:      { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText:      { color: '#475569', fontSize: 12 },

  imageContainer:{ marginBottom: 24, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#1E293B' },
  articleImage:  { width: '100%', height: 230 },

  section:       { marginBottom: 28 },
  sectionLabel:  { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionDot:    { width: 4, height: 18, borderRadius: 2 },
  sectionTitle:  { fontSize: 11, fontWeight: '900', letterSpacing: 2, textTransform: 'uppercase' },
  sectionContent:{ fontSize: 15, color: '#CBD5E1', lineHeight: 26 },

  // Like
  likeSection:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0A0F1E', padding: 16, borderRadius: 20, marginBottom: 28, borderWidth: 1, borderColor: '#1E293B' },
  likeBtn:       { flexDirection: 'row', alignItems: 'center', gap: 10 },
  likeCount:     { color: '#64748B', fontSize: 14, fontWeight: '700' },
  shareBtn:      { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.primary + '15', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14 },
  shareBtnText:  { color: COLORS.primary, fontWeight: '800', fontSize: 13 },

  // Commentaires
  commentsSection: { borderTopWidth: 1, borderTopColor: '#1E293B', paddingTop: 24 },
  discussionTitle: { fontSize: 16, fontWeight: '800', color: '#FFF', marginBottom: 16 },
  commentItem:     { flexDirection: 'row', gap: 12, marginBottom: 16 },
  commentAvatar:   { width: 36, height: 36, borderRadius: 11, backgroundColor: '#1E293B', justifyContent: 'center', alignItems: 'center' },
  commentAvatarText:{ color: COLORS.primary, fontWeight: '900', fontSize: 14 },
  commentHeader:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  commentUser:     { color: COLORS.primary, fontWeight: '700', fontSize: 13 },
  commentDate:     { color: '#334155', fontSize: 11 },
  commentText:     { color: '#CBD5E1', fontSize: 14, lineHeight: 20 },

  // Bottom bar
  bottomBar:     { padding: 14, borderTopWidth: 1, borderTopColor: '#1E293B', backgroundColor: '#020617', paddingBottom: Platform.OS === 'ios' ? 28 : 14 },
  inputWrapper:  { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F172A', borderRadius: 18, paddingHorizontal: 14, minHeight: 50, borderWidth: 1, borderColor: '#1E293B' },
  textInput:     { flex: 1, fontSize: 14, color: '#FFF', paddingVertical: 10 },
  sendBtn:       { padding: 8, borderRadius: 10 },
  sendBtnActive: { backgroundColor: COLORS.primary + '20' },
});