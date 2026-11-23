import React, { useState, useContext } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, Alert, Image, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, FolderPlus, Tag, AlignLeft, ImageIcon } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { ProjectContext } from '../../context/ProjectContext'; 
import { AuthContext } from '../../../../context/AuthContext'; 
import { BASE_URL } from '../../../../api/apiConfig';

export default function CreateProjectScreen({ route, navigation }) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState('Elevage'); 
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const { userToken } = useContext(AuthContext) || {};
  
  const companyId = route?.params?.companyId || null;

  const categoryImages = {
    'Elevage': 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=300&q=80',
    'Agriculture': 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=300&q=80',
    'Technologie': 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=300&q=80',
    'Recherche': 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=300&q=80'
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert("Permission refusée", "Vous devez autoriser l'accès à vos photos pour en ajouter une.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleCreate = async () => {
    if (!title.trim() || !desc.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires.');
      return;
    }

    setLoading(true);

    try {
      const imageUrl = selectedImage || categoryImages[category];

      const response = await fetch(`${BASE_URL}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({
          name: title.trim(),
          description: desc.trim(),
          category,
          imageUrl,
          companyId: companyId || null
        })
      });

      const responseText = await response.text();
      console.log("TEXTE BRUT REÇU DU SERVEUR :", responseText);
      
      let json;
      try {
        json = JSON.parse(responseText);
      } catch (e) {
        throw new Error("Le serveur a renvoyé : " + responseText.substring(0, 100));
      }

      if (response.ok && json.success) {
        Alert.alert('Succès', 'Projet créé avec succès !');
        navigation.goBack();
      } else {
        Alert.alert('Erreur', json.message || 'Impossible de sauvegarder le projet.');
      }
    } catch (error) {
      console.error("Erreur réseau :", error);
      Alert.alert('Erreur', error.message || 'Impossible de contacter le serveur.');
    } finally {
      setLoading(false);
    }
  };

  const categories = ['Elevage', 'Agriculture', 'Technologie', 'Recherche'];

  return (
    <View style={styles.container}>
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft color="#FFF" size={22} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Nouveau projet</Text>
        <View style={{ width: 36 }} /> 
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Illustration du projet</Text>
          <TouchableOpacity style={styles.imagePickerBox} onPress={pickImage} activeOpacity={0.7}>
            {selectedImage ? (
              <Image source={{ uri: selectedImage }} style={styles.previewImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <ImageIcon color="#6366F1" size={28} />
                <Text style={styles.uploadText}>Ajouter une photo depuis la galerie</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <FolderPlus color="#6366F1" size={16} style={{ marginRight: 6 }} />
            <Text style={styles.label}>Nom du projet *</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Ex: Ferme Avicole Phase 2"
            placeholderTextColor="#64748B"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <AlignLeft color="#6366F1" size={16} style={{ marginRight: 6 }} />
            <Text style={styles.label}>Description du projet *</Text>
          </View>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Décrivez les objectifs..."
            placeholderTextColor="#64748B"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={desc}
            onChangeText={setDesc}
          />
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Tag color="#6366F1" size={16} style={{ marginRight: 6 }} />
            <Text style={styles.label}>Catégorie</Text>
          </View>
          <View style={styles.categoryContainer}>
            {categories.map((cat) => {
              const isActive = category === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryBadge, isActive && styles.categoryBadgeActive]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <TouchableOpacity activeOpacity={0.85} style={styles.submitBtnWrapper} onPress={handleCreate} disabled={loading}>
          <LinearGradient colors={['#4F46E5', '#6366F1']} style={styles.submitGradient}>
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.submitBtnText}>Créer le projet</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090D1A', paddingTop: 60 },
  navbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 25 },
  backBtn: { width: 36, height: 36, justifyContent: 'center' },
  navTitle: { fontSize: 22, fontWeight: '800', color: '#FFF', textAlign: 'center', flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 60 },
  
  inputGroup: { marginBottom: 24 },
  labelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  label: { fontSize: 14, fontWeight: '600', color: '#94A3B8', marginBottom: 8 },
  input: { backgroundColor: '#111726', borderWidth: 1, borderColor: '#1E293B', borderRadius: 14, paddingHorizontal: 16, height: 50, color: '#F1F5F9', fontSize: 15 },
  textArea: { height: 120, paddingTop: 14, paddingBottom: 14 },
  
  imagePickerBox: { width: '100%', height: 140, backgroundColor: '#111726', borderRadius: 14, borderWidth: 1, borderColor: '#1E293B', borderStyle: 'dashed', overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  imagePlaceholder: { alignItems: 'center', padding: 20 },
  uploadText: { color: '#64748B', fontSize: 13, marginTop: 8, fontWeight: '500' },
  previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },

  categoryContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 },
  categoryBadge: { paddingHorizontal: 16, height: 36, borderRadius: 18, backgroundColor: '#111726', justifyContent: 'center', alignItems: 'center', marginRight: 10, marginBottom: 10, borderWidth: 1, borderColor: '#1E293B' },
  categoryBadgeActive: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
  categoryText: { color: '#94A3B8', fontSize: 13, fontWeight: '500' },
  categoryTextActive: { color: '#FFF', fontWeight: '700' },
  
  submitBtnWrapper: { width: '100%', height: 52, borderRadius: 16, overflow: 'hidden', marginTop: 20, borderWidth: 1, borderColor: '#6366F1' },
  submitGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  submitBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' }
});