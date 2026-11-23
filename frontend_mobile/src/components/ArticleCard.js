import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, Image, TouchableOpacity,
  Alert, Animated
} from 'react-native';
import { COLORS } from '../theme/theme';
import { Heart, MessageCircle, Share2, Image as ImageIcon } from 'lucide-react-native';
import { BASE_URL } from '../api/apiConfig';
import api from '../services/api';

const SERVER_BASE = BASE_URL.replace(/\/api$/, '');
const AVATAR_COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#f43f5e', '#10b981', '#f59e0b'];

export default function ArticleCard({ item, onPress, onAuthorPress, currentUserId, onLikeUpdate }) {
  if (!item) return null;

  // ─── Logique de couleur dynamique ────────────────────────
  const getAvatarColor = (id) => {
    if (!id) return AVATAR_COLORS[0];
    const index = id.charCodeAt(id.length - 1) % AVATAR_COLORS.length;
    return AVATAR_COLORS[index];
  };

  // ─── Logique d'URL (Article et Avatar) ────────────────────
  const getFullUrl = (path) => {
    if (!path) return null;
    return path.startsWith('http') ? path : `${SERVER_BASE}/${path.replace(/^\//, '')}`;
  };

  const imageUri = getFullUrl(item.imageUrl || item.image);
  const avatarUri = getFullUrl(item.author?.avatar);

  const authorName = item.author?.name || "Chercheur Wuro'en";
  const firstLetter = authorName[0]?.toUpperCase() || '?';
  const authorColor = getAvatarColor(item.author?._id);

  // ─── State & Logique Like ────────────────────────────────
  const [likes, setLikes] = useState(item.likes || []);
  const [liking, setLiking] = useState(false);
  const likeScale = useRef(new Animated.Value(1)).current;
  const isLiked = likes.some(id => id?.toString() === currentUserId?.toString());

  const handleLike = async () => {
    if (!currentUserId) return Alert.alert("Connexion requise", "Connectez-vous pour liker.");
    if (liking) return;

    Animated.sequence([
      Animated.spring(likeScale, { toValue: 1.35, useNativeDriver: true }),
      Animated.spring(likeScale, { toValue: 1, useNativeDriver: true }),
    ]).start();

    const previousLikes = [...likes];
    setLikes(prev => isLiked ? prev.filter(id => id?.toString() !== currentUserId?.toString()) : [...prev, currentUserId]);
    setLiking(true);

    try {
      await api.post(`/articles/${item._id}/like`);
      onLikeUpdate?.(item._id, !isLiked);
    } catch (err) {
      setLikes(previousLikes);
      Alert.alert("Erreur", "Impossible de mettre à jour le like.");
    } finally {
      setLiking(false);
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.cardHeader}>
        <TouchableOpacity style={styles.authorInfo} onPress={() => onAuthorPress?.(item.author?._id)}>
          <View style={[styles.avatarSmall, { 
            backgroundColor: avatarUri ? 'transparent' : authorColor + '30',
            borderColor: authorColor
          }]}>
            {avatarUri ? (
              <Image 
                source={{ uri: `${avatarUri}?t=${new Date().getTime()}` }} 
                style={styles.avatarImage} 
              />
            ) : (
              <Text style={[styles.avatarText, { color: authorColor }]}>{firstLetter}</Text>
            )}
          </View>
          <View>
            <Text style={styles.authorName}>{authorName}</Text>
            <Text style={styles.authorSpecialty}>{item.author?.specialty || 'Spécialiste'}</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{typeof item.category === 'object' ? item.category?.name : item.category || 'Général'}</Text>
        </View>
      </View>

      <Text style={styles.title}>{item.title}</Text>

      {imageUri ? (
        <Image 
          source={{ uri: imageUri }} 
          style={[styles.articleImage, { borderColor: authorColor }]} 
          resizeMode="cover" 
        />
      ) : (
        <View style={[styles.noImagePlaceholder, { borderColor: authorColor }]}>
          <ImageIcon size={36} color={authorColor} />
          <Text style={styles.noImageText}>Aucune illustration</Text>
        </View>
      )}

      <Text style={styles.intro} numberOfLines={3}>{item.intro || ''}</Text>

      <View style={styles.cardFooter}>
        <TouchableOpacity style={styles.interactionBtn} onPress={handleLike} disabled={liking}>
          <Animated.View style={{ transform: [{ scale: likeScale }] }}>
            <Heart size={20} color={isLiked ? '#F43F5E' : '#94A3B8'} fill={isLiked ? '#F43F5E' : 'transparent'} />
          </Animated.View>
          <Text style={[styles.interactionText, isLiked && { color: '#F43F5E' }]}>{likes.length}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.interactionBtn} onPress={onPress}>
          <MessageCircle size={20} color="#94A3B8" />
          <Text style={styles.interactionText}>{item.comments?.length || 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.interactionBtn}>
          <Share2 size={20} color="#94A3B8" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: 'rgba(30, 41, 59, 0.7)', marginHorizontal: 15, marginVertical: 8, borderRadius: 20, padding: 15, borderWidth: 1, borderColor: '#334155' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  authorInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatarSmall: { width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 10, overflow: 'hidden', borderWidth: 1.5 },
  avatarImage: { width: '100%', height: '100%' },
  avatarText: { fontWeight: '900', fontSize: 16 },
  authorName: { fontSize: 14, fontWeight: '700', color: '#F8FAFC' },
  authorSpecialty: { fontSize: 11, color: '#94A3B8', marginTop: 1 },
  categoryBadge: { backgroundColor: 'rgba(0,174,239,0.15)', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 10 },
  categoryText: { color: COLORS.primary, fontSize: 10, fontWeight: '800' },
  title: { fontSize: 17, fontWeight: '800', color: '#FFF', marginBottom: 10, lineHeight: 23 },
  articleImage: { width: '100%', height: 210, borderRadius: 14, marginBottom: 12, backgroundColor: '#1E293B', borderWidth: 1.5 },
  noImagePlaceholder: { width: '100%', height: 80, borderRadius: 14, backgroundColor: 'rgba(30, 41, 59, 0.5)', justifyContent: 'center', alignItems: 'center', marginBottom: 12, borderWidth: 1.5, borderStyle: 'dashed' },
  noImageText: { color: '#475569', fontSize: 11, marginTop: 6 },
  intro: { fontSize: 14, color: '#CBD5E1', lineHeight: 20 },
  cardFooter: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#334155', marginTop: 14, paddingTop: 12, justifyContent: 'space-around' },
  interactionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 8 },
  interactionText: { marginLeft: 4, fontSize: 13, color: '#94A3B8', fontWeight: '600' },
});