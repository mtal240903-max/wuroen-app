import React, { useState, useContext } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, Alert, Image,
  ActivityIndicator, Modal, FlatList
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { AuthContext } from '../../context/AuthContext';
import { COLORS } from '../../theme/theme';
import { X, Send, Camera, Trash2, BookOpen, Tag, Users, UserPlus, Search, FileText } from 'lucide-react-native';

// ✅ FIX : 'api' au lieu de 'axios' — injecte le token automatiquement
import api, { apiUpload } from '../../services/api';

// ─────────────────────────────────────────────────────────────
// COMPOSANT CHAMP DE SAISIE
// ─────────────────────────────────────────────────────────────
const InputField = ({ label, value, onChange, placeholder, multiline = false, icon: Icon }) => (
  <View style={styles.inputGroup}>
    <View style={styles.labelRow}>
      {Icon && <Icon size={14} color={COLORS.primary} style={{ marginRight: 6 }} />}
      <Text style={styles.label}>{label}</Text>
    </View>
    <TextInput
      style={[styles.input, multiline && styles.textArea]}
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor="#64748B"
      multiline={multiline}
      textAlignVertical={multiline ? 'top' : 'center'}
    />
  </View>
);

// ─────────────────────────────────────────────────────────────
// ÉCRAN PRINCIPAL
// ─────────────────────────────────────────────────────────────
export default function CreateArticleScreen({ navigation }) {
  const { userToken } = useContext(AuthContext);

  const [loading, setLoading]           = useState(false);
  const [image, setImage]               = useState(null);
  const [coAuthors, setCoAuthors]       = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery]   = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const [form, setForm] = useState({
    title:      '',
    category:   '',   // ✅ String libre — le backend accepte String ou ObjectId
    intro:      '',
    methodo:    '',
    results:    '',
    references: '',
  });

  // ─── RECHERCHE CO-AUTEURS ────────────────────────────────────
  const searchUsers = async (query) => {
    setSearchQuery(query);
    if (query.length < 2) { setSearchResults([]); return; }
    try {
      // ✅ api injecte le token automatiquement
      const res = await api.get(`/users/search?q=${query}`);
      setSearchResults(res.data);
    } catch (err) {
      console.log("Erreur recherche co-auteurs:", err.response?.status);
    }
  };

  const addCoAuthor = (user) => {
    if (!coAuthors.find(a => a.user === user._id)) {
      // ✅ FIX : user.name au lieu de user.firstName + user.lastName (cohérent avec User.js)
      setCoAuthors([...coAuthors, { user: user._id, name: user.name || 'Collaborateur' }]);
    }
    setModalVisible(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const removeCoAuthor = (id) => setCoAuthors(coAuthors.filter(a => a.user !== id));

  // ─── SÉLECTION IMAGE ─────────────────────────────────────────
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission refusée", "L'accès à la galerie est nécessaire.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType ? [ImagePicker.MediaType.Images] : ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  // ─── SOUMISSION ──────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.title.trim() || !form.intro.trim() || !form.category.trim()) {
      Alert.alert("Champs manquants", "Le titre, le domaine et le résumé sont obligatoires.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title',    form.title.trim());
      formData.append('category', form.category.trim());
      formData.append('intro',    form.intro.trim());
      formData.append('methodo',  form.methodo.trim());
      formData.append('results',  form.results.trim());

      // Co-auteurs
      const formattedCoAuthors = coAuthors.map(a => ({ user: a.user, role: 'co-author' }));
      formData.append('coAuthors', JSON.stringify(formattedCoAuthors));

      // Références (une par ligne)
      const refArray = form.references.split('\n').map(r => r.trim()).filter(Boolean);
      formData.append('references', JSON.stringify(refArray));

      // Image
      if (image) {
        const filename = image.split('/').pop();
        const match    = /\.(\w+)$/.exec(filename);
        const type     = match ? `image/${match[1].toLowerCase()}` : 'image/jpeg';
        formData.append('image', {
          uri:  Platform.OS === 'ios' ? image.replace('file://', '') : image,
          name: filename || `article_${Date.now()}.jpg`,
          type,
        });
      }

      // ✅ FIX CRITIQUE : api.post au lieu de axios.post
      // - Token injecté automatiquement par l'intercepteur
      // - Plus besoin de passer BASE_URL manuellement
      const response = await apiUpload.post('/articles', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.status === 201 || response.status === 200) {
        Alert.alert(
          "Article soumis ✅",
          "Votre article a été soumis aux modérateurs. Il sera visible après validation.",
          [{ text: "Voir le flux", onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      // ✅ Messages d'erreur explicites selon le code HTTP
      const status  = error.response?.status;
      const message = error.response?.data?.message;

      if (status === 400) {
        Alert.alert("Données invalides", message || "Vérifiez les champs du formulaire.");
      } else if (status === 401) {
        Alert.alert("Session expirée", "Reconnectez-vous et réessayez.");
      } else if (!error.response) {
        Alert.alert("Erreur réseau", "Impossible de joindre le serveur. Vérifiez votre connexion.");
      } else {
        Alert.alert("Erreur", message || "Une erreur est survenue. Réessayez.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // RENDU
  // ─────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <X color="#FFF" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nouvelle Recherche</Text>
        <TouchableOpacity onPress={handleSubmit} style={styles.publishBtn} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#FFF" size="small" />
            : <Send color="#FFF" size={20} />
          }
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          <InputField
            label="Titre de l'étude"
            placeholder="ex: Impact de la technologie sur l'élevage..."
            value={form.title}
            onChange={(val) => setForm({ ...form, title: val })}
            icon={FileText}
          />

          <InputField
            label="Discipline / Domaine"
            icon={Tag}
            placeholder="ex: Agronomie, Zootechnie..."
            value={form.category}
            onChange={(val) => setForm({ ...form, category: val })}
          />

          {/* CO-AUTEURS */}
          <View style={styles.section}>
            <View style={styles.labelRow}>
              <Users size={14} color={COLORS.primary} style={{ marginRight: 6 }} />
              <Text style={styles.label}>Collaborateurs / Co-auteurs</Text>
            </View>
            <View style={styles.coAuthorsList}>
              {coAuthors.map((author) => (
                <View key={author.user} style={styles.authorBadge}>
                  <Text style={styles.authorBadgeText}>{author.name}</Text>
                  <TouchableOpacity onPress={() => removeCoAuthor(author.user)}>
                    <X size={14} color="#FFF" />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity style={styles.addAuthorBtn} onPress={() => setModalVisible(true)}>
                <UserPlus size={18} color={COLORS.primary} />
                <Text style={styles.addAuthorText}>Ajouter</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* IMAGE */}
          <View style={styles.imageSection}>
            <Text style={styles.label}>Figure ou Illustration (Max 5Mo)</Text>
            {image ? (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: image }} style={styles.imagePreview} />
                <TouchableOpacity style={styles.deleteImageBtn} onPress={() => setImage(null)}>
                  <Trash2 color="#FFF" size={18} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.addImageBtn} onPress={pickImage}>
                <Camera color={COLORS.primary} size={32} />
                <Text style={styles.addImageText}>Sélectionner une image</Text>
              </TouchableOpacity>
            )}
          </View>

          <InputField label="Résumé de la recherche"   placeholder="Qu'avez-vous étudié ?"         multiline value={form.intro}       onChange={(val) => setForm({ ...form, intro: val })} />
          <InputField label="Matériels et Méthodes"    placeholder="Comment avez-vous procédé ?"   multiline value={form.methodo}     onChange={(val) => setForm({ ...form, methodo: val })} />
          <InputField label="Résultats et Discussion"  placeholder="Quels sont vos constats ?"     multiline value={form.results}     onChange={(val) => setForm({ ...form, results: val })} />
          <InputField label="Sources & Bibliographie"  icon={BookOpen} placeholder="Une référence par ligne..." multiline value={form.references} onChange={(val) => setForm({ ...form, references: val })} />

          <View style={{ height: 60 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* MODAL CO-AUTEURS */}
      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chercher un collègue</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
            <View style={styles.searchBar}>
              <Search size={18} color="#94A3B8" />
              <TextInput
                placeholder="Entrez un nom..."
                placeholderTextColor="#94A3B8"
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={searchUsers}
              />
            </View>
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.userResult} onPress={() => addCoAuthor(item)}>
                  <View>
                    {/* ✅ FIX : item.name au lieu de item.firstName + item.lastName */}
                    <Text style={styles.userName}>{item.name || 'Utilisateur'}</Text>
                    <Text style={styles.userSpec}>{item.specialty || 'Scientifique'}</Text>
                  </View>
                  <UserPlus size={20} color={COLORS.primary} />
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                searchQuery.length >= 2
                  ? <Text style={{ color: '#64748B', textAlign: 'center', marginTop: 20 }}>Aucun résultat</Text>
                  : null
              }
            />
          </View>
        </View>
      </Modal>

    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#020617' },
  header:       {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingBottom: 15,
    borderBottomWidth: 1, borderBottomColor: '#1E293B', backgroundColor: '#020617'
  },
  headerTitle:  { fontSize: 18, fontWeight: '800', color: '#FFF' },
  closeBtn:     { padding: 5 },
  publishBtn:   {
    backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 14, minWidth: 48, alignItems: 'center', justifyContent: 'center',
    shadowColor: COLORS.primary, shadowOpacity: 0.3, shadowRadius: 5, elevation: 5
  },
  scrollContent:  { padding: 20 },
  inputGroup:     { marginBottom: 20 },
  labelRow:       { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  label:          { fontSize: 11, fontWeight: '900', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1 },
  input:          {
    backgroundColor: '#0F172A', borderRadius: 12, padding: 14,
    fontSize: 15, color: '#FFF', borderWidth: 1, borderColor: '#334155'
  },
  textArea:       { minHeight: 120 },
  section:        { marginBottom: 20 },
  coAuthorsList:  { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  authorBadge:    {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary,
    paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20
  },
  authorBadgeText: { color: '#FFF', fontSize: 13, fontWeight: '600', marginRight: 5 },
  addAuthorBtn:   {
    flexDirection: 'row', alignItems: 'center', borderStyle: 'dashed',
    borderWidth: 1, borderColor: COLORS.primary,
    paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20
  },
  addAuthorText:  { color: COLORS.primary, fontWeight: '700', marginLeft: 5, fontSize: 13 },
  imageSection:   { marginBottom: 25 },
  addImageBtn:    {
    backgroundColor: 'rgba(0, 174, 239, 0.05)', height: 160, borderRadius: 18,
    borderWidth: 1, borderColor: COLORS.primary, borderStyle: 'dashed',
    justifyContent: 'center', alignItems: 'center'
  },
  addImageText:   { color: COLORS.primary, fontWeight: '700', marginTop: 10 },
  imagePreviewContainer: { position: 'relative', width: '100%' },
  imagePreview:   { width: '100%', height: 220, borderRadius: 18 },
  deleteImageBtn: {
    position: 'absolute', top: 12, right: 12, backgroundColor: '#EF4444',
    padding: 10, borderRadius: 15, elevation: 10
  },
  modalOverlay:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent:   {
    backgroundColor: '#0F172A', borderTopLeftRadius: 30, borderTopRightRadius: 30,
    height: '80%', padding: 25, borderWidth: 1, borderColor: '#1E293B'
  },
  modalHeader:    { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, alignItems: 'center' },
  modalTitle:     { fontSize: 18, fontWeight: '800', color: '#FFF' },
  searchBar:      {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B',
    paddingHorizontal: 15, borderRadius: 15, marginBottom: 20
  },
  searchInput:    { flex: 1, paddingVertical: 14, marginLeft: 10, fontSize: 16, color: '#FFF' },
  userResult:     {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: '#1E293B'
  },
  userName:       { fontSize: 16, fontWeight: '700', color: '#F8FAFC' },
  userSpec:       { fontSize: 13, color: '#94A3B8', marginTop: 2 },
});