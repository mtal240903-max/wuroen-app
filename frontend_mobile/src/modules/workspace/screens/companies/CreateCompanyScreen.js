import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Switch, ActivityIndicator, Alert, Image } from 'react-native';
import { ArrowLeft, Building2, MapPin, Wallet, Users, FileText, Image as ImageIcon, Camera } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker'; 
import { useCompany } from '../../context/CompanyContext';

export default function CreateCompanyScreen({ navigation }) {
  const { createCompany } = useCompany();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('Association');
  const [sector, setSector] = useState('Production Animale');
  const [location, setLocation] = useState('');
  const [investment, setInvestment] = useState('');
  const [employees, setEmployees] = useState('');
  const [website, setWebsite] = useState('');
  
  // États séparés pour la couverture et le logo
  const [bgImageUri, setBgImageUri] = useState('');
  const [logoUri, setLogoUri] = useState('');

  const [isPublic, setIsPublic] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const types = [
    'Association', 
    'Entreprise Individuelle', 
    'ONG',
    'Organisation',
    'Société', 
    'Exploitation / Ferme',
    'Laboratoire / Centre'
  ];

  const sectors = [
    'Production Animale', 
    'Élevage', 
    'Agronomie', 
    'Santé', 
    'Commerce', 
    'Agri-Tech', 
    'R&D / Science', 
    'Tech / Dév',
    'Primaire',
    'Secondaire',
    'Tertiaire'
  ];

  // Fonction générique pour sélectionner une image
  const pickImage = async (typeTarget) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission requise', 'L\'autorisation d\'accéder aux photos est nécessaire.');
      return;
    }

    const aspect = typeTarget === 'logo' ? [1, 1] : [16, 9];

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], 
      allowsEditing: true, 
      aspect: aspect, 
      quality: 0.7,
    });

    if (!result.canceled) {
      if (typeTarget === 'logo') {
        setLogoUri(result.assets[0].uri);
      } else {
        setBgImageUri(result.assets[0].uri);
      }
    }
  };

  const handleCreate = async () => {
    if (!name.trim() || !description.trim() || !location.trim()) {
      Alert.alert('Champs requis', 'Veuillez remplir les informations obligatoires.');
      return;
    }

    setIsSubmitting(true);
    try {
      const companyData = {
        name: name.trim(),
        description: description.trim(),
        type: type, 
        sector: sector,
        location: location.trim(),
        investment: investment.trim() || '0M',
        staffCount: parseInt(employees.trim(), 10) || 0,
        website: website.trim() || '',
        isPublic: isPublic,
        status: 'active',
        bgImage: bgImageUri || '',
        logo: logoUri || '' // Ajout du logo dans l'objet envoyé
      };

      await createCompany(companyData); 
      
      Alert.alert('Succès 🎉', 'Structure enregistrée avec succès !');
      navigation.goBack();
      
    } catch (error) {
      console.log("Erreur API :", error.message);
      Alert.alert('Erreur', error.message || "La structure n'a pas pu être créée.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} disabled={isSubmitting}>
          <ArrowLeft color="#FFF" size={24} />
        </TouchableOpacity>
        <View style={styles.navTitleContainer}>
          <Text style={styles.navTitle}>Nouvelle Structure 🏢</Text>
          <Text style={styles.navSubtitle}>Ajouter une entité à votre compte</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Section Visuels : Couverture & Logo */}
        <Text style={styles.inputLabel}>Visuels de l'organisation</Text>
        
        {/* 1. Photo de couverture (16:9) */}
        <TouchableOpacity style={styles.imagePickerContainer} onPress={() => pickImage('bg')}>
          {bgImageUri ? (
            <Image source={{ uri: bgImageUri }} style={styles.previewImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <ImageIcon color="#64748B" size={24} />
              <Text style={styles.imagePlaceholderText}>Sélectionner une photo de couverture (16:9)</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* 2. Logo (Rond/Carré 1:1) */}
        <View style={styles.logoSectionContainer}>
          <TouchableOpacity style={styles.logoPickerContainer} onPress={() => pickImage('logo')}>
            {logoUri ? (
              <Image source={{ uri: logoUri }} style={styles.previewLogo} />
            ) : (
              <View style={styles.logoPlaceholder}>
                <Camera color="#64748B" size={20} />
              </View>
            )}
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.logoLabelTitle}>Logo de l'organisation</Text>
            <Text style={styles.logoLabelSubtitle}>Format carré ou rond recommandé</Text>
          </View>
        </View>

        <Text style={styles.inputLabel}>Nom de l'organisation *</Text>
        <View style={styles.inputContainer}>
          <Building2 color="#64748B" size={18} style={styles.inputIcon} />
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Ex: MTaL Production" placeholderTextColor="#64748B" />
        </View>

        <Text style={styles.inputLabel}>Description *</Text>
        <View style={[styles.inputContainer, styles.textAreaContainer]}>
          <FileText color="#64748B" size={18} style={[styles.inputIcon, { marginTop: 12 }]} />
          <TextInput style={[styles.input, styles.textArea]} multiline numberOfLines={3} value={description} onChangeText={setDescription} placeholder="Décrivez les objectifs..." placeholderTextColor="#64748B" />
        </View>

        <Text style={styles.inputLabel}>Type d'entité</Text>
        <View style={styles.sectorRow}>
          {types.map((t) => (
            <TouchableOpacity key={t} style={[styles.sectorBadge, type === t && styles.sectorBadgeActive]} onPress={() => setType(t)}>
              <Text style={[styles.sectorText, type === t && styles.sectorTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.inputLabel}>Secteur technique</Text>
        <View style={styles.sectorRow}>
          {sectors.map((s) => (
            <TouchableOpacity key={s} style={[styles.sectorBadge, sector === s && styles.sectorBadgeActive]} onPress={() => setSector(s)}>
              <Text style={[styles.sectorText, sector === s && styles.sectorTextActive]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.inputLabel}>Localisation *</Text>
        <View style={styles.inputContainer}>
          <MapPin color="#64748B" size={18} style={styles.inputIcon} />
          <TextInput style={styles.input} value={location} onChangeText={setLocation} placeholder="Ex: Parakou, Bénin" placeholderTextColor="#64748B" />
        </View>

        <View style={styles.rowBetween}>
          <View style={{ width: '48%' }}>
            <Text style={styles.inputLabel}>Budget</Text>
            <View style={styles.inputContainer}><Wallet color="#64748B" size={18} style={styles.inputIcon} /><TextInput style={styles.input} value={investment} onChangeText={setInvestment} placeholder="15M FCFA" placeholderTextColor="#64748B" /></View>
          </View>
          <View style={{ width: '48%' }}>
            <Text style={styles.inputLabel}>Intervenants</Text>
            <View style={styles.inputContainer}><Users color="#64748B" size={18} style={styles.inputIcon} /><TextInput style={styles.input} keyboardType="numeric" value={employees} onChangeText={setEmployees} placeholder="5" placeholderTextColor="#64748B" /></View>
          </View>
        </View>

        <View style={styles.switchContainer}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={styles.switchTitle}>Visibilité publique</Text>
          </View>
          <Switch value={isPublic} onValueChange={setIsPublic} trackColor={{ true: '#6366F1' }} />
        </View>

        <TouchableOpacity style={styles.submitBtn} onPress={handleCreate} disabled={isSubmitting}>
          <LinearGradient colors={['#6366F1', '#4F46E5']} style={styles.submitGradient}>
            {isSubmitting ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitBtnText}>Créer la structure</Text>}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090D1A', paddingTop: 50 },
  navbar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 25 },
  navTitleContainer: { marginLeft: 16 },
  navTitle: { fontSize: 20, fontWeight: '800', color: '#FFF' },
  navSubtitle: { fontSize: 12, color: '#64748B' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
  inputLabel: { color: '#94A3B8', fontSize: 13, fontWeight: '600', marginBottom: 8, marginTop: 12 },
  
  // Couverture
  imagePickerContainer: { width: '100%', height: 130, backgroundColor: '#111726', borderWidth: 1, borderStyle: 'dashed', borderColor: '#334155', borderRadius: 16, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  previewImage: { width: '100%', height: '100%' },
  imagePlaceholder: { alignItems: 'center' },
  imagePlaceholderText: { color: '#64748B', fontSize: 12, marginTop: 6 },

  // Logo (Rond)
  logoSectionContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, backgroundColor: '#111726', padding: 10, borderRadius: 16, borderWidth: 1, borderColor: '#1E293B' },
  logoPickerContainer: { width: 65, height: 65, backgroundColor: '#1E293B', borderRadius: 32.5, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  previewLogo: { width: '100%', height: '100%' },
  logoPlaceholder: { justifyContent: 'center', alignItems: 'center' },
  logoLabelTitle: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  logoLabelSubtitle: { color: '#64748B', fontSize: 11, marginTop: 2 },

  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111726', borderWidth: 1, borderColor: '#1E293B', borderRadius: 14, height: 48, paddingHorizontal: 12, marginBottom: 12 },
  textAreaContainer: { height: 90, alignItems: 'flex-start' },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: '#F1F5F9' },
  textArea: { textAlignVertical: 'top', paddingVertical: 10 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between' },
  sectorRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  sectorBadge: { backgroundColor: '#111726', borderWidth: 1, borderColor: '#1E293B', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 8, marginBottom: 8 },
  sectorBadgeActive: { backgroundColor: '#6366F1', borderColor: '#6366F1' },
  sectorText: { color: '#94A3B8', fontSize: 12, fontWeight: '600' },
  sectorTextActive: { color: '#FFF' },
  switchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111726', padding: 14, borderRadius: 16, marginVertical: 20 },
  switchTitle: { color: '#FFF', fontWeight: '700' },
  submitBtn: { height: 48, borderRadius: 14, overflow: 'hidden', marginTop: 10 },
  submitGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  submitBtnText: { color: '#FFF', fontWeight: '700' }
});