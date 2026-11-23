import React, { useState, useContext } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  ScrollView, Alert, ActivityIndicator, Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { COLORS } from '../../theme/theme';
import { 
  FileUp, BookOpen, Tag, AlignLeft, Send, 
  CheckCircle, XCircle, FileText 
} from 'lucide-react-native';

const BASE_URL = 'http://192.168.207.238:5000/api';

export default function AddResourceScreen({ navigation }) {
  const { userToken } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    domain: '',
    type: 'Cours',
  });

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        setFile(result.assets[0]);
      }
    } catch (err) {
      Alert.alert("Erreur", "Impossible d'accéder aux documents.");
    }
  };

  const handleSubmit = async () => {
    if (!form.title || !form.domain || !file) {
      return Alert.alert("Champs requis", "Veuillez remplir le titre, le domaine et joindre un PDF.");
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('description', form.description);
    formData.append('domain', form.domain);
    formData.append('type', form.type);
    
    // Formatage spécifique pour le fichier
    formData.append('file', {
      uri: Platform.OS === 'android' ? file.uri : file.uri.replace('file://', ''),
      name: file.name || 'document.pdf',
      type: 'application/pdf',
    });

    try {
      await axios.post(`${BASE_URL}/resources`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${userToken}`
        },
      });

      Alert.alert(
        "Soumission réussie", 
        "Votre document a été envoyé pour validation par l'équipe Wuro’en.",
        [{ text: "Terminer", onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error(error);
      Alert.alert("Échec", "Une erreur est survenue lors de l'envoi du document.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Nouvelle Ressource</Text>
          <Text style={styles.headerSubtitle}>Partagez vos connaissances avec la communauté</Text>
        </View>

        <View style={styles.form}>
          {/* TITRE */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Titre de la ressource</Text>
            <View style={styles.inputWrapper}>
              <BookOpen size={20} color={COLORS.primary} style={styles.inputIcon} />
              <TextInput 
                style={styles.input} 
                placeholder="Ex: Optimisation de la nutrition avicole" 
                placeholderTextColor="#64748B"
                value={form.title}
                onChangeText={(t) => setForm({ ...form, title: t })}
              />
            </View>
          </View>

          {/* DOMAINE */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Domaine scientifique</Text>
            <View style={styles.inputWrapper}>
              <Tag size={20} color={COLORS.primary} style={styles.inputIcon} />
              <TextInput 
                style={styles.input} 
                placeholder="Ex: Productions Animales, Agronomie..." 
                placeholderTextColor="#64748B"
                value={form.domain}
                onChangeText={(t) => setForm({ ...form, domain: t })}
              />
            </View>
          </View>

          {/* DESCRIPTION */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description courte</Text>
            <View style={[styles.inputWrapper, { alignItems: 'flex-start', paddingTop: 12 }]}>
              <AlignLeft size={20} color={COLORS.primary} style={styles.inputIcon} />
              <TextInput 
                style={[styles.input, { height: 100, textAlignVertical: 'top' }]} 
                placeholder="Décrivez les points clés du document..." 
                placeholderTextColor="#64748B"
                multiline
                value={form.description}
                onChangeText={(t) => setForm({ ...form, description: t })}
              />
            </View>
          </View>

          {/* ZONE DE FICHIER (DROPZONE LIKE) */}
          <Text style={styles.label}>Document PDF</Text>
          <TouchableOpacity 
            style={[styles.filePicker, file && styles.filePicked]} 
            onPress={pickDocument}
          >
            {file ? (
              <View style={styles.fileContent}>
                <View style={styles.fileIconWrapper}>
                  <FileText size={32} color="#FFF" />
                </View>
                <View style={styles.fileInfo}>
                  <Text style={styles.filePickedText} numberOfLines={1}>{file.name}</Text>
                  <Text style={styles.fileSize}>{(file.size / 1024 / 1024).toFixed(2)} Mo • Prêt</Text>
                </View>
                <TouchableOpacity onPress={() => setFile(null)}>
                  <XCircle size={24} color="#94A3B8" />
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View style={styles.uploadCircle}>
                  <FileUp size={28} color={COLORS.primary} />
                </View>
                <Text style={styles.filePickerText}>Importer un PDF</Text>
                <Text style={styles.filePickerSub}>Taille maximale : 10 Mo</Text>
              </>
            )}
          </TouchableOpacity>

          {/* BOUTON D'ENVOI */}
          <TouchableOpacity 
            style={[styles.submitBtn, (loading || !file) && styles.btnDisabled]} 
            onPress={handleSubmit}
            disabled={loading || !file}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Send size={20} color="#FFF" />
                <Text style={styles.submitBtnText}>Soumettre à Wuro'en</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  header: { padding: 25, marginTop: 10 },
  headerTitle: { fontSize: 26, fontWeight: '900', color: '#FFF' },
  headerSubtitle: { fontSize: 14, color: '#64748B', marginTop: 5 },
  form: { padding: 20 },
  inputGroup: { marginBottom: 25 },
  label: { fontSize: 13, fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  inputWrapper: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F172A', 
    borderRadius: 16, borderWidth: 1, borderColor: '#1E293B', paddingHorizontal: 15 
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, height: 56, color: '#FFF', fontSize: 15 },
  filePicker: { 
    backgroundColor: 'rgba(30, 41, 59, 0.3)', borderStyle: 'dashed', 
    borderWidth: 2, borderColor: '#1E293B', borderRadius: 20, 
    padding: 30, alignItems: 'center', marginBottom: 30 
  },
  filePicked: { 
    backgroundColor: '#0F172A', borderStyle: 'solid', borderColor: COLORS.primary 
  },
  uploadCircle: {
    width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(0, 174, 239, 0.1)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 12
  },
  filePickerText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  filePickerSub: { fontSize: 12, color: '#64748B', marginTop: 6 },
  fileContent: { flexDirection: 'row', alignItems: 'center', width: '100%' },
  fileIconWrapper: {
    width: 48, height: 48, borderRadius: 12, backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center', marginRight: 15
  },
  fileInfo: { flex: 1 },
  filePickedText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  fileSize: { color: '#64748B', fontSize: 12, marginTop: 2 },
  submitBtn: { 
    backgroundColor: COLORS.primary, height: 60, borderRadius: 20, 
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12,
    shadowColor: COLORS.primary, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5
  },
  btnDisabled: { backgroundColor: '#1E293B', shadowOpacity: 0 },
  submitBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' }
});