import React, { useState, useCallback, useContext } from 'react'; 
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  ActivityIndicator, 
  RefreshControl,
  TextInput,
  Share,
  Alert,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native'; 
import axios from 'axios';

// Imports thèmes et icônes
import { COLORS, SPACING } from '../../theme/theme';
import { Heart, MessageCircle, Share2, Plus, Search, X } from 'lucide-react-native';

// Import du contexte d'authentification
import { AuthContext } from '../../context/AuthContext';

// --- Composant Carte d'Article (Mémoïsé) ---
const ArticleCard = React.memo(({ item, onPress, onLike, onShare, onAuthorPress, currentUserId }) => {
  const imageUrl = item.image || item.imageUrl;
  const hasImage = imageUrl && imageUrl.trim() !== "";
  const isLiked = item.likes?.includes(currentUserId); 

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={onPress}>
      <View style={styles.cardHeader}>
        <TouchableOpacity 
          style={styles.authorRow} 
          onPress={() => onAuthorPress(item.author?._id)}
          activeOpacity={0.7}
        >
          <View style={styles.miniAvatar}>
             <Text style={styles.avatarLetter}>
               {item.author?.name ? item.author.name[0].toUpperCase() : 'S'}
             </Text>
          </View>
          <View>
            <Text style={styles.authorName}>{item.author?.name || 'Chercheur'}</Text>
            <Text style={styles.authorSpec}>{item.author?.specialty || 'Scientifique'}</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.category}</Text>
        </View>
      </View>

      <Text style={styles.title}>{item.title}</Text>
      
      {hasImage && (
        <Image 
          source={{ uri: imageUrl }} 
          style={styles.articleImage} 
          resizeMode="cover"
        />
      )}
      
      <Text style={styles.summary} numberOfLines={3}>{item.intro}</Text>

      <View style={styles.divider} />

      <View style={styles.cardFooter}>
        <TouchableOpacity style={styles.statGroup} onPress={() => onLike(item._id)}>
          <Heart 
            size={20} 
            color={isLiked ? "#FF4444" : COLORS.textSecondary} 
            fill={isLiked ? "#FF4444" : "transparent"} 
          />
          <Text style={[styles.statText, isLiked && { color: "#FF4444" }]}>
            {item.likes?.length || 0}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.statGroup} onPress={onPress}>
          <MessageCircle size={20} color={COLORS.textSecondary} />
          <Text style={styles.statText}>{item.comments?.length || 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => onShare(item)}>
          <Share2 size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
});

// --- Composant Principal ---
export default function HomeScreen({ navigation }) {
  const { userToken, user } = useContext(AuthContext);
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const API_URL = 'http://192.168.115.239:5000/api/articles';

  const fetchArticles = async () => {
    try {
      const response = await axios.get(API_URL);
      setArticles(response.data);
      setFilteredArticles(response.data);
    } catch (error) {
      console.error("Erreur Fetch Articles:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchArticles();
    }, [])
  );

  // LOGIQUE DE NAVIGATION CORRIGÉE
  const handleAuthorPress = useCallback((authorId) => {
    if (!authorId) return;
    
    if (authorId === user?._id) {
      // On navigue vers l'onglet nommé "Profil" dans AppNavigator
      navigation.navigate('Profil'); 
    } else {
      // On navigue vers l'écran de profil public
      navigation.navigate('UserProfile', { userId: authorId });
    }
  }, [user?._id, navigation]);

  const handleLike = async (id) => {
    if (!userToken) {
      Alert.alert("Connexion requise", "Veuillez vous connecter pour liker.");
      return;
    }
    try {
      const response = await axios.post(
        `${API_URL}/${id}/like`,
        {},
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      const updatedArticles = articles.map(art => art._id === id ? response.data : art);
      setArticles(updatedArticles);
      setFilteredArticles(updatedArticles);
    } catch (error) {
      console.error("Erreur Like:", error);
    }
  };

  const handleShare = async (article) => {
    try {
      const result = await Share.share({
        title: article.title,
        message: `Découvrez cet article sur Wuro’en : ${article.title}`,
      });
      if (result.action === Share.sharedAction) {
        await axios.post(`${API_URL}/${article._id}/share`);
      }
    } catch (error) {
      console.error("Erreur Partage:", error);
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    const filtered = articles.filter(art => 
      art.title.toLowerCase().includes(text.toLowerCase()) ||
      art.category.toLowerCase().includes(text.toLowerCase()) ||
      art.author?.name?.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredArticles(filtered);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setSearchQuery('');
    fetchArticles();
  }, []);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <Text style={styles.welcome}>Flux Wuro’en</Text>
        <View style={styles.searchContainer}>
          <Search color={COLORS.textSecondary} size={20} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un article..."
            placeholderTextColor={COLORS.textSecondary}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <X color={COLORS.textSecondary} size={20} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <FlatList
        data={filteredArticles}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <ArticleCard 
            item={item} 
            onPress={() => navigation.navigate('ArticleDetail', { article: item })}
            onLike={handleLike}
            onShare={handleShare}
            onAuthorPress={handleAuthorPress}
            currentUserId={user?._id}
          />
        )}
        contentContainerStyle={styles.listPadding}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucun article trouvé.</Text>
          </View>
        }
      />

      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => navigation.navigate('CreateArticle')}
      >
        <Plus color="#FFF" size={30} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FE' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  topBar: { paddingBottom: SPACING.m, paddingHorizontal: SPACING.m, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  welcome: { fontSize: 22, fontWeight: 'bold', color: COLORS.textPrimary, marginVertical: 10 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F3F9', borderRadius: 12, paddingHorizontal: 12, height: 45 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 15, color: COLORS.textPrimary },
  listPadding: { padding: SPACING.m, paddingBottom: 100 },
  card: { backgroundColor: '#FFF', borderRadius: 15, padding: SPACING.m, marginBottom: SPACING.m, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  authorRow: { flexDirection: 'row', alignItems: 'center' },
  miniAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  avatarLetter: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
  authorName: { fontSize: 14, fontWeight: 'bold', color: COLORS.textPrimary },
  authorSpec: { fontSize: 11, color: COLORS.textSecondary },
  badge: { backgroundColor: '#E0E7FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { color: COLORS.primary, fontSize: 11, fontWeight: 'bold' },
  title: { fontSize: 18, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 10 },
  articleImage: { width: '100%', height: 200, borderRadius: 12, marginBottom: 12 },
  summary: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 20 },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 15 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statGroup: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statText: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '500' },
  fab: { position: 'absolute', bottom: 25, right: 25, backgroundColor: COLORS.primary, width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 8 },
  emptyContainer: { alignItems: 'center', marginTop: 50 },
  emptyText: { color: COLORS.textSecondary, fontSize: 16 }
});