import React, { useState, useContext } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, Alert, ActivityIndicator, StatusBar 
} from 'react-native';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { COLORS } from '../../theme/theme';
import { LogIn, Mail, Lock, Sparkles } from 'lucide-react-native';

// ✅ Importation de la configuration centrale
import { ENDPOINTS } from '../../api/apiConfig';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Champs requis", "Veuillez saisir vos accès pour entrer dans le réseau.");
      return;
    }

    setLoading(true);
    try {
      // ✅ Utilisation de l'endpoint centralisé
      const response = await axios.post(ENDPOINTS.login, { email, password });
      
      const { token, ...userData } = response.data;
      
      // Initialisation de la session
      login(token, userData);
      
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Échec de l'authentification (Vérifiez votre connexion au serveur).";
      Alert.alert("Accès refusé", errorMsg);
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
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          
          <View style={styles.header}>
            <View style={styles.iconCircle}>
               <Sparkles color={COLORS.primary} size={32} />
            </View>
            <Text style={styles.logo}>Wuro’en</Text>
            <Text style={styles.subtitle}>Réseau Scientifique & Technique</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>IDENTIFIANT</Text>
              <View style={styles.inputWrapper}>
                <Mail size={18} color="#475569" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="nom@exemple.com"
                  placeholderTextColor="#475569"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

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

            <TouchableOpacity 
              style={[styles.button, loading && styles.buttonDisabled]} 
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Text style={styles.buttonText}>Initialiser la session</Text>
                  <LogIn color="#FFF" size={20} />
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.link} 
              onPress={() => navigation.navigate('Register')}
            >
              <Text style={styles.linkTextRegular}>Nouveau chercheur ? </Text>
              <Text style={styles.linkTextBold}>Rejoindre le réseau</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.footer}>
            <Text style={styles.footerText}>Powered by MTal Studio</Text>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  inner: { flex: 1, padding: 30, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 40 },
  iconCircle: { width: 70, height: 70, borderRadius: 35, backgroundColor: COLORS.primary + '15', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  logo: { fontSize: 36, fontWeight: '900', color: '#FFF', letterSpacing: -1 },
  subtitle: { fontSize: 13, color: '#64748B', marginTop: 5, fontWeight: '600', letterSpacing: 0.5 },
  form: { backgroundColor: '#0F172A', padding: 25, borderRadius: 25, borderWidth: 1, borderColor: '#1E293B' },
  inputContainer: { marginBottom: 20 },
  label: { fontSize: 10, fontWeight: '900', color: COLORS.primary, marginBottom: 10, letterSpacing: 1.5 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#020617', borderRadius: 12, borderWidth: 1, borderColor: '#1E293B', paddingHorizontal: 15 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, paddingVertical: 15, fontSize: 15, color: '#F8FAFC' },
  button: { backgroundColor: COLORS.primary, padding: 18, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10, gap: 12, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  link: { marginTop: 25, flexDirection: 'row', justifyContent: 'center' },
  linkTextRegular: { color: '#64748B', fontSize: 14 },
  linkTextBold: { color: COLORS.primary, fontSize: 14, fontWeight: '800' },
  footer: { position: 'absolute', bottom: 40, left: 0, right: 0, alignItems: 'center' },
  footerText: { color: '#1E293B', fontSize: 10, fontWeight: '800', letterSpacing: 1 }
});