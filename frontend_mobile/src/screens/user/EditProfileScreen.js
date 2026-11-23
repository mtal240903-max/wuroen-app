import React, { useState, useContext, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ActivityIndicator, Alert, Platform, Image, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Image as ImageIcon, Pencil, Check, X } from 'lucide-react-native';

import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { COLORS } from '../../theme/theme';

export default function EditProfileScreen({ navigation }) {
  const { user, updateUserProfileLocal } = useContext(AuthContext);

  // 📸 Base URL propre
  const baseUrl = api.defaults.baseURL?.endsWith('/') ? api.defaults.baseURL.slice(0, -1) : api.defaults.baseURL;
  
  const initialAvatar = user?.avatar 
    ? (user.avatar.startsWith('http') ? user.avatar : `${baseUrl}${user.avatar.startsWith('/') ? user.avatar : '/' + user.avatar}`)
    : null;

  const [avatarUri, setAvatarUri] = useState(initialAvatar);
  const [uploading, setUploading] = useState(false);

  // 📝 États stables synchronisés avec le contexte de l'utilisateur
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || user?.name?.split(' ')[0] || '',
    lastName: user?.lastName || user?.name?.split(' ').slice(1).join(' ') || '',
    specialty: user?.specialty || '',
    birthDate: user?.birthDate || '',
    location: user?.location || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
  });

  // Effect pour maintenir l'état local à jour si le contexte global change en arrière-plan
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || user.name?.split(' ')[0] || '',
        lastName: user.lastName || user.name?.split(' ').slice(1).join(' ') || '',
        specialty: user.specialty || '',
        birthDate: user.birthDate || '',
        location: user.location || '',
        phone: user.phone || '',
        bio: user.bio || '',
      });
      if (user.avatar) {
        const currentAvatar = user.avatar.startsWith('http') ? user.avatar : `${baseUrl}${user.avatar.startsWith('/') ? user.avatar : '/' + user.avatar}`;
        setAvatarUri(currentAvatar);
      }
    }
  }, [user]);

  const [editingField, setEditingField] = useState(null);
  const [tempValue, setTempValue] = useState('');
  const [savingField, setSavingField] = useState(false);

  // 📸 Upload de l'avatar autonome
  const processImageSelection = async (result) => {
    if (result.canceled || !result.assets || result.assets.length === 0) return;
    const selectedImage = result.assets[0];
    
    setAvatarUri(selectedImage.uri);
    setUploading(true);

    const formData = new FormData();
    formData.append('avatar', {
      uri: Platform.OS === 'ios' ? selectedImage.uri.replace('file://', '') : selectedImage.uri,
      type: 'image/jpeg',
      name: `avatar-${user?.id || 'profile'}.jpg`,
    });

    try {
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      const res = await api.post('/users/upload-avatar', formData, config);
      const updatedAvatarUrl = res.data?.avatar || res.data?.user?.avatar;
      
      if (updatedAvatarUrl) {
        const finalUrl = updatedAvatarUrl.startsWith('http') ? updatedAvatarUrl : `${baseUrl}${updatedAvatarUrl.startsWith('/') ? updatedAvatarUrl : '/' + updatedAvatarUrl}?t=${Date.now()}`;
        setAvatarUri(finalUrl);
        if (updateUserProfileLocal) updateUserProfileLocal({ avatar: updatedAvatarUrl });
        Alert.alert("Succès", "Photo de profil mise à jour.");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Erreur", "Impossible de synchroniser l'image.");
      setAvatarUri(initialAvatar);
    } finally {
      setUploading(false);
    }
  };

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return Alert.alert("Permission requise", "Accès galerie nécessaire.");
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.7 });
    await processImageSelection(result);
  };

  const handleLaunchCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return Alert.alert("Permission requise", "Accès appareil photo nécessaire.");
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.7 });
    await processImageSelection(result);
  };

  const startEditing = (fieldName, currentValue) => {
    setEditingField(fieldName);
    setTempValue(currentValue);
  };

  const cancelEditing = () => {
    setEditingField(null);
    setTempValue('');
  };

  // 💾 Enregistrement individuel persistant
  // 💾 Enregistrement individuel persistant et synchronisé
  const saveSingleField = async (fieldName) => {
    if ((fieldName === 'firstName' || fieldName === 'lastName') && !tempValue.trim()) {
      Alert.alert("Champs requis", "Ce champ ne peut pas être vide.");
      return;
    }

    setSavingField(true);
    
    const updatedValue = tempValue.trim();
    const updatedData = { ...profileData, [fieldName]: updatedValue };
    const fullName = `${updatedData.firstName} ${updatedData.lastName}`.trim();

    // Le payload doit contenir TOUTES les clés pour le serveur ET le state global
    const payload = {
      ...user, // On garde les anciennes valeurs du user global (comme l'ID, email, etc.)
      name: fullName,
      firstName: updatedData.firstName, 
      lastName: updatedData.lastName,   
      specialty: updatedData.specialty,
      birthDate: updatedData.birthDate,
      location: updatedData.location,
      phone: updatedData.phone,
      bio: updatedData.bio
    };

    try {
      // 1. Envoi au serveur API
      await api.put('/users/me/profile', {
        name: fullName,
        firstName: updatedData.firstName,
        lastName: updatedData.lastName,
        specialty: updatedData.specialty,
        birthDate: updatedData.birthDate,
        location: updatedData.location,
        phone: updatedData.phone,
        bio: updatedData.bio
      });

      // 2. Mise à jour immédiate de l'état du formulaire local
      setProfileData(updatedData);
      
      // 3. Mise à jour du Contexte Global (permet aux autres écrans de voir le changement)
      if (updateUserProfileLocal) {
        updateUserProfileLocal(payload);
      }

      setEditingField(null);
    } catch (err) {
      console.error(err);
      Alert.alert("Erreur", "Impossible d'enregistrer la modification.");
    } finally {
      setSavingField(false);
    }
  };

  const EditableRow = ({ label, fieldName, value, placeholder, keyboardType = 'default', multiline = false }) => {
    const isCurrentEditing = editingField === fieldName;

    return (
      <View style={styles.rowContainer}>
        <View style={styles.rowHeader}>
          <Text style={styles.inputLabel}>{label}</Text>
          
          {!isCurrentEditing ? (
            <TouchableOpacity onPress={() => startEditing(fieldName, value)} hitSlop={10}>
              <Pencil size={16} color="#475569" />
            </TouchableOpacity>
          ) : (
            <View style={styles.actionButtonsGroup}>
              {savingField ? (
                <ActivityIndicator size="small" color="#10B981" />
              ) : (
                <>
                  <TouchableOpacity onPress={() => saveSingleField(fieldName)} style={styles.actionBtnCheck} hitSlop={10}>
                    <Check size={16} color="#10B981" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={cancelEditing} style={styles.actionBtnX} hitSlop={10}>
                    <X size={16} color="#EF4444" />
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}
        </View>

        {isCurrentEditing ? (
          <TextInput
            style={[styles.inputField, multiline && styles.textArea]}
            value={tempValue}
            onChangeText={setTempValue}
            placeholder={placeholder}
            placeholderTextColor="#334155"
            keyboardType={keyboardType}
            multiline={multiline}
            autoFocus
          />
        ) : (
          <Text style={[styles.valueText, !value && styles.placeholderText]}>
            {value || placeholder}
          </Text>
        )}
        <View style={styles.divider} />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <Text style={styles.screenTitle}>À PROPOS</Text>

        <View style={styles.avatarSection}>
          <TouchableOpacity style={styles.circleActionBtn} onPress={handlePickImage} activeOpacity={0.8}>
            <ImageIcon size={20} color="#FFF" />
            <Text style={styles.circleBtnText}>GALERIE</Text>
          </TouchableOpacity>

          <View style={styles.avatarOuterRing}>
            <View style={styles.avatarCore}>
              {uploading ? (
                <ActivityIndicator size="small" color={COLORS.primary || '#00AEEF'} />
              ) : avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarLetter}>{profileData.firstName ? profileData.firstName.charAt(0).toUpperCase() : "?"}</Text>
              )}
            </View>
          </View>

          <TouchableOpacity style={styles.circleActionBtn} onPress={handleLaunchCamera} activeOpacity={0.8}>
            <Camera size={20} color="#FFF" />
            <Text style={styles.circleBtnText}>APPAREIL</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formContainer}>
          <EditableRow label="Prénom" fieldName="firstName" value={profileData.firstName} placeholder="Ajouter votre prénom" />
          <EditableRow label="Nom" fieldName="lastName" value={profileData.lastName} placeholder="Ajouter votre nom" />
          <EditableRow label="Spécialité / Emploi" fieldName="specialty" value={profileData.specialty} placeholder="Ex: Technicien en Production Animale" />
          <EditableRow label="Date de naissance" fieldName="birthDate" value={profileData.birthDate} placeholder="Ajouter JJ/MM/AAAA" keyboardType="numeric" />
          <EditableRow label="Localisation (Ville, Pays)" fieldName="location" value={profileData.location} placeholder="Ex: Cotonou, Bénin" />
          <EditableRow label="Coordonnées / Téléphone" fieldName="phone" value={profileData.phone} placeholder="Ex: +229 XX XX XX XX" keyboardType="phone-pad" />
          <EditableRow label="Biographie" fieldName="bio" value={profileData.bio} placeholder="Parlez-nous de vous..." multiline={true} />
        </View>
        
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  scrollContent: { paddingHorizontal: 20, alignItems: 'center', paddingTop: 20, paddingBottom: 40 },
  screenTitle: { color: '#FFF', fontSize: 16, fontWeight: '800', letterSpacing: 1.5, marginBottom: 25 },
  avatarSection: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 15, marginBottom: 35, width: '100%' },
  circleActionBtn: { width: 68, height: 68, borderRadius: 34, backgroundColor: '#1E40AF', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#2563EB' },
  circleBtnText: { color: '#FFF', fontSize: 7, fontWeight: '900', marginTop: 4 },
  avatarOuterRing: { width: 110, height: 110, borderRadius: 55, borderWidth: 2, borderColor: 'rgba(0, 174, 239, 0.2)', padding: 4, justifyContent: 'center', alignItems: 'center' },
  avatarCore: { width: '100%', height: '100%', borderRadius: 50, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  avatarImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  avatarLetter: { color: '#475569', fontSize: 34, fontWeight: '900' },
  formContainer: { width: '100%', paddingHorizontal: 4 },
  rowContainer: { width: '100%', marginBottom: 18 },
  rowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  inputLabel: { color: '#475569', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  valueText: { color: '#FFF', fontSize: 15, fontWeight: '500', paddingVertical: 4 },
  placeholderText: { color: '#334155', fontStyle: 'italic', fontSize: 14 },
  inputField: { width: '100%', height: 44, backgroundColor: '#0F172A', borderRadius: 8, borderWidth: 1, borderColor: '#2563EB', paddingHorizontal: 12, color: '#FFF', fontSize: 15 },
  textArea: { height: 80, textAlignVertical: 'top', paddingVertical: 8 },
  divider: { height: 1, backgroundColor: '#1E293B', marginTop: 10 },
  actionButtonsGroup: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  actionBtnCheck: { padding: 2 },
  actionBtnX: { padding: 2 }
});