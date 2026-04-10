import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TextInput, 
  TouchableOpacity, KeyboardAvoidingView, Platform, 
  StatusBar, SafeAreaView, ActivityIndicator, Alert
} from 'react-native';
import { ArrowLeft, Send } from 'lucide-react-native';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { COLORS } from '../../theme/theme';

export default function ChatDetailScreen({ route, navigation }) {
  const { userName, chatId } = route.params; 
  const { userToken, user } = useContext(AuthContext); 
  
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef();

  const API_URL = "http://192.168.115.239:5000/api/messages";

  // 1. Charger l'historique et marquer comme lu
  const fetchMessages = useCallback(async (isInitial = false) => {
    try {
      const res = await axios.get(`${API_URL}/${chatId}`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      
      setMessages(res.data);
      
      // Si on reçoit des messages, on s'assure que le serveur sait qu'ils sont lus
      // La route GET /:chatId du backend s'en occupe déjà avec la mise à jour précédente,
      // mais cela garantit la synchronisation côté client.
      if (isInitial) {
        setLoading(false);
      }
    } catch (err) {
      console.error("Erreur fetchMessages:", err);
      if (isInitial) setLoading(false);
    }
  }, [chatId, userToken]);

  useEffect(() => {
    fetchMessages(true);

    // Polling pour simuler le temps réel (à remplacer par Socket.io plus tard)
    const interval = setInterval(() => {
        fetchMessages(false);
    }, 4000);

    return () => clearInterval(interval);
  }, [fetchMessages]);

  // 2. Envoyer le message
  const handleSend = async () => {
    if (message.trim().length === 0) return;

    const messageContent = message;
    setMessage(''); 

    try {
      const res = await axios.post(
        `${API_URL}/send`,
        {
          receiverId: chatId,
          content: messageContent
        },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );

      setMessages(prev => [...prev, res.data]);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (err) {
      Alert.alert("Erreur", "Impossible d'envoyer le message.");
      setMessage(messageContent);
    }
  };

  const renderMessage = ({ item }) => {
    // Vérification robuste de l'identité
    const senderId = item.sender?._id || item.sender;
    const isMe = senderId === user?._id;
    
    return (
      <View style={[styles.messageWrapper, isMe ? styles.myWrapper : styles.otherWrapper]}>
        <View style={[styles.bubble, isMe ? styles.myBubble : styles.otherBubble]}>
          <Text style={[styles.messageText, isMe ? styles.myText : styles.otherText]}>
            {item.content}
          </Text>
          <View style={styles.timeContainer}>
            <Text style={[styles.timeText, isMe && { color: '#E0E7FF' }]}>
               {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) return (
    <View style={styles.centered}><ActivityIndicator size="large" color={COLORS.primary} /></View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#1A1C1E" />
        </TouchableOpacity>
        <View style={styles.avatarMini}>
          <Text style={styles.avatarText}>{userName ? userName[0].toUpperCase() : '?'}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerName} numberOfLines={1}>{userName}</Text>
          <Text style={styles.onlineStatus}>Collaborateur Wuro’en</Text>
        </View>
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item._id}
          renderItem={renderMessage}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          showsVerticalScrollIndicator={false}
        />

        {/* Barre d'envoi */}
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Votre message scientifique..."
            value={message}
            onChangeText={setMessage}
            multiline
            placeholderTextColor="#94A3B8"
          />
          <TouchableOpacity 
            style={[styles.sendBtn, !message.trim() && { backgroundColor: '#CBD5E1' }]} 
            onPress={handleSend}
            disabled={!message.trim()}
          >
            <Send size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FE' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { 
    flexDirection: 'row', alignItems: 'center', padding: 15, 
    backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3
  },
  backBtn: { padding: 5, marginRight: 8 },
  avatarMini: { 
    width: 40, height: 40, borderRadius: 14, backgroundColor: COLORS.primary, 
    justifyContent: 'center', alignItems: 'center', marginRight: 12 
  },
  avatarText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  headerName: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  onlineStatus: { fontSize: 11, color: '#10B981', fontWeight: '600' },
  
  listContent: { paddingHorizontal: 15, paddingBottom: 20, paddingTop: 10 },
  messageWrapper: { marginBottom: 12, width: '100%', flexDirection: 'row' },
  myWrapper: { justifyContent: 'flex-end' },
  otherWrapper: { justifyContent: 'flex-start' },
  
  bubble: { maxWidth: '80%', padding: 12, borderRadius: 20 },
  myBubble: { backgroundColor: COLORS.primary, borderBottomRightRadius: 4 },
  otherBubble: { backgroundColor: '#FFF', borderBottomLeftRadius: 4, elevation: 1 },
  
  messageText: { fontSize: 15, lineHeight: 20 },
  myText: { color: '#FFF' },
  otherText: { color: '#1E293B' },
  
  timeContainer: { marginTop: 4, flexDirection: 'row', justifyContent: 'flex-end' },
  timeText: { fontSize: 10, color: '#94A3B8' },

  inputWrapper: { 
    flexDirection: 'row', 
    padding: 12, 
    backgroundColor: '#FFF', 
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9'
  },
  input: { 
    flex: 1, 
    backgroundColor: '#F8FAFC', 
    borderRadius: 22, 
    paddingHorizontal: 18, 
    paddingVertical: 10, 
    marginRight: 12,
    maxHeight: 100,
    color: '#1E293B',
    fontSize: 15
  },
  sendBtn: { 
    width: 48, height: 48, borderRadius: 24, 
    backgroundColor: COLORS.primary, justifyContent: 'center', 
    alignItems: 'center', elevation: 2 
  }
});