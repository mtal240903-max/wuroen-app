import React, { useState, useContext } from 'react';
import { 
  View, Text, TextInput, ScrollView, TouchableOpacity, 
  StyleSheet, KeyboardAvoidingView, Platform, Alert, Image, ActivityIndicator 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker'; 
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext'; 
import { COLORS, SPACING, SIZES } from '../../theme/theme';
import { X, Send, Camera, Trash2 } from 'lucide-react-native';

const InputField = ({ label, value, onChange, placeholder, multiline = false }) => (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={[styles.input, multiline && styles.textArea]}
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor={COLORS.textSecondary}
      multiline={multiline}
      textAlignVertical={multiline ? 'top' : 'center'}
    />
  </View>
);

export default function CreateArticleScreen({ navigation }) {
  // CORRECTION : On récupère userToken directement du contexte
  const { userToken } = useContext(AuthContext); 
  
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    category: '',
    intro: '',
    methodo: '',
    results: '',
  });
  
  const [image, setImage] = useState(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert("Permission refusée", "L'accès à la galerie est nécessaire.");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.7, 
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handlePublish = async () => {
    if (!form.title || !form.intro || !form.category) {
      Alert.alert("Erreur", "Le titre, la catégorie et l'introduction sont obligatoires.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('category', form.category);
    formData.append('intro', form.intro);
    formData.append('methodo', form.methodo);
    formData.append('results', form.results);

    if (image) {
      const uriParts = image.split('.');
      const fileType = uriParts[uriParts.length - 1];
      const fileName = image.split('/').pop();

      formData.append('image', {
        uri: image,
        name: fileName || `photo.${fileType}`,
        type: `image/${fileType}`,
      });
    }

    try {
      // Vérifie bien que cette IP est toujours celle de ton PC
      const response = await axios.post('http://192.168.115.239:5000/api/articles', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          // CORRECTION : On utilise la variable userToken récupérée plus haut
          'Authorization': `Bearer ${userToken}` 
        },
      });

      if (response.status === 201) {
        Alert.alert("Succès", "Votre article scientifique a été publié !");
        navigation.goBack();
      }
    } catch (error) {
      // Log détaillé pour le débogage
      console.error("Détails Erreur:", error.response?.data || error.message);
      
      const errorMsg = error.response?.data?.message || "Échec de la publication.";
      Alert.alert("Erreur", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} disabled={loading}>
          <X color={COLORS.textPrimary} size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nouvelle Publication</Text>
        <TouchableOpacity 
          onPress={handlePublish} 
          style={[styles.publishBtn, loading && { opacity: 0.7 }]}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <Send color="#FFF" size={20} />
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <InputField 
            label="Titre de la recherche" 
            placeholder="ex: Impact de la litière sur la croissance..."
            value={form.title}
            onChange={(val) => setForm({...form, title: val})}
          />

          <InputField 
            label="Domaine / Catégorie" 
            placeholder="ex: Zootechnie, Agronomie..."
            value={form.category}
            onChange={(val) => setForm({...form, category: val})}
          />
          
          <View style={styles.imageSection}>
            <Text style={styles.label}>Illustration (Schéma, Photo de terrain...)</Text>
            
            {image ? (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: image }} style={styles.imagePreview} />
                <TouchableOpacity style={styles.deleteImageBtn} onPress={() => setImage(null)}>
                  <Trash2 color="#FFF" size={16} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.addImageBtn} onPress={pickImage}>
                <Camera color={COLORS.primary} size={32} />
                <Text style={styles.addImageText}>Ajouter une illustration</Text>
              </TouchableOpacity>
            )}
          </View>

          <InputField label="Introduction" placeholder="Contexte et problématique..." multiline value={form.intro} onChange={(val) => setForm({...form, intro: val})} />
          <InputField label="Méthodologie" placeholder="Matériels et méthodes..." multiline value={form.methodo} onChange={(val) => setForm({...form, methodo: val})} />
          <InputField label="Résultats & Discussion" placeholder="Observations..." multiline value={form.results} onChange={(val) => setForm({...form, results: val})} />

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    paddingHorizontal: SPACING.m, paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingBottom: 20,
    borderBottomWidth: 1, borderBottomColor: COLORS.border, backgroundColor: '#FFF',
    elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.textPrimary },
  publishBtn: { backgroundColor: COLORS.primary, padding: 10, borderRadius: 12, width: 45, alignItems: 'center' },
  scrollContent: { padding: SPACING.m },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 8, textTransform: 'uppercase' },
  input: { 
    backgroundColor: COLORS.background, borderRadius: 12, padding: 15, fontSize: 16, 
    color: COLORS.textPrimary, borderWidth: 1, borderColor: COLORS.border
  },
  textArea: { minHeight: 100, paddingTop: 15 },
  imageSection: { marginBottom: 25 },
  addImageBtn: { 
    backgroundColor: '#F0F4FF', height: 120, borderRadius: 15, borderWidth: 2, 
    borderColor: COLORS.primary, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center'
  },
  addImageText: { color: COLORS.primary, fontWeight: 'bold', marginTop: 8 },
  imagePreviewContainer: { position: 'relative' },
  imagePreview: { width: '100%', height: 200, borderRadius: 15, resizeMode: 'cover' },
  deleteImageBtn: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(255, 68, 68, 0.8)', padding: 8, borderRadius: 20 }
});