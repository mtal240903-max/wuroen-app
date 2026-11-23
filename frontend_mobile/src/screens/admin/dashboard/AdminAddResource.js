import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  Alert, ActivityIndicator, Platform, FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import { ArrowLeft, FilePlus, UploadCloud, CheckCircle, Trash2, FileText, XCircle, Info, Lock } from 'lucide-react-native';
import { COLORS } from '../../../theme/theme';
import { AuthContext } from '../../../context/AuthContext';

// ✅ apiUpload pour les fichiers lourds (60s timeout)
import api, { apiUpload } from '../../../services/api';

export default function AdminAddResource({ route, navigation }) {
  const { categoryId, categoryName } = route.params || {};
  const { user } = useContext(AuthContext);

  // ✅ SÉCURITÉ FRONTEND : vérifier les droits dès le montage
  const canAccess = user?.role === 'superadmin' ||
    (user?.role === 'admin' && ['library', 'workspace'].includes(user?.adminType));

  const [title, setTitle]           = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile]             = useState(null);
  const [uploading, setUploading]   = useState(false);
  const [existingResources, setExistingResources] = useState([]);
  const [loadingList, setLoadingList] = useState(true);

  const fetchExisting = useCallback(async () => {
    if (!categoryId || !canAccess) return;
    try {
      setLoadingList(true);
      const res = await api.get(`/library/resources/${categoryId}`);
      const data = Array.isArray(res.data) ? res.data : (res.data?.resources ?? []);
      setExistingResources(data);
    } catch (e) {
      console.error("Erreur liste ressources:", e.response?.status);
    } finally {
      setLoadingList(false);
    }
  }, [categoryId, canAccess]);

  useEffect(() => { fetchExisting(); }, [fetchExisting]);

  // ✅ ÉCRAN BLOQUÉ si pas les droits — même si on navigue directement
  if (!canAccess) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Lock color="#EF4444" size={48} />
        <Text style={{ color: '#EF4444', fontSize: 18, fontWeight: '900', marginTop: 20 }}>
          Accès refusé
        </Text>
        <Text style={{ color: '#64748B', textAlign: 'center', marginTop: 10, paddingHorizontal: 40 }}>
          Votre profil administrateur ne vous autorise pas à gérer la bibliothèque.
        </Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtnLocked}>
          <Text style={{ color: '#FFF', fontWeight: '700' }}>← Retour</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'text/plain'],
        copyToCacheDirectory: true
      });
      if (!result.canceled && result.assets?.length > 0) {
        const picked = result.assets[0];
        // ✅ Validation taille côté client (50MB max)
        if (picked.size > 50 * 1024 * 1024) {
          Alert.alert("Fichier trop lourd", "La taille maximale est 50 MB.");
          return;
        }
        setFile(picked);
      }
    } catch (err) {
      Alert.alert("Erreur", "Sélection impossible.");
    }
  };

  const handleUpload = async () => {
    if (!title.trim() || !file) {
      Alert.alert("Champs requis", "Titre et fichier sont obligatoires.");
      return;
    }
    if (!categoryId) {
      Alert.alert("Erreur", "Aucune catégorie sélectionnée.");
      return;
    }

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('description', description.trim());
    formData.append('categoryId', categoryId);
    formData.append('file', {
      uri:  Platform.OS === 'ios' ? file.uri.replace('file://', '') : file.uri,
      name: file.name || `doc_${Date.now()}.pdf`,
      type: file.mimeType || 'application/octet-stream',
    });

    setUploading(true);
    try {
      // ✅ apiUpload : timeout 60s pour les gros fichiers
      await apiUpload.post('/library/resources', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      Alert.alert("✅ Succès", "Le document est indexé dans la bibliothèque.");
      setTitle('');
      setDescription('');
      setFile(null);
      fetchExisting();
    } catch (error) {
      const status = error.response?.status;
      const msg    = error.response?.data?.message;
      if (status === 403) {
        Alert.alert("Accès refusé", "Votre compte n'est pas autorisé à uploader des documents.");
      } else if (status === 400) {
        Alert.alert("Données invalides", msg || "Vérifiez le fichier et les champs.");
      } else {
        Alert.alert("Échec upload", msg || "Erreur réseau. Réessayez.");
      }
      console.error("Upload error:", status, error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (id) => {
    Alert.alert("Confirmation", "Supprimer définitivement ce document ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer", style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/library/resources/${id}`);
            setExistingResources(prev => prev.filter(item => item._id !== id));
          } catch (e) {
            Alert.alert("Erreur", e.response?.data?.message || "Impossible de supprimer.");
          }
        }
      }
    ]);
  };

  const renderHeader = () => (
    <View style={styles.formSection}>
      <View style={styles.infoCard}>
        <Info color={COLORS.primary} size={18} />
        <Text style={styles.targetLabel}>
          Dossier : <Text style={styles.targetName}>{categoryName || 'Non défini'}</Text>
        </Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Nom de la ressource *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Protocole Vaccinal Aviaire..."
          placeholderTextColor="#475569"
          value={title}
          onChangeText={setTitle}
          maxLength={200}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Description (optionnel)</Text>
        <TextInput
          style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
          placeholder="Informations sur ce document..."
          placeholderTextColor="#475569"
          multiline
          value={description}
          onChangeText={setDescription}
          maxLength={500}
        />
      </View>

      <TouchableOpacity
        style={[styles.filePicker, file && styles.fileSelected]}
        onPress={pickDocument}
      >
        {file ? (
          <View style={styles.selectedRow}>
            <CheckCircle color={COLORS.primary} size={28} />
            <View style={styles.fileDetails}>
              <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
              <Text style={styles.fileSize}>{(file.size / 1024 / 1024).toFixed(2)} MB</Text>
            </View>
            <TouchableOpacity onPress={() => setFile(null)}>
              <XCircle color="#EF4444" size={22} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.pickerInner}>
            <UploadCloud color="#94A3B8" size={32} />
            <Text style={styles.pickerText}>PDF, DOCX, XLSX, TXT — Max 50 MB</Text>
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.mainBtn, (uploading || !title.trim() || !file) && styles.btnDisabled]}
        onPress={handleUpload}
        disabled={uploading || !title.trim() || !file}
      >
        {uploading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <>
            <FilePlus color="#FFF" size={20} style={{ marginRight: 10 }} />
            <Text style={styles.btnText}>Publier dans la bibliothèque</Text>
          </>
        )}
      </TouchableOpacity>

      <View style={styles.divider} />
      <Text style={styles.listTitle}>Documents existants ({existingResources.length})</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconCircle}>
          <ArrowLeft color="#FFF" size={22} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Gestionnaire Bibliothèque</Text>
      </View>

      <FlatList
        data={existingResources}
        keyExtractor={item => item._id}
        ListHeaderComponent={renderHeader}
        renderItem={({ item }) => (
          <View style={styles.resourceCard}>
            <View style={styles.resIcon}>
              <FileText color={COLORS.primary} size={20} />
            </View>
            <View style={styles.resMeta}>
              <Text style={styles.resTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.resInfo}>
                {String(item.type || 'document').toUpperCase()} • {item.size || '?'}
              </Text>
            </View>
            <TouchableOpacity onPress={() => handleDelete(item._id)} style={styles.trashBtn}>
              <Trash2 color="#EF4444" size={18} />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          !loadingList && (
            <Text style={styles.empty}>Aucun document dans ce dossier.</Text>
          )
        }
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#020617' },
  topBar:       { flexDirection: 'row', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#1E293B' },
  iconCircle:   { backgroundColor: '#1E293B', padding: 10, borderRadius: 12 },
  topTitle:     { color: '#FFF', fontSize: 18, fontWeight: '800', marginLeft: 15 },
  formSection:  { padding: 20 },
  infoCard:     { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F172A', padding: 12, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: '#1E293B' },
  targetLabel:  { color: '#94A3B8', fontSize: 13, marginLeft: 10 },
  targetName:   { color: COLORS.primary, fontWeight: '700' },
  inputGroup:   { marginBottom: 20 },
  label:        { color: '#64748B', fontSize: 11, fontWeight: '800', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  input:        { backgroundColor: '#0F172A', borderRadius: 14, padding: 15, color: '#FFF', borderWidth: 1, borderColor: '#1E293B', fontSize: 14 },
  filePicker:   { height: 110, borderRadius: 16, borderStyle: 'dashed', borderWidth: 2, borderColor: '#334155', justifyContent: 'center', alignItems: 'center', backgroundColor: '#020617', marginBottom: 25 },
  fileSelected: { borderStyle: 'solid', borderColor: COLORS.primary, backgroundColor: '#0F172A' },
  pickerInner:  { alignItems: 'center' },
  pickerText:   { color: '#64748B', fontSize: 12, marginTop: 8, fontWeight: '600' },
  selectedRow:  { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, width: '100%' },
  fileDetails:  { flex: 1, marginLeft: 15 },
  fileName:     { color: '#F1F5F9', fontWeight: '700', fontSize: 14 },
  fileSize:     { color: '#64748B', fontSize: 12, marginTop: 2 },
  mainBtn:      { height: 58, backgroundColor: COLORS.primary, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  btnText:      { color: '#FFF', fontWeight: '800', fontSize: 15 },
  btnDisabled:  { opacity: 0.4 },
  divider:      { height: 1, backgroundColor: '#1E293B', marginVertical: 30 },
  listTitle:    { color: '#FFF', fontSize: 16, fontWeight: '800', marginBottom: 15 },
  resourceCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F172A', marginHorizontal: 20, padding: 15, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#1E293B' },
  resIcon:      { backgroundColor: '#020617', padding: 10, borderRadius: 12 },
  resMeta:      { flex: 1, marginLeft: 15 },
  resTitle:     { color: '#FFF', fontWeight: '600', fontSize: 14 },
  resInfo:      { color: '#64748B', fontSize: 10, marginTop: 4, fontWeight: '700' },
  trashBtn:     { padding: 10, backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: 10 },
  empty:        { color: '#475569', textAlign: 'center', marginTop: 20, paddingHorizontal: 20, fontStyle: 'italic' },
  backBtnLocked:{ marginTop: 30, backgroundColor: COLORS.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
});