import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TouchableWithoutFeedback } from 'react-native';
import { Mail, BellOff, Archive, Trash2 } from 'lucide-react-native';

export default function ActionSheet({ visible, onClose, onAction, selectedChat }) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            {/* Indicateur visuel de drag */}
            <View style={styles.dragHandle} />
            
            <Text style={styles.sheetTitle}>
              Options pour {selectedChat?.contact?.name || 'la discussion'}
            </Text>

            <TouchableOpacity style={styles.option} onPress={() => onAction('unread')}>
              <Mail size={22} color="#FFF" />
              <Text style={styles.optionText}>Marquer comme non lu</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.option} onPress={() => onAction('mute')}>
              <BellOff size={22} color="#FFF" />
              <Text style={styles.optionText}>Mettre en sourdine</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.option} onPress={() => onAction('archive')}>
              <Archive size={22} color="#FFF" />
              <Text style={styles.optionText}>Archiver</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.option, styles.deleteOption]} onPress={() => onAction('delete')}>
              <Trash2 size={22} color="#EF4444" />
              <Text style={[styles.optionText, { color: '#EF4444' }]}>Supprimer la conversation</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  sheet: { 
    backgroundColor: '#1E293B', 
    borderTopLeftRadius: 25, 
    borderTopRightRadius: 25, 
    padding: 20,
    paddingBottom: 40 
  },
  dragHandle: { 
    width: 40, 
    height: 5, 
    backgroundColor: '#475569', 
    borderRadius: 10, 
    alignSelf: 'center', 
    marginBottom: 20 
  },
  sheetTitle: { color: '#64748B', fontSize: 13, textAlign: 'center', marginBottom: 20, fontWeight: '600' },
  option: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15 },
  optionText: { color: '#FFF', fontSize: 16, marginLeft: 15, fontWeight: '500' },
  deleteOption: { marginTop: 10, borderTopWidth: 1, borderTopColor: '#334155', paddingTop: 20 }
});