import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, PanResponder, Dimensions } from 'react-native';
import { Home, BookOpen, MessageSquare, User, Wrench, Briefcase, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../theme/theme';
import { navigationRef } from '../navigation/RootNavigation';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BUTTON_SIZE = 66;
const MARGIN_SIDE = 20;

export default function FloatingMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLeftSide, setIsLeftSide] = useState(false);
  const [animation] = useState(new Animated.Value(0));
  
  const initialX = SCREEN_WIDTH - BUTTON_SIZE - MARGIN_SIDE;
  const initialY = SCREEN_HEIGHT * 0.4;

  const pan = useRef(new Animated.ValueXY({ x: initialX, y: initialY })).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: () => {
        pan.setOffset({
          x: pan.x._value,
          y: pan.y._value,
        });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (e, gestureState) => {
        pan.flattenOffset();
        
        const currentX = pan.x._value;
        const currentY = pan.y._value;

        const boundedY = Math.max(50, Math.min(SCREEN_HEIGHT - 100, currentY));
        const screenMiddle = SCREEN_WIDTH / 2;
        const targetX = currentX < screenMiddle ? MARGIN_SIDE : SCREEN_WIDTH - BUTTON_SIZE - MARGIN_SIDE;

        setIsLeftSide(currentX < screenMiddle);

        Animated.spring(pan, {
          toValue: { x: targetX, y: boundedY },
          friction: 7,
          tension: 40,
          useNativeDriver: false,
        }).start();
      },
    })
  ).current;

  const toggleMenu = () => {
    const toValue = isOpen ? 0 : 1;
    Animated.spring(animation, {
      toValue,
      friction: 6,
      tension: 70,
      useNativeDriver: true,
    }).start();
    setIsOpen(!isOpen);
  };

  const bubbleStyle = {
    transform: [
      {
        scale: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.15],
        }),
      },
      {
        rotate: animation.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '180deg'],
        }),
      },
    ],
  };

  const menuAnimStyle = {
    opacity: animation,
    transform: [
      {
        scale: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0.8, 1],
        }),
      },
    ],
  };

  const menuPositionStyle = isLeftSide ? { left: 0 } : { right: 0 };

  return (
    <View style={styles.mainWrapper} pointerEvents="box-none">
      {isOpen && (
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1} 
          onPress={toggleMenu} 
        />
      )}

      <Animated.View 
        style={[
          styles.draggableContainer, 
          {
            transform: [
              { translateX: pan.x },
              { translateY: pan.y }
            ]
          }
        ]} 
        {...panResponder.panHandlers}
      >
        {isOpen && (
          <Animated.View style={[styles.radialContainer, menuPositionStyle, menuAnimStyle]} pointerEvents="box-none">
            
            <TouchableOpacity 
              style={[styles.menuItem, styles.workspaceFeatured, isLeftSide ? { left: 40 } : { right: 40 }]} 
              activeOpacity={0.85}
              onPress={() => { toggleMenu(); navigationRef.navigate('Workspace'); }}
            >
              <LinearGradient
                colors={[COLORS.primary, '#0284C7']}
                style={styles.workspaceGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.featuredIconCircle}>
                  <Briefcase color="#FFFFFF" size={20} />
                </View>
                <View>
                  <Text style={styles.featuredTitle}>Workspace</Text>
                  <Text style={styles.featuredSubtitle}>Espace Principal</Text>
                </View>
                <Sparkles color="#FEF08A" size={16} style={styles.sparkleIcon} />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.menuItem, styles.item1, isLeftSide ? { left: 130 } : { right: 130 }]} onPress={() => { toggleMenu(); navigationRef.navigate('Home'); }}>
              <View style={[styles.iconCircle, { borderColor: '#22C55E' }]}><Home color="#22C55E" size={16} /></View>
              <Text style={styles.menuText}>Accueil</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.menuItem, styles.item2, isLeftSide ? { left: 155 } : { right: 155 }]} onPress={() => { toggleMenu(); navigationRef.navigate('Outils'); }}>
              <View style={[styles.iconCircle, { borderColor: '#3B82F6' }]}><Wrench color="#3B82F6" size={16} /></View>
              <Text style={styles.menuText}>Outils</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.menuItem, styles.item3, isLeftSide ? { left: 155 } : { right: 155 }]} onPress={() => { toggleMenu(); navigationRef.navigate('Library'); }}>
              <View style={[styles.iconCircle, { borderColor: '#F59E0B' }]}><BookOpen color="#F59E0B" size={16} /></View>
              <Text style={styles.menuText}>Bibliothèque</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.menuItem, styles.item4, isLeftSide ? { left: 130 } : { right: 130 }]} onPress={() => { toggleMenu(); navigationRef.navigate('Messages'); }}>
              <View style={[styles.iconCircle, { borderColor: '#A855F7' }]}><MessageSquare color="#A855F7" size={16} /></View>
              <Text style={styles.menuText}>Messages</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.menuItem, styles.item5, isLeftSide ? { left: 80 } : { right: 80 }]} onPress={() => { toggleMenu(); navigationRef.navigate('Profil'); }}>
              <View style={[styles.iconCircle, { borderColor: '#00F0FF' }]}><User color="#00F0FF" size={16} /></View>
              <Text style={styles.menuText}>Profil</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        <Animated.View style={[styles.fabContainer, bubbleStyle]}>
          <TouchableOpacity style={styles.fab} onPress={toggleMenu} activeOpacity={0.9}>
            <LinearGradient colors={[COLORS.primary, '#0F172A']} style={styles.fabGradient}>
              <Briefcase color="#FFFFFF" size={28} />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainWrapper: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(2, 6, 23, 0.8)',
  },
  draggableContainer: {
    position: 'absolute',
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    zIndex: 1000,
  },
  fabContainer: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: '#0F172A',
    borderWidth: 2,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 18,
    elevation: 15,
    overflow: 'hidden',
  },
  fab: {
    width: '100%',
    height: '100%',
  },
  fabGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radialContainer: {
    position: 'absolute',
    top: -180,
    width: 280,
    height: 400,
  },
  menuItem: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
  },
  workspaceFeatured: {
    top: -10,
    paddingVertical: 0,
    paddingHorizontal: 0,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#38BDF8',
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 12,
  },
  workspaceGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    width: 195,
  },
  featuredIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  featuredTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '800', letterSpacing: 0.4 },
  featuredSubtitle: { color: '#E0F2FE', fontSize: 10, fontWeight: '600' },
  sparkleIcon: { position: 'absolute', top: 8, right: 10 },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  menuText: { color: '#F8FAFC', fontSize: 12, fontWeight: '700', letterSpacing: 0.3 },
  item1: { top: 65 },
  item2: { top: 125 },
  item3: { top: 185 },
  item4: { top: 245 },
  item5: { top: 305 },
});