import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, StatusBar, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Send, Phone, Video, Mic, Square, Play, Pause } from 'lucide-react-native';
import { Audio } from 'expo-av';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { COLORS } from '../../theme/theme';

export default function ChatDetailScreen({ route, navigation }) {
  const { userName, chatId, recipientId } = route.params;
  const otherUserId = chatId || recipientId;
  const { user, updateUnreadCount } = useContext(AuthContext);

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [soundPlayingId, setSoundPlayingId] = useState(null);

  const playbackInstance = useRef(null);
  const flatListRef = useRef();
  const isMounted = useRef(true);

  // Fonction centrale pour scroller instantanément tout en bas
  const scrollToBottom = (animated = true) => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated });
    }, 150);
  };

  useEffect(() => {
    isMounted.current = true;
    Audio.requestPermissionsAsync();
    fetchMessages(true);
    return () => {
      isMounted.current = false;
      if (playbackInstance.current) playbackInstance.current.unloadAsync();
    };
  }, []);

  // Gestion du Socket en Temps Réel + Nettoyage automatique des notifications
  useEffect(() => {
    if (!global.socket) return;
    
    const handleNewMessage = (newMsg) => {
      const senderId = newMsg.sender?._id || newMsg.sender;
      const targetId = newMsg.receiver?._id || newMsg.receiver;
      
      if (senderId === otherUserId || targetId === otherUserId) {
        setMessages(prev => {
          if (prev.some(m => m._id === newMsg._id)) return prev;
          return [...prev, newMsg];
        });
        scrollToBottom(true);
        
        // Puisque l'utilisateur lit activement ce message en direct, on informe le serveur pour effacer les non-lus
        api.put(`/messages/conversations/${otherUserId}/read`, { read: true }).catch(() => null);
        updateUnreadCount?.();
      }
    };

    const handleCallLog = (data) => {
      setMessages(prev => [...prev, data]);
      scrollToBottom(true);
    };

    global.socket.on('new_private_message', handleNewMessage);
    global.socket.on('call_log_added', handleCallLog);
    
    return () => {
      global.socket.off('new_private_message', handleNewMessage);
      global.socket.off('call_log_added', handleCallLog);
    };
  }, [otherUserId, updateUnreadCount]);

  const fetchMessages = useCallback(async (initial = false) => {
    try {
      if (initial) setLoading(true);
      const response = await api.get(`/messages/history/${otherUserId}`);
      if (isMounted.current && Array.isArray(response.data)) {
        setMessages(response.data);
        scrollToBottom(false);
        
        // Dès l'ouverture réussie du chat historique, on marque les messages de cette conversation comme lus
        await api.put(`/messages/conversations/${otherUserId}/read`, { read: true }).catch(() => null);
        updateUnreadCount?.();
      }
    } catch (error) {
      console.error(error);
    } finally {
      if (initial && isMounted.current) setLoading(false);
    }
  }, [otherUserId, updateUnreadCount]);

  const handleCall = async (isVideo = false) => {
    const roomId = `call_${Date.now()}_${user._id}`;
    if (global.socket) {
      global.socket.emit('initiate_call', {
        recipientId: otherUserId,
        roomId: roomId,
        callerName: user.name,
        isVideo: isVideo
      });
    }
    navigation.navigate('CallScreen', { roomId, userName: userName, isIncoming: false, isVideo });
  };
  
  const handleSend = async () => {
    const trimmed = message.trim();
    if (!trimmed || sending) return;
    setSending(true);
    try {
      const response = await api.post('/messages/send', { receiverId: otherUserId, content: trimmed });
      setMessages(prev => [...prev, response.data]);
      setMessage('');
      scrollToBottom(true);
    } catch {
      Alert.alert('Erreur', 'Impossible d’envoyer.');
    } finally {
      setSending(false);
    }
  };

  const startRecording = async () => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) return;
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
      setIsRecording(true);
    } catch { 
      Alert.alert('Erreur', 'Micro non accessible.'); 
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setRecording(null);
    if (!uri) return;

    const formData = new FormData();
    formData.append('receiverId', otherUserId);
    formData.append('voice', { uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri, type: 'audio/m4a', name: `voice-${Date.now()}.m4a` });
    
    try {
      const response = await api.post('/messages/send-voice', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (response.data?.data) {
        setMessages(prev => [...prev, response.data.data]);
        scrollToBottom(true);
      }
    } catch { 
      Alert.alert('Erreur', 'Échec envoi vocal.'); 
    }
  };

  const handlePlayVoice = async (messageId, fileUrl) => {
    if (soundPlayingId === messageId) { 
      await playbackInstance.current?.pauseAsync(); 
      setSoundPlayingId(null); 
      return; 
    }
    if (playbackInstance.current) await playbackInstance.current.unloadAsync();
    const { sound } = await Audio.Sound.createAsync({ uri: fileUrl }, { shouldPlay: true });
    playbackInstance.current = sound;
    setSoundPlayingId(messageId);
    sound.setOnPlaybackStatusUpdate(s => { if (s.didJustFinish) setSoundPlayingId(null); });
  };

  if (loading) return <View style={styles.loaderContainer}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><ArrowLeft size={22} color="#FFF" /></TouchableOpacity>
        <View style={styles.userInfo}>
          <View style={styles.avatarMini}><Text style={styles.avatarText}>{userName?.charAt(0)?.toUpperCase() || '?'}</Text></View>
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.headerName}>{userName}</Text>
            <Text style={styles.onlineStatus}>Collaboration active</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.callBtn} onPress={() => handleCall(false)}><Phone size={18} color="#FFF" /></TouchableOpacity>
        <TouchableOpacity style={[styles.callBtn, { marginLeft: 10 }]} onPress={() => handleCall(true)}><Video size={18} color="#FFF" /></TouchableOpacity>
      </View>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() => scrollToBottom(true)} // Gère automatiquement les nouveaux arrivages (fichiers/audios longs)
          renderItem={({ item }) => {
            if (item.messageType === 'call_log') {
              return (
                <View style={styles.callLogWrapper}>
                  <Text style={styles.callLogText}>📞 {item.content}</Text>
                </View>
              );
            }

            const isMe = (item.sender?._id || item.sender) === user?._id;
            return (
              <View style={[styles.messageWrapper, isMe ? styles.myWrapper : styles.otherWrapper]}>
                <View style={[styles.bubble, isMe ? styles.myBubble : styles.otherBubble]}>
                  {item.messageType === 'voice' ? (
                    <TouchableOpacity style={styles.voiceBtn} onPress={() => handlePlayVoice(item._id, item.fileUrl)}>
                      {soundPlayingId === item._id ? <Pause size={18} color="#FFF" /> : <Play size={18} color="#FFF" />}
                      <Text style={styles.messageText}>Message vocal</Text>
                    </TouchableOpacity>
                  ) : <Text style={styles.messageText}>{item.content}</Text>}
                  <Text style={styles.timeText}>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                </View>
              </View>
            );
          }}
        />
        <View style={styles.inputArea}>
          <View style={styles.inputContainer}>
            <TextInput style={styles.input} value={message} onChangeText={setMessage} placeholder={isRecording ? "Enregistrement..." : "Écrire un message..."} placeholderTextColor="#64748B" multiline editable={!isRecording} />
            <TouchableOpacity style={message.trim() ? styles.sendBtn : (isRecording ? styles.micBtn : styles.micBtnInactive)} onPress={message.trim() ? handleSend : (isRecording ? stopRecording : startRecording)}>
              {message.trim() ? <Send size={18} color="#FFF" /> : (isRecording ? <Square size={18} color="#FFF" /> : <Mic size={18} color="#FFF" />)}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#020617' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 14, backgroundColor: '#0F172A', borderBottomWidth: 1, borderBottomColor: '#1E293B' },
  backBtn: { padding: 6 },
  userInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: 10 },
  avatarMini: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#1E293B', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: COLORS.primary, fontWeight: '900', fontSize: 16 },
  headerName: { fontSize: 15, fontWeight: '800', color: '#FFF' },
  onlineStatus: { fontSize: 11, color: '#10B981', marginTop: 2 },
  callBtn: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#1E293B', justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 14, paddingBottom: 30 },
  messageWrapper: { marginBottom: 12, flexDirection: 'row' },
  myWrapper: { justifyContent: 'flex-end' },
  otherWrapper: { justifyContent: 'flex-start' },
  bubble: { maxWidth: '82%', padding: 12, borderRadius: 18 },
  myBubble: { backgroundColor: COLORS.primary, borderBottomRightRadius: 4 },
  otherBubble: { backgroundColor: '#1E293B', borderBottomLeftRadius: 4 },
  messageText: { color: '#FFF', fontSize: 15, lineHeight: 22 },
  timeText: { color: 'rgba(255,255,255,0.55)', fontSize: 10, alignSelf: 'flex-end', marginTop: 4 },
  voiceBtn: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  inputArea: { padding: 12, backgroundColor: '#0F172A', borderTopWidth: 1, borderTopColor: '#1E293B' },
  inputContainer: { flexDirection: 'row', alignItems: 'flex-end', backgroundColor: '#020617', borderRadius: 24, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1, borderColor: '#1E293B' },
  input: { flex: 1, color: '#FFF', paddingVertical: 8, fontSize: 15, maxHeight: 100 },
  sendBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  micBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#EF4444', justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  micBtnInactive: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#334155', justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  callLogWrapper: { alignItems: 'center', marginVertical: 10 },
  callLogText: { color: '#94A3B8', fontSize: 12, fontStyle: 'italic', backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 }
});