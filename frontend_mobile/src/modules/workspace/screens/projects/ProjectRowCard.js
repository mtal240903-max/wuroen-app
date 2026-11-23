import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';

const ProjectRowCard = ({ title, desc, progress, statusColor, imageUrl, members, companyLogo, userAvatar, onPress }) => (
  <TouchableOpacity activeOpacity={0.9} style={styles.projectCard} onPress={onPress}>
    <View style={styles.imageContainer}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.projectImg} />
      ) : (
        <View style={[styles.projectImg, { backgroundColor: '#1E293B', justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ color: '#313264', fontWeight: 'bold' }}>W</Text>
        </View>
      )}

      {companyLogo ? (
        <Image source={{ uri: companyLogo }} style={styles.badgeOverlay} />
      ) : userAvatar ? (
        <Image source={{ uri: userAvatar }} style={styles.badgeOverlay} />
      ) : null}
    </View>

    <View style={styles.projectInfo}>
      <View style={styles.projectHeaderRow}>
        <Text style={styles.projectTitle} numberOfLines={1}>{title}</Text>
        <View style={[styles.statusDot, { backgroundColor: statusColor || '#10B981' }]} />
      </View>
      <Text style={styles.projectDesc} numberOfLines={1}>{desc}</Text>
      
      <View style={styles.projectFooter}>
        <View style={styles.avatarStack}>
          {members && members.length > 0 ? (
            members.map((mbr, i) => (
              <Image key={i} source={{ uri: mbr }} style={[styles.stackAvatar, { marginLeft: i > 0 ? -8 : 0 }]} />
            ))
          ) : (
            <View style={styles.stackOverplus}>
              <Text style={styles.overplusText}>Moi</Text>
            </View>
          )}
        </View>
        
        <View style={styles.progressData}>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress || 0}%` }]} />
          </View>
          <Text style={styles.progressPercent}>{progress || 0}%</Text>
        </View>
      </View>
    </View>
  </TouchableOpacity>
);


const styles = StyleSheet.create({
  projectCard: { flexDirection: 'row', backgroundColor: '#111726', borderRadius: 18, padding: 12, marginBottom: 14, borderWidth: 1, borderColor: '#1E293B', alignItems: 'center' },
  imageContainer: { position: 'relative' },
  projectImg: { width: 70, height: 70, borderRadius: 14, resizeMode: 'cover' },
  badgeOverlay: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#111726',
    resizeMode: 'cover',
    backgroundColor: '#334155'
  },
  projectInfo: { flex: 1, marginLeft: 14, justifyContent: 'center' },
  projectHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  projectTitle: { fontSize: 15, fontWeight: '700', color: '#FFF', maxWidth: '85%' },
  statusDot: { width: 7, height: 7, borderRadius: 3.5 },
  projectDesc: { fontSize: 12, color: '#64748B', marginTop: 3 },
  projectFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  avatarStack: { flexDirection: 'row', alignItems: 'center' },
  stackAvatar: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: '#111726' },
  stackOverplus: { paddingHorizontal: 8, height: 20, borderRadius: 10, backgroundColor: '#1E293B', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  overplusText: { color: '#94A3B8', fontSize: 9, fontWeight: '700' },
  progressData: { flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'flex-end' },
  progressBarBg: { width: 70, height: 4, backgroundColor: '#1E293B', borderRadius: 2, marginRight: 8 },
  progressBarFill: { height: '100%', backgroundColor: '#4F46E5', borderRadius: 2 },
  progressPercent: { fontSize: 11, fontWeight: '700', color: '#94A3B8', width: 28, textAlign: 'right' },
});