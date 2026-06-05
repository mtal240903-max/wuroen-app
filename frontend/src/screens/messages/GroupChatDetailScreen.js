import React, { useState, useEffect, useCallback, useRef, useContext } from 'react';
import { 
  View, Text, FlatList, TextInput, TouchableOpacity, 
  KeyboardAvoidingView, Platform, StyleSheet, ActivityIndicator, Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; 
import { Send, ChevronLeft, Mic, Square, Play, Pause, Phone, Video } from 'lucide-react-native';
import { Audio } from 'expo-av';

import api from '../../services/api'; 
import { AuthContext } from '../../context/AuthContext';
import { COLORS } from '../../theme/theme';

export default function GroupChatDetail({ route, navigation }) {
  const { chatId, userName } = route.params; 
  const { user, updateUnreadCount } = useContext(AuthContext); 
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [soundPlayingId, setSoundPlayingId] = useState(null);
  
  const playbackInstance = useRef(null);
  const flatListRef = useRef();
  const isMounted = useRef(true);
  const socket = global.socket;

  // Forcer le scroll vers le bas
  const scrollToBottom = (animated = true) => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated });
    }, 150);
  };

  useEffect(() => {
    isMounted.current = true;
    (async () => await Audio.requestPermissionsAsync())();

    if (socket) {
      socket.emit('join_group', chatId);
      
      const handleNewGroupMessage = (newMsg) => {
        if (isMounted.current && newMsg.groupId === chatId) {
          setMessages(prev => {
            if (prev.some(m => m._id === newMsg._id)) return prev;
            return [...prev, newMsg];
          });
          scrollToBottom(true);
          // Marquer comme lu sur le serveur si on est actif sur le chat
          api.put(`/messages/conversations/${chatId}/read`, { read: true }).catch(() => null);
          updateUnreadCount?.();
        }
      };

      socket.on('new_group_message', handleNewGroupMessage);
      
      return () => {
        isMounted.current = false;
        socket.off('new_group_message', handleNewGroupMessage);
        if (playbackInstance.current) playbackInstance.current.unloadAsync();
      };
    }
  }, [chatId, socket, updateUnreadCount]);

  const fetchGroupMessages = useCallback(async () => {
    try {
      const response = await api.get(`/groups/${chatId}/messages`);
      if (isMounted.current) {
        setMessages(response.data);
        scrollToBottom(false);
        // Nettoyer les notifications locales dès l'ouverture
        await api.put(`/messages/conversations/${chatId}/read`, { read: true }).catch(() => null);
        updateUnreadCount?.();
      }
    } catch (error) { 
      console.error(error); 
    } finally { 
      if (isMounted.current) setLoading(false); 
    }
  }, [chatId, updateUnreadCount]);

  useEffect(() => { 
    fetchGroupMessages(); 
  }, [fetchGroupMessages]);

  const handleInitiateCall = async (isVideo) => {
    try {
      const response = await api.post('/messages/initiate-call', { groupId: chatId, isVideo });
      if (response.data.roomId) {
        socket?.emit('emit_call', { roomId: response.data.roomId, isVideo, targetId: chatId, callerName: user?.name, isGroup: true });
        navigation.navigate('CallScreen', { roomId: response.data.roomId, isVideo, chatId, userName });
      }
    } catch (error) { 
      Alert.alert("Échec", "Impossible de lancer l'appel."); 
    }
  };

  const handleSend = async () => {
    if (text.trim().length === 0 || sending) return;
    setSending(true);
    try {
      const response = await api.post('/messages/send', { groupId: chatId, content: text.trim(), isGroup: true });
      const newMessage = { ...response.data, sender: { _id: user?._id, name: user?.name } };
      setMessages(prev => [...prev, newMessage]);
      setText('');
      scrollToBottom(true);
      socket?.emit('send_group_message', { groupId: chatId, message: newMessage });
    } catch (error) { 
      Alert.alert("Erreur", "L'envoi a échoué."); 
    } finally { 
      setSending(false); 
    }
  };

  const startRecording = async () => {
    try {
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
      setIsRecording(true);
    } catch (err) { 
      Alert.alert("Erreur", "Micro inaccessible."); 
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    setIsRecording(false);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setRecording(null);
    if (!uri) return;

    const formData = new FormData();
    formData.append('groupId', String(chatId)); 
    formData.append('isGroup', 'true');
    formData.append('voice', { uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri, type: 'audio/m4a', name: 'audio.m4a' });

    try {
      const res = await api.post('/messages/send-voice', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setMessages(prev => [...prev, res.data]);
      scrollToBottom(true);
      socket?.emit('send_group_message', { groupId: chatId, message: res.data });
    } catch (err) { 
      Alert.alert('Erreur', 'Envoi vocal échoué.'); 
    }
  };

  const handlePlayVoice = async (messageId, fileUrl) => {
    if (soundPlayingId === messageId) { 
        await playbackInstance.current?.stopAsync(); 
        setSoundPlayingId(null); 
        return; 
    }
    if (playbackInstance.current) await playbackInstance.current.unloadAsync();
    
    setSoundPlayingId(messageId);
    await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
    const { sound } = await Audio.Sound.createAsync({ uri: fileUrl }, { shouldPlay: true });
    playbackInstance.current = sound;
    sound.setOnPlaybackStatusUpdate((status) => { if (status.didJustFinish) setSoundPlayingId(null); });
  };

  const renderMessage = ({ item }) => {
    const isMe = item.sender?._id === user?._id;
    const isVoice = item.messageType === 'voice' || item.fileUrl;
    return (
      <View style={[styles.messageBubble, isMe ? styles.myMessage : styles.theirMessage]}>
        {!isMe && <Text style={styles.senderName}>{item.sender?.name || "Membre"}</Text>}
        {isVoice ? (
          <TouchableOpacity style={styles.voicePlayBtn} onPress={() => handlePlayVoice(item._id, item.fileUrl)}>
            <View style={styles.playIconBg}>
              {soundPlayingId === item._id ? <Pause size={14} color={isMe ? '#FFF' : COLORS.primary} /> : <Play size={14} color={isMe ? '#FFF' : COLORS.primary} />}
            </View>
            <Text style={[styles.messageText, { marginLeft: 10 }]}>
              {soundPlayingId === item._id ? "Lecture..." : "Message vocal"}
            </Text>
          </TouchableOpacity>
        ) : <Text style={styles.messageText}>{item.content}</Text>}
        <Text style={styles.messageTime}>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><ChevronLeft color="#FFF" size={24} /></TouchableOpacity>
        <TouchableOpacity style={styles.headerInfo} onPress={() => navigation.navigate('GroupSettings', { groupId: chatId })}>
          <Text style={styles.groupName} numberOfLines={1}>{userName}</Text>
          <Text style={styles.memberCount}>Discussion de groupe</Text>
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => handleInitiateCall(false)} style={styles.actionBtn}><Phone color="#FFF" size={20} /></TouchableOpacity>
          <TouchableOpacity onPress={() => handleInitiateCall(true)} style={styles.actionBtn}><Video color="#FFF" size={20} /></TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView style={styles.keyboardView} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 95 : 0}>
        {loading ? (
          <View style={styles.centered}><ActivityIndicator color={COLORS.primary} /></View>
        ) : (
          <FlatList 
            ref={flatListRef} 
            data={messages} 
            keyExtractor={(item) => item._id} 
            renderItem={renderMessage} 
            contentContainerStyle={styles.messagesList}
            onContentSizeChange={() => scrollToBottom(true)} // Déclenche le scroll lors de l'ajout d'images/voix
          />
        )}
        <View style={styles.inputContainer}>
          <TextInput style={[styles.input, isRecording && styles.inputRecordingText]} placeholder={isRecording ? "Enregistrement..." : "Message..."} value={text} onChangeText={setText} multiline editable={!isRecording} />
          {text.trim().length === 0 ? (
            <TouchableOpacity style={[styles.actionInputBtn, isRecording ? styles.micBtnActive : styles.micBtnInactive]} onPress={isRecording ? stopRecording : startRecording}>
              {isRecording ? <Square color="#FFF" size={16} /> : <Mic color="#FFF" size={18} />}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.sendBtn} onPress={handleSend} disabled={sending}>{sending ? <ActivityIndicator color="#FFF" /> : <Send color="#FFF" size={18} />}</TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  keyboardView: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#0F172A', borderBottomWidth: 1, borderBottomColor: '#1E293B' },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#020617', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#1E293B' },
  headerInfo: { flex: 1, marginLeft: 15 },
  groupName: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  memberCount: { color: COLORS.primary, fontSize: 11, fontWeight: '600' },
  headerActions: { flexDirection: 'row' },
  actionBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#020617', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#1E293B', marginLeft: 8 },
  messagesList: { padding: 15 },
  messageBubble: { maxWidth: '80%', padding: 12, borderRadius: 20, marginBottom: 10 },
  myMessage: { alignSelf: 'flex-end', backgroundColor: COLORS.primary, borderBottomRightRadius: 2 },
  theirMessage: { alignSelf: 'flex-start', backgroundColor: '#1E293B', borderBottomLeftRadius: 2 },
  senderName: { color: COLORS.primary, fontSize: 11, fontWeight: '800', marginBottom: 4, marginLeft: 4 },
  messageText: { color: '#FFF', fontSize: 15 },
  voicePlayBtn: { flexDirection: 'row', alignItems: 'center', minWidth: 130 },
  playIconBg: { width: 26, height: 26, borderRadius: 13, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  messageTime: { color: 'rgba(255,255,255,0.5)', fontSize: 10, marginTop: 4, alignSelf: 'flex-end' },
  inputContainer: { flexDirection: 'row', padding: 16, backgroundColor: '#0F172A', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#1E293B' },
  input: { flex: 1, backgroundColor: '#020617', borderRadius: 24, paddingHorizontal: 16, paddingVertical: 10, color: '#FFF', marginRight: 10, borderWidth: 1, borderColor: '#1E293B' },
  inputRecordingText: { color: '#EF4444', fontWeight: '600' },
  actionInputBtn: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center' },
  micBtnInactive: { backgroundColor: '#334155' },
  micBtnActive: { backgroundColor: '#EF4444' },
  sendBtn: { backgroundColor: COLORS.primary, width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center' }
});