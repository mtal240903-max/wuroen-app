import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TouchableWithoutFeedback } from 'react-native';
import { Mail, MailOpen, BellOff, Bell, Archive, Trash2 } from 'lucide-react-native';
import { COLORS } from '../../theme/theme';

export default function ChatActionSheet({ visible, onClose, onAction, selectedChat }) {
  // Récupération dynamique des états de la discussion sélectionnée
  const isMuted = selectedChat?.isMuted || false;
  const hasUnread = (selectedChat?.unreadCount || 0) > 0;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.sheet}>
              <View style={styles.dragHandle} />
              
              <Text style={styles.sheetTitle}>
                Options pour {selectedChat?.name || 'la discussion'}
              </Text>

              {/* ✅ Option Dynamique : Marquer comme lu / non lu */}
              <TouchableOpacity 
                style={styles.option} 
                onPress={() => onAction(hasUnread ? 'read' : 'unread')}
              >
                <View style={[styles.iconContainer, { backgroundColor: '#1E293B' }]}>
                  {hasUnread ? (
                    <MailOpen size={20} color={COLORS.primary} />
                  ) : (
                    <Mail size={20} color="#FFF" />
                  )}
                </View>
                <Text style={styles.optionText}>
                  {hasUnread ? "Marquer comme lu" : "Marquer comme non lu"}
                </Text>
              </TouchableOpacity>

              {/* ✅ Option Dynamique : Sourdine / Activer */}
              <TouchableOpacity style={styles.option} onPress={() => onAction('mute')}>
                <View style={[styles.iconContainer, { backgroundColor: '#1E293B' }]}>
                  {isMuted ? (
                    <Bell size={20} color={COLORS.primary} />
                  ) : (
                    <BellOff size={20} color="#FFF" />
                  )}
                </View>
                <Text style={styles.optionText}>
                  {isMuted ? "Activer les notifications" : "Mettre en sourdine"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.option} onPress={() => onAction('archive')}>
                <View style={[styles.iconContainer, { backgroundColor: '#1E293B' }]}>
                  <Archive size={20} color="#FFF" />
                </View>
                <Text style={styles.optionText}>Archiver</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.option, styles.deleteOption]} onPress={() => onAction('delete')}>
                <View style={[styles.iconContainer, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                  <Trash2 size={20} color="#EF4444" />
                </View>
                <Text style={[styles.optionText, { color: '#EF4444' }]}>Supprimer la conversation</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(2, 6, 23, 0.85)', justifyContent: 'flex-end' },
  sheet: { 
    backgroundColor: '#0F172A', 
    borderTopLeftRadius: 30, 
    borderTopRightRadius: 30, 
    padding: 20,
    paddingBottom: 45,
    borderWidth: 1,
    borderColor: '#1E293B'
  },
  dragHandle: { 
    width: 40, 
    height: 4, 
    backgroundColor: '#334155', 
    borderRadius: 10, 
    alignSelf: 'center', 
    marginBottom: 25 
  },
  sheetTitle: { color: '#94A3B8', fontSize: 11, textAlign: 'center', marginBottom: 25, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  option: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  iconContainer: { padding: 10, borderRadius: 12, marginRight: 15 },
  optionText: { color: '#F1F5F9', fontSize: 16, fontWeight: '600' },
  deleteOption: { marginTop: 8, borderTopWidth: 1, borderTopColor: '#1E293B', paddingTop: 20 }
});