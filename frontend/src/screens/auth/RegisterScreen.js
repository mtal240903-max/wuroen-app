import React, { useState, useContext } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  Alert, ActivityIndicator, ScrollView, StatusBar, KeyboardAvoidingView, Platform 
} from 'react-native';
import axios from 'axios';
import { COLORS } from '../../theme/theme';
import { AuthContext } from '../../context/AuthContext';
import { User, Mail, Lock, BookOpen, UserPlus, ArrowLeft } from 'lucide-react-native';

// ✅ Importation de la configuration centrale
import { ENDPOINTS } from '../../api/apiConfig';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert("Champs obligatoires", "Le nom, l'email et le mot de passe sont requis pour l'accréditation.");
      return;
    }

    setLoading(true);
    try {
      // ✅ Utilisation de l'endpoint centralisé
      const response = await axios.post(ENDPOINTS.register, {
        name,
        email,
        password,
        specialty
      });

      const { token, ...userData } = response.data;
      
      // Connexion automatique après inscription
      await login(token, userData);
      
      Alert.alert("Succès", `Bienvenue dans le réseau, ${userData.name} !`);

    } catch (error) {
      const errorMsg = error.response?.data?.message || "Erreur de communication avec le serveur.";
      Alert.alert("Échec de l'inscription", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft color="#64748B" size={24} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Inscription</Text>
          <Text style={styles.subtitle}>Initialisez votre identité numérique scientifique.</Text>
        </View>
        
        <View style={styles.form}>
          {/* NOM COMPLET */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>NOM COMPLET</Text>
            <View style={styles.inputWrapper}>
              <User size={18} color="#475569" style={styles.inputIcon} />
              <TextInput 
                style={styles.input} 
                placeholder="ex: Saul MTal" 
                placeholderTextColor="#475569"
                value={name} 
                onChangeText={setName} 
              />
            </View>
          </View>

          {/* EMAIL */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>ADRESSE EMAIL</Text>
            <View style={styles.inputWrapper}>
              <Mail size={18} color="#475569" style={styles.inputIcon} />
              <TextInput 
                style={styles.input} 
                placeholder="chercheur@wuroen.com" 
                placeholderTextColor="#475569"
                value={email} 
                onChangeText={setEmail} 
                keyboardType="email-address" 
                autoCapitalize="none" 
              />
            </View>
          </View>

          {/* MOT DE PASSE */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>MOT DE PASSE</Text>
            <View style={styles.inputWrapper}>
              <Lock size={18} color="#475569" style={styles.inputIcon} />
              <TextInput 
                style={styles.input} 
                placeholder="••••••••" 
                placeholderTextColor="#475569"
                value={password} 
                onChangeText={setPassword} 
                secureTextEntry 
              />
            </View>
          </View>

          {/* SPÉCIALITÉ */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>SPÉCIALITÉ (OPTIONNEL)</Text>
            <View style={styles.inputWrapper}>
              <BookOpen size={18} color="#475569" style={styles.inputIcon} />
              <TextInput 
                style={styles.input} 
                placeholder="ex: Production Animale" 
                placeholderTextColor="#475569"
                value={specialty} 
                onChangeText={setSpecialty} 
              />
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleRegister} 
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Text style={styles.buttonText}>Créer mon profil</Text>
                <UserPlus color="#FFF" size={20} />
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.linkContainer}>
            <Text style={styles.linkText}>
              Déjà membre ? <Text style={styles.linkBold}>Se connecter</Text>
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>WURO'EN PROTOCOL v2.0</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  scrollContent: { flexGrow: 1, padding: 30, paddingTop: 60 },
  backBtn: { marginBottom: 20, alignSelf: 'flex-start' },
  header: { marginBottom: 35 },
  title: { fontSize: 32, fontWeight: '900', color: '#FFF', letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: '#64748B', marginTop: 8, fontWeight: '500' },
  form: { backgroundColor: '#0F172A', padding: 25, borderRadius: 25, borderWidth: 1, borderColor: '#1E293B' },
  inputContainer: { marginBottom: 18 },
  label: { fontSize: 10, fontWeight: '900', color: COLORS.primary, marginBottom: 10, letterSpacing: 1 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#020617', borderRadius: 12, borderWidth: 1, borderColor: '#1E293B', paddingHorizontal: 15 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, paddingVertical: 14, fontSize: 15, color: '#F8FAFC' },
  button: { backgroundColor: COLORS.primary, padding: 18, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 15, gap: 12, elevation: 4, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#FFF', fontWeight: '800', fontSize: 16 },
  linkContainer: { marginTop: 25 },
  linkText: { color: '#64748B', textAlign: 'center', fontSize: 14 },
  linkBold: { color: COLORS.primary, fontWeight: '800' },
  footer: { marginTop: 40, alignItems: 'center' },
  footerText: { color: '#1E293B', fontSize: 10, fontWeight: '800', letterSpacing: 2 }
});