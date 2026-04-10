import React, { useState, useEffect, useContext } from 'react'; 
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  TextInput, 
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Share 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING } from '../../theme/theme';
import { ArrowLeft, Share2, Bookmark, Send } from 'lucide-react-native';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const Section = ({ title, content }) => (
  content ? (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionContent}>{content}</Text>
    </View>
  ) : null
);

export default function ArticleDetailScreen({ navigation, route }) {
  const { article: initialArticle } = route.params;
  const { userToken, user } = useContext(AuthContext);
  
  const [article, setArticle] = useState(initialArticle);
  const [commentText, setCommentText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // --- LOGIQUE COMPTEUR DE VUES ---
  useEffect(() => {
    const incrementView = async () => {
      try {
        // Appel de la nouvelle route PUT pour les vues
        await axios.put(`http://192.168.115.239:5000/api/articles/view/${article._id}`);
      } catch (error) {
        console.error("Erreur lors de l'incrémentation de la vue:", error);
      }
    };

    if (article?._id) {
      incrementView();
    }
  }, []); // [] signifie que cela ne s'exécute qu'une fois à l'ouverture

  // --- LOGIQUE NAVIGATION AUTEUR ---
  const handleAuthorPress = () => {
    const authorId = article.author?._id;
    if (!authorId) return;

    if (authorId === user?._id) {
      navigation.navigate('Main', { screen: 'Profil' });
    } else {
      navigation.navigate('UserProfile', { userId: authorId });
    }
  };

  // --- LOGIQUE PARTAGE ---
  const handleShare = async () => {
    try {
      const result = await Share.share({
        title: article.title,
        message: `Wuro’en | Découvrez cette recherche : ${article.title}\n\n${article.intro}`,
      });

      if (result.action === Share.sharedAction) {
        // On incrémente le partage en base de données seulement si le partage est validé
        await axios.post(`http://192.168.115.239:5000/api/articles/${article._id}/share`);
      }
    } catch (error) {
      console.error("Erreur partage:", error);
    }
  };

  // --- LOGIQUE FAVORIS ---
  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    Alert.alert(
      isBookmarked ? "Retiré" : "Enregistré", 
      isBookmarked ? "L'article a été retiré de vos favoris." : "Article ajouté à votre bibliothèque scientifique."
    );
  };

  // --- ENVOI DE COMMENTAIRE ---
  const handleSendComment = async () => {
    if (!commentText.trim()) return;
    if (!userToken) {
      Alert.alert("Attention", "Vous devez être connecté pour commenter.");
      return;
    }

    setIsSending(true);
    try {
      const response = await axios.post(
        `http://192.168.115.239:5000/api/articles/${article._id}/comments`, 
        { text: commentText },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      
      setArticle(response.data);
      setCommentText('');
      Alert.alert("Succès", "Votre commentaire a été publié.");
    } catch (error) {
      console.error("Erreur envoi commentaire:", error);
      Alert.alert("Erreur", "Impossible d'envoyer le commentaire.");
    } finally {
      setIsSending(false);
    }
  };

  if (!article) return <ActivityIndicator style={{ flex: 1 }} color={COLORS.primary} />;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <ArrowLeft color={COLORS.textPrimary} size={24} />
        </TouchableOpacity>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconBtn} onPress={handleBookmark}>
            <Bookmark 
              color={isBookmarked ? COLORS.primary : COLORS.textPrimary} 
              fill={isBookmarked ? COLORS.primary : "transparent"} 
              size={22} 
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={handleShare}>
            <Share2 color={COLORS.textPrimary} size={22} />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <Text style={styles.title}>{article.title}</Text>
          
          <TouchableOpacity 
            style={styles.authorCard} 
            onPress={handleAuthorPress}
            activeOpacity={0.7}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {article.author?.name ? article.author.name[0].toUpperCase() : "S"}
              </Text>
            </View>
            <View>
              <Text style={styles.authorName}>{article.author?.name || "Chercheur Wuro'en"}</Text>
              <Text style={styles.authorRole}>{article.category || "Scientifique"}</Text>
            </View>
          </TouchableOpacity>

          {(article.image || article.imageUrl) && (
            <View style={styles.imageContainer}>
              <Image source={{ uri: article.image || article.imageUrl }} style={styles.articleImage} />
            </View>
          )}

          <Section title="Introduction" content={article.intro} />
          <Section title="Méthodologie" content={article.methodo} />
          <Section title="Résultats" content={article.results} />

          <View style={styles.commentsHeader}>
              <Text style={styles.sectionTitle}>Discussion ({article.comments?.length || 0})</Text>
          </View>
          
          {article.comments?.map((c, index) => (
            <View key={index} style={styles.commentItem}>
              <Text style={styles.commentUser}>{c.userName || "Utilisateur"}</Text>
              <Text style={styles.commentText}>{c.text}</Text>
              <Text style={styles.commentDate}>{new Date(c.createdAt).toLocaleDateString()}</Text>
            </View>
          ))}

          <View style={{ height: 100 }} />
        </ScrollView>

        <View style={styles.bottomBar}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder={userToken ? "Ajouter un commentaire..." : "Connectez-vous pour commenter"}
              placeholderTextColor={COLORS.textSecondary}
              value={commentText}
              onChangeText={setCommentText}
              editable={!!userToken}
              multiline
            />
            <TouchableOpacity 
              onPress={handleSendComment} 
              disabled={isSending || !commentText.trim()}
              style={styles.sendBtn}
            >
              {isSending ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <Send color={commentText.trim() ? COLORS.primary : COLORS.textSecondary} size={22} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: SPACING.m, paddingVertical: 10, alignItems: 'center' },
  headerActions: { flexDirection: 'row', gap: 15 },
  iconBtn: { padding: 8 },
  content: { padding: SPACING.l },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 20 },
  authorCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 20,
    backgroundColor: '#F8F9FE',
    padding: 10,
    borderRadius: 12
  },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { color: '#FFF', fontWeight: 'bold' },
  authorName: { fontSize: 16, fontWeight: '700' },
  authorRole: { fontSize: 13, color: COLORS.textSecondary },
  imageContainer: { marginBottom: 25, borderRadius: 15, overflow: 'hidden' },
  articleImage: { width: '100%', height: 220, borderRadius: 12 },
  section: { marginBottom: 25 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 10 },
  sectionContent: { fontSize: 15, color: '#444', lineHeight: 24 },
  commentsHeader: { marginTop: 20, borderTopWidth: 1, borderTopColor: '#EEE', paddingTop: 20 },
  commentItem: { backgroundColor: '#F8F9FE', padding: 12, borderRadius: 10, marginBottom: 10 },
  commentUser: { fontWeight: 'bold', fontSize: 13, marginBottom: 4, color: COLORS.primary },
  commentText: { fontSize: 14, color: '#333' },
  commentDate: { fontSize: 10, color: COLORS.textSecondary, marginTop: 5, textAlign: 'right' },
  bottomBar: { padding: 12, borderTopWidth: 1, borderTopColor: '#EEE', backgroundColor: '#FFF' },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F3F9', borderRadius: 25, paddingHorizontal: 15, minHeight: 50 },
  textInput: { flex: 1, fontSize: 14, color: '#333', paddingVertical: 8 },
  sendBtn: { marginLeft: 10, padding: 5 }
});