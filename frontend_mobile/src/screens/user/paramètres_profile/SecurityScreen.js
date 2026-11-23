import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ActivityIndicator, Alert, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Lock, ShieldCheck, Eye, EyeOff, Trash2 } from 'lucide-react-native';
import { COLORS } from '../../../theme/theme';

// ✅ FIX : api au lieu de fetch() — token injecté automatiquement
import api from '../../../services/api';

export default function SecurityScreen({ navigation }) {
  const [currentPassword,  setCurrentPassword]  = useState('');
  const [newPassword,      setNewPassword]      = useState('');
  const [confirmPassword,  setConfirmPassword]  = useState('');
  const [showCurrent,      setShowCurrent]      = useState(false);
  const [showNew,          setShowNew]          = useState(false);
  const [showConfirm,      setShowConfirm]      = useState(false);
  const [loading,          setLoading]          = useState(false);

  // ─── CHANGEMENT MOT DE PASSE ──────────────────────────────
  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      return Alert.alert("Erreur", "Veuillez remplir tous les champs.");
    }
    if (newPassword !== confirmPassword) {
      return Alert.alert("Erreur", "Les nouveaux mots de passe ne correspondent pas.");
    }
    if (newPassword.length < 8) {
      return Alert.alert("Erreur", "Le nouveau mot de passe doit contenir au moins 8 caractères.");
    }
    if (newPassword === currentPassword) {
      return Alert.alert("Erreur", "Le nouveau mot de passe doit être différent de l'ancien.");
    }

    setLoading(true);
    try {
      // ✅ FIX : api.post avec token automatique
      await api.post('/users/change-password', { currentPassword, newPassword, confirmPassword });
      Alert.alert("✅ Succès", "Votre mot de passe a été modifié avec succès.", [
        { text: "OK", onPress: () => {
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
          navigation.goBack();
        }}
      ]);
    } catch (err) {
      const msg = err.response?.data?.message || "Impossible de modifier le mot de passe.";
      Alert.alert("Erreur", msg);
    } finally {
      setLoading(false);
    }
  };

  // ─── SUPPRESSION COMPTE ───────────────────────────────────
  const handleDeleteAccount = () => {
    Alert.alert(
      "⚠️ Suppression définitive",
      "Cette action est irréversible. Toutes vos données, articles et collaborations seront effacés.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Continuer", style: "destructive",
          onPress: () => {
            // Demander le mot de passe pour confirmer
            Alert.prompt?.(
              "Confirmation",
              "Entrez votre mot de passe pour confirmer :",
              async (password) => {
                if (!password) return;
                try {
                  await api.delete('/users/delete-account', { data: { password } });
                  Alert.alert("Compte supprimé", "Vos données ont été effacées.");
                } catch (err) {
                  Alert.alert("Erreur", err.response?.data?.message || "Suppression impossible.");
                }
              },
              'secure-text'
            ) ?? Alert.alert("Info", "La suppression de compte est disponible sur iOS uniquement via cette interface. Sur Android, contactez le support.");
          }
        }
      ]
    );
  };

  const PasswordField = ({ label, value, onChange, show, onToggle }) => (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChange}
          secureTextEntry={!show}
          placeholder="••••••••"
          placeholderTextColor="#334155"
          autoCapitalize="none"
        />
        <TouchableOpacity onPress={onToggle} style={styles.eyeBtn}>
          {show ? <EyeOff size={18} color="#475569" /> : <Eye size={18} color="#475569" />}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={22} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sécurité</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Changer le mot de passe */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Lock size={16} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Changer le mot de passe</Text>
          </View>

          <PasswordField label="Mot de passe actuel"    value={currentPassword} onChange={setCurrentPassword} show={showCurrent} onToggle={() => setShowCurrent(p => !p)} />
          <PasswordField label="Nouveau mot de passe"   value={newPassword}     onChange={setNewPassword}     show={showNew}     onToggle={() => setShowNew(p => !p)} />
          <PasswordField label="Confirmer le nouveau"   value={confirmPassword} onChange={setConfirmPassword} show={showConfirm} onToggle={() => setShowConfirm(p => !p)} />

          <Text style={styles.hint}>Minimum 8 caractères. Utilisez un mélange de lettres, chiffres et symboles.</Text>

          <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={handleChangePassword} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>Mettre à jour le mot de passe</Text>}
          </TouchableOpacity>
        </View>

        {/* Zone danger */}
        <View style={[styles.section, styles.dangerSection]}>
          <View style={styles.sectionHeader}>
            <ShieldCheck size={16} color="#EF4444" />
            <Text style={[styles.sectionTitle, { color: '#EF4444' }]}>Zone sensible</Text>
          </View>
          <Text style={styles.dangerDesc}>
            La suppression de votre compte est permanente. Tous vos articles, messages et collaborations seront définitivement effacés.
          </Text>
          <TouchableOpacity style={styles.dangerBtn} onPress={handleDeleteAccount}>
            <Trash2 size={16} color="#EF4444" />
            <Text style={styles.dangerBtnText}>Supprimer mon compte</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: '#020617' },
  header:        { flexDirection: 'row', alignItems: 'center', padding: 20, gap: 16, borderBottomWidth: 1, borderBottomColor: '#1E293B' },
  backBtn:       { width: 38, height: 38, backgroundColor: '#1E293B', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  headerTitle:   { color: '#FFF', fontSize: 18, fontWeight: '800' },
  scroll:        { padding: 20, gap: 16 },
  section:       { backgroundColor: '#0A0F1E', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#1E293B' },
  dangerSection: { borderColor: '#EF444430' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  sectionTitle:  { color: '#FFF', fontSize: 15, fontWeight: '800' },
  fieldGroup:    { marginBottom: 16 },
  fieldLabel:    { color: '#475569', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  inputRow:      { flexDirection: 'row', alignItems: 'center', backgroundColor: '#020617', borderRadius: 14, borderWidth: 1, borderColor: '#1E293B' },
  input:         { flex: 1, color: '#FFF', fontSize: 15, paddingHorizontal: 16, paddingVertical: 14 },
  eyeBtn:        { padding: 14 },
  hint:          { color: '#334155', fontSize: 12, lineHeight: 18, marginBottom: 20 },
  btn:           { backgroundColor: COLORS.primary, borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  btnDisabled:   { opacity: 0.5 },
  btnText:       { color: '#FFF', fontWeight: '800', fontSize: 15 },
  dangerDesc:    { color: '#64748B', fontSize: 13, lineHeight: 20, marginBottom: 20 },
  dangerBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 14, borderRadius: 16, borderWidth: 1, borderColor: '#EF444430', backgroundColor: '#EF444408' },
  dangerBtnText: { color: '#EF4444', fontWeight: '800', fontSize: 14 },
});