import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import axios from 'axios';
import { COLORS, SPACING } from '../../theme/theme';
import { AuthContext } from '../../context/AuthContext'; // Import du contexte

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [loading, setLoading] = useState(false);

  // Récupération de la fonction login du contexte
  const { login } = useContext(AuthContext);

  const handleRegister = async () => {
    // Validation basique
    if (!name || !email || !password) {
      Alert.alert("Erreur", "Veuillez remplir les champs obligatoires (Nom, Email, Password).");
      return;
    }

    setLoading(true);
    try {
      /**
       * RAPPEL : 
       * - Émulateur Android : 10.0.2.2
       * - iOS Simulator : localhost
       * - Téléphone physique : Ton IP locale (ex: 192.168.1.x)
       */
      const response = await axios.post('https://wuroen-api.onrender.com/api/auth/register', {
        name,
        email,
        password,
        specialty
      });

      // Le backend renvoie { token, _id, name, email }
      const { token, ...userData } = response.data;

      // Connexion automatique via le contexte
      await login(token, userData);
      
      // Pas besoin de naviguer manuellement, AppNavigator s'en occupe car userToken n'est plus null
      Alert.alert("Bienvenue", `Ravi de vous voir, ${userData.name} !`);

    } catch (error) {
      const errorMsg = error.response?.data?.message || "Impossible de créer le compte.";
      Alert.alert("Erreur d'inscription", errorMsg);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Rejoindre Wuro’en</Text>
      <Text style={styles.subtitle}>Créez votre profil scientifique et rejoignez la communauté.</Text>
      
      <View style={styles.form}>
        <TextInput 
          style={styles.input} 
          placeholder="Nom complet *" 
          value={name} 
          onChangeText={setName} 
        />
        <TextInput 
          style={styles.input} 
          placeholder="Email *" 
          value={email} 
          onChangeText={setEmail} 
          keyboardType="email-address" 
          autoCapitalize="none" 
        />
        <TextInput 
          style={styles.input} 
          placeholder="Mot de passe *" 
          value={password} 
          onChangeText={setPassword} 
          secureTextEntry 
        />
        <TextInput 
          style={styles.input} 
          placeholder="Spécialité (ex: Zootechnie, Agronomie)" 
          value={specialty} 
          onChangeText={setSpecialty} 
        />

        <TouchableOpacity 
          style={[styles.button, loading && { opacity: 0.7 }]} 
          onPress={handleRegister} 
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>Créer mon compte</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.linkContainer}>
          <Text style={styles.linkText}>
            Déjà un compte ? <Text style={styles.linkBold}>Se connecter</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flexGrow: 1, 
    padding: SPACING.l, 
    justifyContent: 'center', 
    backgroundColor: COLORS.background 
  },
  title: { 
    fontSize: 32, 
    fontWeight: 'bold', 
    color: COLORS.primary, 
    textAlign: 'center' 
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 40,
    marginTop: 10,
    paddingHorizontal: 20
  },
  form: {
    width: '100%'
  },
  input: { 
    backgroundColor: '#FFF', 
    padding: 18, 
    borderRadius: 12, 
    marginBottom: 15, 
    borderWidth: 1, 
    borderColor: COLORS.border,
    fontSize: 16,
    color: COLORS.textPrimary
  },
  button: { 
    backgroundColor: COLORS.primary, 
    padding: 18, 
    borderRadius: 12, 
    alignItems: 'center', 
    marginTop: 10,
    elevation: 2,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5
  },
  buttonText: { 
    color: '#FFF', 
    fontWeight: 'bold', 
    fontSize: 18 
  },
  linkContainer: { 
    marginTop: 25 
  },
  linkText: { 
    color: COLORS.textSecondary, 
    textAlign: 'center',
    fontSize: 15
  },
  linkBold: { 
    color: COLORS.primary, 
    fontWeight: 'bold' 
  }
});