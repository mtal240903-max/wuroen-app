import React, { useState, useContext } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, Alert, ActivityIndicator 
} from 'react-native';
import axios from 'axios'; // Import de axios
import { AuthContext } from '../../context/AuthContext';
import { COLORS, SPACING, SIZES } from '../../theme/theme';
import { LogIn } from 'lucide-react-native';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs.");
      return;
    }

    setLoading(true);
    try {
      // Rappel : Utilise l'IP de ton PC si tu es sur un vrai téléphone
      const response = await axios.post('http://192.168.115.239:5000/api/auth/login', {
        email,
        password,
      });

      // On récupère le token et les infos utilisateur renvoyés par le backend
      const { token, ...userData } = response.data;
      
      // On connecte l'utilisateur dans le contexte
      login(token, userData);
      
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Identifiants incorrects.";
      Alert.alert("Échec de connexion", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          <View style={styles.header}>
            <Text style={styles.logo}>Wuro’en</Text>
            <Text style={styles.subtitle}>Réseau Social Scientifique</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Adresse Email</Text>
            <TextInput
              style={styles.input}
              placeholder="ex: mtal@wuroen.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.label}>Mot de passe</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity 
              style={[styles.button, loading && { opacity: 0.7 }]} 
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Text style={styles.buttonText}>Se connecter</Text>
                  <LogIn color="#FFF" size={20} style={{ marginLeft: 10 }} />
                </>
              )}
            </TouchableOpacity>

            {/* MISE À JOUR ICI : Ajout du onPress pour naviguer vers Register */}
            <TouchableOpacity 
              style={styles.link} 
              onPress={() => navigation.navigate('Register')}
            >
              <Text style={styles.linkText}>Pas de compte ? Créer un profil</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

// ... Tes styles restent identiques
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  inner: { flex: 1, padding: SPACING.l, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 50 },
  logo: { fontSize: 40, fontWeight: '900', color: COLORS.primary, letterSpacing: -1 },
  subtitle: { fontSize: 16, color: COLORS.textSecondary, marginTop: 5 },
  form: { backgroundColor: '#FFF', padding: SPACING.l, borderRadius: SIZES.radius, elevation: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 8 },
  input: { backgroundColor: COLORS.background, padding: 15, borderRadius: 8, marginBottom: 20, fontSize: 16, borderWidth: 1, borderColor: COLORS.border },
  button: { backgroundColor: COLORS.primary, padding: 18, borderRadius: 8, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  link: { marginTop: 20, alignItems: 'center' },
  linkText: { color: COLORS.primary, fontWeight: '500' }
});