import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';

export const ActionButton = React.memo(({ icon: Icon, label, color, onPress }) => (
  <TouchableOpacity style={styles.actionBtn} onPress={onPress}>
    <View style={[styles.actionIconWrapper, { backgroundColor: color + '15' }]}>
      <Icon size={18} color={color} />
    </View>
    <Text style={styles.actionLabel} numberOfLines={1}>{label}</Text>
  </TouchableOpacity>
));

const styles = StyleSheet.create({
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#111726',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  actionIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  actionLabel: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
});