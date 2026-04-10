import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { COLORS, SPACING } from '../theme/theme';
import { Heart, MessageCircle, Share2, User } from 'lucide-react-native';

export default function ArticleCard({ article }) {
  // On récupère l'URL de l'image (Cloudinary) ou une image par défaut
  const imageSource = article.imageUrl ? { uri: article.imageUrl } : null;

  return (
    <View style={styles.card}>
      {/* Header : Auteur & Catégorie */}
      <View style={styles.cardHeader}>
        <View style={styles.authorInfo}>
          <View style={styles.avatarSmall}>
            <Text style={styles.avatarText}>{article.author?.name[0].toUpperCase()}</Text>
          </View>
          <View>
            <Text style={styles.authorName}>{article.author?.name}</Text>
            <Text style={styles.authorSpecialty}>{article.author?.specialty}</Text>
          </View>
        </View>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{article.category}</Text>
        </View>
      </View>

      {/* Contenu : Titre & Image */}
      <Text style={styles.title}>{article.title}</Text>
      
      {imageSource && (
        <Image source={imageSource} style={styles.articleImage} />
      )}

      <Text style={styles.intro} numberOfLines={3}>
        {article.intro}
      </Text>

      {/* Footer : Interactions */}
      <View style={styles.cardFooter}>
        <TouchableOpacity style={styles.interactionBtn}>
          <Heart size={20} color={COLORS.textSecondary} />
          <Text style={styles.interactionText}>{article.likes?.length || 0}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.interactionBtn}>
          <MessageCircle size={20} color={COLORS.textSecondary} />
          <Text style={styles.interactionText}>Commenter</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.interactionBtn}>
          <Share2 size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFF', marginHorizontal: SPACING.m, marginVertical: 10, borderRadius: 20, padding: 15, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  authorInfo: { flexDirection: 'row', alignItems: 'center' },
  avatarSmall: { width: 35, height: 35, borderRadius: 17.5, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  avatarText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  authorName: { fontSize: 14, fontWeight: 'bold', color: COLORS.textPrimary },
  authorSpecialty: { fontSize: 11, color: COLORS.textSecondary },
  categoryBadge: { backgroundColor: '#F0F4FF', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 10 },
  categoryText: { color: COLORS.primary, fontSize: 11, fontWeight: 'bold' },
  title: { fontSize: 18, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 10 },
  articleImage: { width: '100%', height: 180, borderRadius: 15, marginBottom: 10 },
  intro: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 20 },
  cardFooter: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#F5F5F5', marginTop: 15, paddingTop: 10, justifyContent: 'space-between' },
  interactionBtn: { flexDirection: 'row', alignItems: 'center' },
  interactionText: { marginLeft: 5, fontSize: 13, color: COLORS.textSecondary }
});