import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { X, Upload } from 'lucide-react-native';

export const ActivityModal = ({ visible, onClose, value, onChangeText, onSubmit }) => (
  <Modal visible={visible} transparent animationType="fade">
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Créer une activité</Text>
          <TouchableOpacity onPress={onClose}><X size={20} color="#FFF" /></TouchableOpacity>
        </View>
        <TextInput
          style={[styles.modalInput, styles.textArea]}
          placeholder="Description de l'activité..."
          placeholderTextColor="#64748B"
          value={value}
          onChangeText={onChangeText}
          multiline
        />
        <TouchableOpacity style={styles.modalSubmitBtn} onPress={onSubmit}>
          <Text style={styles.modalSubmitText}>Enregistrer</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

export const DocumentModal = ({ visible, onClose, value, onChangeText, onSubmit }) => (
  <Modal visible={visible} transparent animationType="fade">
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Importer un document</Text>
          <TouchableOpacity onPress={onClose}><X size={20} color="#FFF" /></TouchableOpacity>
        </View>
        <TextInput
          style={styles.modalInput}
          placeholder="Nom ou titre du document..."
          placeholderTextColor="#64748B"
          value={value}
          onChangeText={onChangeText}
        />
        <TouchableOpacity style={[styles.modalSubmitBtn, styles.rowSubmitBtn]} onPress={onSubmit}>
          <Upload size={16} color="#FFF" style={{ marginRight: 8 }} />
          <Text style={styles.modalSubmitText}>Importer</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#111726',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalInput: {
    backgroundColor: '#090D1A',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalSubmitBtn: {
    backgroundColor: '#6366F1',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowSubmitBtn: {
    flexDirection: 'row',
  },
  modalSubmitText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});