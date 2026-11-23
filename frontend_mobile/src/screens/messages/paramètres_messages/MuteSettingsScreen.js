import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, BellOff, BellRing, CheckCircle2 } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../../../theme/theme';

export default function MuteSettingsScreen({ navigation }) {
  const [isMuted, setIsMuted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedMute = await AsyncStorage.getItem('@global_mute');
        if (savedMute !== null) {
          setIsMuted(JSON.parse(savedMute));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const toggleMute = async (value) => {
    setIsMuted(value);
    await AsyncStorage.setItem('@global_mute', JSON.stringify(value));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Réglages alertes</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionLabel}>État du système</Text>
        
        {loading ? (
          <ActivityIndicator color={COLORS.primary} />
        ) : (
          <View style={styles.mainCard}>
            {/* ✅ Ligne Dynamique */}
            <View style={styles.statusRow}>
               <View style={[styles.iconBox, { backgroundColor: isMuted ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)' }]}>
                  {isMuted ? (
                    <BellOff size={24} color="#EF4444" />
                  ) : (
                    <BellRing size={24} color="#10B981" />
                  )}
               </View>
               
               <View style={styles.statusTexts}>
                  <Text style={[styles.statusTitle, { color: isMuted ? '#EF4444' : '#10B981' }]}>
                    {isMuted ? "Mode Silencieux" : "Notifications Actives"}
                  </Text>
                  <Text style={styles.statusSub}>
                    {isMuted ? "Alertes désactivées" : "Alertes en temps réel"}
                  </Text>
               </View>

               <Switch 
                value={isMuted} 
                onValueChange={toggleMute}
                trackColor={{ false: '#10B981', true: '#334155' }}
                thumbColor="#FFF"
              />
            </View>

            <View style={styles.divider} />

            {/* ✅ Explication claire */}
            <View style={styles.explanation}>
               <CheckCircle2 size={16} color={isMuted ? "#475569" : COLORS.primary} />
               <Text style={styles.explanationText}>
                  {isMuted 
                    ? "Appuyez sur le bouton vert pour réactiver les sons." 
                    : "Appuyez sur le bouton pour stopper les notifications."}
               </Text>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  backBtn: { padding: 8, backgroundColor: '#0F172A', borderRadius: 12, borderWidth: 1, borderColor: '#1E293B' },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  content: { padding: 20 },
  sectionLabel: { color: '#475569', fontSize: 11, fontWeight: '900', textTransform: 'uppercase', marginBottom: 15, letterSpacing: 1.2 },
  mainCard: { backgroundColor: '#0F172A', borderRadius: 25, padding: 20, borderWidth: 1, borderColor: '#1E293B' },
  statusRow: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 50, height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  statusTexts: { flex: 1, marginLeft: 15 },
  statusTitle: { fontSize: 17, fontWeight: '800' },
  statusSub: { color: '#64748B', fontSize: 13, marginTop: 2 },
  divider: { height: 1, backgroundColor: '#1E293B', marginVertical: 20 },
  explanation: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#020617', padding: 12, borderRadius: 12 },
  explanationText: { color: '#94A3B8', fontSize: 12, marginLeft: 10, flex: 1 }
});