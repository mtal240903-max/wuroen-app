import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { FolderKanban } from 'lucide-react-native';
// Remontez de 5 niveaux pour atteindre src/ (ajustez le nom du fichier de config si besoin)
import { BASE_URL } from '../../../../../../../src/api/apiConfig'; 

const SERVER_ORIGIN = BASE_URL.replace('/api', '');

const getFullImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('file://')) {
    return url;
  }
  return `${SERVER_ORIGIN}${url.startsWith('/') ? '' : '/'}${url}`;
};

export const ProjectRowCard = React.memo(({ 
  title, desc, progress, statusColor, imageUrl, members, companyLogo, userAvatar, onPress, level = 0 
}) => {
  const resolvedImageUrl = getFullImageUrl(imageUrl);
  const resolvedCompanyLogo = getFullImageUrl(companyLogo);
  const resolvedUserAvatar = getFullImageUrl(userAvatar);

  return (
    <View style={[{ marginLeft: level * 20 }]}>
      {level > 0 && <View style={styles.treeIndentationLine} />}
      <TouchableOpacity activeOpacity={0.9} style={[styles.projectCard, level > 0 && styles.subProjectCard]} onPress={onPress}>
        <View style={styles.imageContainer}>
          {resolvedImageUrl ? (
            <Image source={{ uri: resolvedImageUrl }} style={styles.projectImg} />
          ) : (
            <View style={[styles.projectImg, styles.fallbackImgBox]}>
              <FolderKanban size={24} color="#6366F1" />
            </View>
          )}
          {resolvedCompanyLogo ? (
            <Image source={{ uri: resolvedCompanyLogo }} style={styles.badgeOverlay} />
          ) : resolvedUserAvatar ? (
            <Image source={{ uri: resolvedUserAvatar }} style={styles.badgeOverlay} />
          ) : null}
        </View>
        <View style={styles.projectInfo}>
          <View style={styles.projectHeaderRow}>
            <Text style={styles.projectTitle} numberOfLines={1}>{level > 0 ? '└─ ' : ''}{title}</Text>
            <View style={[styles.statusDot, { backgroundColor: statusColor || '#10B981' }]} />
          </View>
          <Text style={styles.projectDesc} numberOfLines={1}>{desc || "Aucune description"}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  projectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111726',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  subProjectCard: {
    backgroundColor: '#0D1322',
  },
  treeIndentationLine: {
    position: 'absolute',
    left: -10,
    top: 0,
    bottom: 12,
    width: 2,
    backgroundColor: '#1E293B',
  },
  imageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  projectImg: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#1E293B',
  },
  fallbackImgBox: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeOverlay: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#111726',
  },
  projectInfo: {
    flex: 1,
  },
  projectHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  projectTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  projectDesc: {
    color: '#94A3B8',
    fontSize: 12,
  },
});