import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export const StatCard = React.memo(({ icon: Icon, label, value, subLabel, progress, color, onPress }) => (
  <View style={[styles.statCard, { borderColor: '#1E293B' }]}>
    <View style={styles.statCardHeader}>
      <View style={[styles.statIconWrapper, { backgroundColor: color + '15' }]}>
        <Icon size={20} color={color} />
      </View>
      <View style={styles.statMeta}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </View>
    {progress !== undefined ? (
      <View style={styles.progressContainer}>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progress}%`, backgroundColor: color }]} />
        </View>
      </View>
    ) : (
      <TouchableOpacity style={styles.statLinkBtn} onPress={onPress}>
        <Text style={[styles.statLinkText, { color }]}>{subLabel}</Text>
        <Text style={[styles.statLinkArrow, { color }]}> →</Text>
      </TouchableOpacity>
    )}
  </View>
));

const styles = StyleSheet.create({
  statCard: {
    backgroundColor: '#111726',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    flex: 1,
    minWidth: '47%',
    marginBottom: 16,
  },
  statCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statMeta: {
    flex: 1,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#1E293B',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  statLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  statLinkText: {
    fontSize: 12,
    fontWeight: '500',
  },
  statLinkArrow: {
    fontSize: 12,
    fontWeight: '500',
  },
});