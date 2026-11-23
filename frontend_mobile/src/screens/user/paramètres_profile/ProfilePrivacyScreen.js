import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Shield, EyeOff, Eye, Lock } from 'lucide-react-native';
import { COLORS } from '../../../theme/theme';

// ✅ FIX : api au lieu de AsyncStorage seulement — persistance en base
import api from '../../../services/api';

export default function ProfilePrivacyScreen({ navigation }) {
  const [isPrivate,    setIsPrivate]    = useState(false);
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);

  // ─── Charger depuis le backend (source de vérité) ────────
  useEffect(() => {
    const fetchPrivacy = async () => {
      try {
        const res = await api.get('/users/me/profile');
        setIsPrivate(res.data?.isPrivate ?? false);
      } catch (err) {
        console.error("ProfilePrivacy load:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPrivacy();
  }, []);

  // ─── Sauvegarder en base ──────────────────────────────────
  const handleTogglePrivacy = async (newValue) => {
    setIsPrivate(newValue);
    setSaving(true);
    try {
      // ✅ FIX : PATCH /users/privacy persiste en base
      await api.patch('/users/privacy', { isPrivate: newValue });
    } catch (err) {
      // Revenir à l'ancienne valeur si échec
      setIsPrivate(!newValue);
      Alert.alert("Erreur", "Impossible de sauvegarder la préférence.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <View style={styles.loader}>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={22} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confidentialité</Text>
        {saving && <ActivityIndicator size="small" color={COLORS.primary} style={{ marginLeft: 'auto' }} />}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Shield size={16} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Visibilité du profil</Text>
          </View>

          {/* Profil privé */}
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={styles.iconBox}>
                {isPrivate ? <Lock size={16} color="#F59E0B" /> : <Eye size={16} color="#10B981" />}
              </View>
              <View>
                <Text style={styles.settingLabel}>{isPrivate ? "Profil privé" : "Profil public"}</Text>
                <Text style={styles.settingDesc}>
                  {isPrivate
                    ? "Seuls vos collaborateurs voient votre contenu"
                    : "Tout le monde peut voir votre profil"}
                </Text>
              </View>
            </View>
            <Switch
              value={isPrivate}
              onValueChange={handleTogglePrivacy}
              trackColor={{ false: "#1E293B", true: COLORS.primary + '80' }}
              thumbColor={isPrivate ? COLORS.primary : "#64748B"}
              disabled={saving}
            />
          </View>
        </View>

        {/* Info sécurité */}
        <View style={styles.infoCard}>
          <EyeOff size={16} color="#64748B" />
          <Text style={styles.infoText}>
            En mode privé, votre profil et vos publications ne sont visibles que par vos collaborateurs approuvés. Les admins et modérateurs conservent un accès pour la sécurité de la plateforme.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#020617' },
  loader:       { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#020617' },
  header:       { flexDirection: 'row', alignItems: 'center', padding: 20, gap: 16, borderBottomWidth: 1, borderBottomColor: '#1E293B' },
  backBtn:      { width: 38, height: 38, backgroundColor: '#1E293B', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  headerTitle:  { color: '#FFF', fontSize: 18, fontWeight: '800' },
  scroll:       { padding: 20, gap: 16 },
  section:      { backgroundColor: '#0A0F1E', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#1E293B' },
  sectionHeader:{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  sectionTitle: { color: '#FFF', fontSize: 15, fontWeight: '800' },
  settingRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  settingLeft:  { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  iconBox:      { width: 36, height: 36, backgroundColor: '#1E293B', borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
  settingLabel: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  settingDesc:  { color: '#475569', fontSize: 12, marginTop: 2, maxWidth: 200 },
  infoCard:     { backgroundColor: '#0A0F1E', borderRadius: 20, padding: 16, flexDirection: 'row', gap: 12, borderWidth: 1, borderColor: '#1E293B' },
  infoText:     { color: '#475569', fontSize: 12, lineHeight: 18, flex: 1 },
});