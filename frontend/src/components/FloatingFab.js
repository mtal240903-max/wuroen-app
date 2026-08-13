import React, { useRef } from 'react';
import { StyleSheet, TouchableOpacity, Animated, PanResponder } from 'react-native';
import { Plus } from 'lucide-react-native';
import { COLORS } from '../theme/theme';

export default function FloatingFab({ onPress }) {
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: () => {
        pan.flattenOffset();
      },
      onPanResponderGrant: () => {
        pan.setOffset({
          x: pan.x._value,
          y: pan.y._value
        });
        pan.setValue({ x: 0, y: 0 });
      }
    })
  ).current;

  return (
    <Animated.View
      style={[
        styles.fabContainer,
        {
          transform: [
            { translateX: pan.x },
            { translateY: pan.y }
          ]
        }
      ]}
      {...panResponder.panHandlers}
    >
      <TouchableOpacity style={styles.fab} onPress={onPress} activeOpacity={0.8}>
        <Plus color="#FFF" size={28} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fabContainer: { position: 'absolute', bottom: 90, right: 25, zIndex: 999 },
  fab: { backgroundColor: COLORS.primary, width: 60, height: 60, borderRadius: 18, justifyContent: 'center', alignItems: 'center', elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4 }
});