import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, BackHandler, Alert } from 'react-native';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff } from 'lucide-react-native';

export default function CallScreen({ route, navigation }) {
  const { roomId, isVideo, userName, isIncoming } = route.params || {};
  
  const [isMuted, setIsMuted] = useState(false);
  const [camOn, setCamOn] = useState(!!isVideo);
  const [timer, setTimer] = useState('00:00');
  const [isConnected, setIsConnected] = useState(false);
  const [callStatus, setCallStatus] = useState(isIncoming ? 'APPEL ENTRANT...' : 'APPEL EN COURS...');

  const timerIntervalRef = useRef(null);

  // ⏱️ Chrono précis
  useEffect(() => {
    if (isConnected) {
      let seconds = 0;
      timerIntervalRef.current = setInterval(() => {
        seconds++;
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        setTimer(`${mins}:${secs}`);
      }, 1000);
    }
    return () => clearInterval(timerIntervalRef.current);
  }, [isConnected]);

  // 📡 Écouteurs Socket.io avec Nettoyage
  useEffect(() => {
    if (!global.socket) {
      Alert.alert("Erreur", "Connexion perdue");
      navigation.goBack();
      return;
    }

    const handlers = {
      call_accepted: (data) => {
        if (data.roomId === roomId) {
          setCallStatus('CONNECTÉ');
          setIsConnected(true);
        }
      },
      call_terminated: () => {
        setCallStatus('APPEL TERMINÉ');
        setIsConnected(false);
        setTimeout(() => navigation.goBack(), 1000);
      },
      call_rejected: () => {
        setCallStatus('APPEL REFUSÉ');
        setTimeout(() => navigation.goBack(), 1500);
      }
    };

    global.socket.on('call_accepted', handlers.call_accepted);
    global.socket.on('call_terminated', handlers.call_terminated);
    global.socket.on('call_rejected', handlers.call_rejected);

    const backAction = () => { handleHangUp(); return true; };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => {
      global.socket.off('call_accepted', handlers.call_accepted);
      global.socket.off('call_terminated', handlers.call_terminated);
      global.socket.off('call_rejected', handlers.call_rejected);
      backHandler.remove();
    };
  }, [roomId]);

  const acceptCall = () => {
    global.socket.emit('accept_call', { roomId });
    // On ne passe pas en "CONNECTÉ" ici, on attend le serveur
  };

  const handleHangUp = () => {
    if (global.socket) {
      global.socket.emit('terminate_call', { roomId });
    }
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* ... (votre JSX actuel reste identique) ... */}
      <View style={styles.header}>
        <View style={[styles.cyberBadge, isConnected && { borderColor: '#22C55E' }]}>
          <View style={[styles.pulseDot, { backgroundColor: isConnected ? '#22C55E' : '#EF4444' }]} />
          <Text style={[styles.cyberBadgeText, isConnected && { color: '#22C55E' }]}>{callStatus}</Text>
        </View>
        <Text style={styles.timerText}>{timer}</Text>
      </View>

      <View style={styles.mainContent}>
        <View style={styles.neonOuterRing}>
          <View style={styles.neonInnerRing}>
            <Text style={styles.avatarInitials}>{userName?.slice(0, 2).toUpperCase() || 'UX'}</Text>
          </View>
        </View>
        <Text style={styles.userNameText}>{userName || 'Interlocuteur'}</Text>
      </View>

      <View style={styles.terminalFooter}>
        {isIncoming && !isConnected ? (
          <View style={styles.controlsRow}>
            <TouchableOpacity style={[styles.iconBtn, { backgroundColor: '#EF4444' }]} onPress={handleHangUp}>
              <PhoneOff color="#FFF" size={30} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.iconBtn, { backgroundColor: '#22C55E' }]} onPress={acceptCall}>
              <Phone color="#FFF" size={30} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.controlsRow}>
            <TouchableOpacity style={[styles.iconBtn, isMuted && styles.btnActiveAlert]} onPress={() => setIsMuted(!isMuted)}>
              {isMuted ? <MicOff color="#EF4444" size={22} /> : <Mic color="#06B6D4" size={22} />}
            </TouchableOpacity>
            <TouchableOpacity style={styles.hangUpBtn} onPress={handleHangUp}>
              <PhoneOff color="#FFF" size={26} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => setCamOn(!camOn)}>
              {camOn ? <Video color="#06B6D4" size={22} /> : <VideoOff color="#EF4444" size={22} />}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 24 },
  cyberBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(6, 182, 212, 0.1)', padding: 8, borderRadius: 4, borderWidth: 1, borderColor: '#06B6D4' },
  pulseDot: { width: 6, height: 6, borderRadius: 3, marginRight: 8 },
  cyberBadgeText: { color: '#06B6D4', fontSize: 10, fontWeight: '900' },
  timerText: { color: '#94A3B8', fontSize: 14, fontFamily: 'monospace' },
  mainContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  neonOuterRing: { width: 140, height: 140, borderRadius: 70, borderWidth: 2, borderColor: 'rgba(6, 182, 212, 0.4)', justifyContent: 'center', alignItems: 'center' },
  neonInnerRing: { width: 116, height: 116, borderRadius: 58, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center' },
  avatarInitials: { color: '#FFF', fontSize: 32, fontWeight: '900' },
  userNameText: { color: '#FFF', fontSize: 24, marginTop: 20 },
  terminalFooter: { paddingBottom: 40, paddingTop: 20 },
  controlsRow: { flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center' },
  iconBtn: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#0F172A', borderWidth: 1, borderColor: '#1E293B', justifyContent: 'center', alignItems: 'center' },
  hangUpBtn: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#EF4444', justifyContent: 'center', alignItems: 'center' },
  btnActiveAlert: { borderColor: '#EF4444' }
});