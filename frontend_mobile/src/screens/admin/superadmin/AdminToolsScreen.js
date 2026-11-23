import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, TextInput, StatusBar, Alert, Image 
} from 'react-native';
import { Plus, Trash2, Edit3, ArrowLeft, Image as ImageIcon, X } from 'lucide-react-native';
import axios from 'axios';

export default function AdminToolsScreen({ navigation }) {
  const [tools, setTools] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [actionUrl, setActionUrl] = useState('');
  const [logo, setLogo] = useState('');
  const [status, setStatus] = useState('active');
  const [actionType, setActionType] = useState('internal');
  const [editingId, setEditingId] = useState(null);

  // Charger la liste des outils depuis le backend
  const fetchTools = async () => {
    try {
      const response = await axios.get('/api/tools');
      setTools(response.data);
    } catch (error) {
      console.error("Erreur chargement outils:", error);
    }
  };

  useEffect(() => {
    fetchTools();
  }, []);

  // Réinitialiser le formulaire
  const resetForm = () => {
    setName('');
    setDescription('');
    setCategory('');
    setActionUrl('');
    setLogo('');
    setStatus('active');
    setActionType('internal');
    setEditingId(null);
  };

  // Enregistrer ou Mettre à jour un outil
  const handleSaveTool = async () => {
    if (!name.trim() || !description.trim() || !category.trim() || !actionUrl.trim() || !logo.trim()) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs obligatoires (y compris le lien du logo).");
      return;
    }

    try {
      const toolData = { name, description, category, actionUrl, logo, status, actionType };

      if (editingId) {
        await axios.put(`/api/tools/${editingId}`, toolData);
        Alert.alert("Succès", "Outil mis à jour avec succès.");
      } else {
        await axios.post('/api/tools', toolData);
        Alert.alert("Succès", "Outil créé avec succès.");
      }

      resetForm();
      fetchTools();
    } catch (error) {
      Alert.alert("Erreur", error.response?.data?.message || "Une erreur est survenue.");
    }
  };

  // Préparer la modification
  const handleEdit = (tool) => {
    setEditingId(tool._id);
    setName(tool.name);
    setDescription(tool.description);
    setCategory(tool.category);
    setActionUrl(tool.actionUrl);
    setLogo(tool.logo || '');
    setStatus(tool.status || 'active');
    setActionType(tool.actionType || 'internal');
  };

  // Supprimer un outil
  const handleDelete = async (id) => {
    Alert.alert(
      "Confirmation",
      "Voulez-vous vraiment supprimer cet outil de la vitrine ?",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Supprimer", 
          style: "destructive",
          onPress: async () => {
            try {
              await axios.delete(`/api/tools/${id}`);
              fetchTools();
              if (editingId === id) resetForm();
            } catch (error) {
              Alert.alert("Erreur", "Impossible de supprimer l'outil.");
            }
          } 
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* HEADER */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft color="#F8FAFC" size={20} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Gestion des Outils (Super Admin)</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* FORMULAIRE D'AJOUT / MODIFICATION */}
        <View style={styles.formCard}>
          <View style={styles.formHeaderRow}>
            <Text style={styles.formTitle}>
              {editingId ? "Modifier l'application / outil" : "Ajouter une nouvelle application"}
            </Text>
            {editingId && (
              <TouchableOpacity onPress={resetForm} style={styles.cancelEditBtn}>
                <X color="#94A3B8" size={16} />
                <Text style={styles.cancelEditText}>Annuler</Text>
              </TouchableOpacity>
            )}
          </View>

          <TextInput 
            style={styles.input}
            placeholder="Nom de l'outil / application"
            placeholderTextColor="#64748B"
            value={name}
            onChangeText={setName}
          />

          <TextInput 
            style={styles.input}
            placeholder="Catégorie (ex: Production, Gestion...)"
            placeholderTextColor="#64748B"
            value={category}
            onChangeText={setCategory}
          />

          <TextInput 
            style={styles.input}
            placeholder="URL ou Route d'action (actionUrl)"
            placeholderTextColor="#64748B"
            value={actionUrl}
            onChangeText={setActionUrl}
          />

          {/* Saisie du lien du logo avec aperçu */}
          <View style={styles.logoInputRow}>
            <View style={[styles.inputWithIconContainer, { flex: 1 }]}>
              <ImageIcon color="#38BDF8" size={18} style={styles.inputIcon} />
              <TextInput 
                style={[styles.input, styles.inputWithIcon, { marginBottom: 0 }]}
                placeholder="URL de l'image du logo"
                placeholderTextColor="#64748B"
                value={logo}
                onChangeText={setLogo}
              />
            </View>
            {logo ? (
              <Image source={{ uri: logo }} style={styles.logoPreview} />
            ) : null}
          </View>

          {/* Sélection du statut */}
          <Text style={styles.labelSelect}>Statut de l'outil :</Text>
          <View style={styles.rowSelector}>
            {['active', 'beta', 'maintenance', 'coming_soon'].map((s) => (
              <TouchableOpacity 
                key={s} 
                style={[styles.selectBtn, status === s && styles.selectBtnActive]}
                onPress={() => setStatus(s)}
              >
                <Text style={[styles.selectBtnText, status === s && styles.selectBtnTextActive]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Sélection du type d'action */}
          <Text style={styles.labelSelect}>Type d'action :</Text>
          <View style={styles.rowSelector}>
            {['internal', 'external', 'download'].map((t) => (
              <TouchableOpacity 
                key={t} 
                style={[styles.selectBtn, actionType === t && styles.selectBtnActive]}
                onPress={() => setActionType(t)}
              >
                <Text style={[styles.selectBtnText, actionType === t && styles.selectBtnTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput 
            style={[styles.input, styles.textArea]}
            placeholder="Description détaillée"
            placeholderTextColor="#64748B"
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <TouchableOpacity style={styles.submitButton} onPress={handleSaveTool}>
            <Plus color="#FFF" size={18} />
            <Text style={styles.submitButtonText}>
              {editingId ? "Mettre à jour l'application" : "Créer l'application"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* LISTE DES APPLICATIONS EXISTANTES AVEC ACTIONS */}
        <View style={styles.listSection}>
          <Text style={styles.sectionLabel}>APPLICATIONS ENREGISTRÉES ({tools.length})</Text>

          {tools.map((tool) => (
            <View key={tool._id} style={styles.toolItem}>
              {tool.logo ? (
                <Image source={{ uri: tool.logo }} style={styles.itemListLogo} />
              ) : null}

              <View style={styles.toolInfo}>
                <Text style={styles.toolName}>{tool.name}</Text>
                <Text style={styles.toolCategory}>
                  {tool.category} • <Text style={{color: '#38BDF8'}}>{tool.status}</Text> ({tool.actionType})
                </Text>
                <Text style={styles.toolUrl} numberOfLines={1}>{tool.actionUrl}</Text>
              </View>

              {/* Boutons Modifier & Supprimer */}
              <View style={styles.toolActions}>
                <TouchableOpacity onPress={() => handleEdit(tool)} style={styles.actionEdit}>
                  <Edit3 color="#38BDF8" size={18} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(tool._id)} style={styles.actionDelete}>
                  <Trash2 color="#EF4444" size={18} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#1E293B' },
  backButton: { padding: 8, backgroundColor: '#0F172A', borderRadius: 12, marginRight: 15 },
  topTitle: { fontSize: 16, fontWeight: '800', color: '#F8FAFC' },
  content: { padding: 20 },
  formCard: { backgroundColor: '#0F172A', padding: 20, borderRadius: 24, borderWidth: 1, borderColor: '#1E293B', marginBottom: 30 },
  formHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  formTitle: { fontSize: 15, fontWeight: '800', color: '#38BDF8' },
  cancelEditBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#1E293B', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  cancelEditText: { color: '#94A3B8', fontSize: 11, fontWeight: '700' },
  input: { backgroundColor: '#020617', borderWidth: 1, borderColor: '#1E293B', borderRadius: 12, paddingHorizontal: 15, paddingVertical: 12, color: '#F8FAFC', fontSize: 14, marginBottom: 12 },
  logoInputRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  inputWithIconContainer: { position: 'relative', justifyContent: 'center' },
  inputIcon: { position: 'absolute', left: 15, zIndex: 1 },
  inputWithIcon: { paddingLeft: 45 },
  logoPreview: { width: 44, height: 44, borderRadius: 10, borderWidth: 1, borderColor: '#38BDF8', backgroundColor: '#020617' },
  textArea: { height: 80, textAlignVertical: 'top' },
  labelSelect: { fontSize: 12, fontWeight: '700', color: '#94A3B8', marginBottom: 6, marginTop: 4 },
  rowSelector: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  selectBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#020617', borderWidth: 1, borderColor: '#1E293B' },
  selectBtnActive: { backgroundColor: '#06B6D4', borderColor: '#06B6D4' },
  selectBtnText: { fontSize: 11, color: '#64748B', fontWeight: '700' },
  selectBtnTextActive: { color: '#FFF' },
  submitButton: { backgroundColor: '#06B6D4', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 15, borderRadius: 14, gap: 8, marginTop: 10 },
  submitButtonText: { color: '#FFF', fontWeight: '800', fontSize: 14 },
  listSection: { gap: 12 },
  sectionLabel: { fontSize: 11, fontWeight: '800', color: '#475569', letterSpacing: 1.5, marginBottom: 5, paddingLeft: 5 },
  toolItem: { backgroundColor: '#0F172A', flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 18, borderWidth: 1, borderColor: '#1E293B', marginBottom: 10 },
  itemListLogo: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#1E293B', marginRight: 12 },
  toolInfo: { flex: 1 },
  toolName: { fontSize: 15, fontWeight: '800', color: '#F8FAFC' },
  toolCategory: { fontSize: 11, fontWeight: '700', color: '#94A3B8', marginTop: 2 },
  toolUrl: { fontSize: 12, color: '#64748B', marginTop: 4 },
  toolActions: { flexDirection: 'row', gap: 8 },
  actionEdit: { backgroundColor: '#020617', padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#1E293B' },
  actionDelete: { backgroundColor: '#020617', padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#1E293B' }
});