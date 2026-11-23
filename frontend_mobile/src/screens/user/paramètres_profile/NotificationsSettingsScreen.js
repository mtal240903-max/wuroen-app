import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, BellRing, MessageSquare, Heart, Sparkles } from 'lucide-react-native';

export default function NotificationsSettingsScreen({ navigation }) {
  // ⚙️ États pour contrôler chaque type de notification
  const [allNotifications, setAllNotifications] = useState(true);
  const [newArticles, setNewArticles] = useState(true);
  const [likesAndComments, setLikesAndComments] = useState(false);
  const [directMessages, setDirectMessages] = useState(true);

  // Désactiver toutes les sous-options si les notifications globales sont coupées
  const toggleAll = (value) => {
    setAllNotifications(value);
    if (!value) {
      setNewArticles(false);
      setLikesAndComments(false);
      setDirectMessages(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ⬅️ Barre supérieure */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backBtn} 
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color="#FFF" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Notifications</Text>
          <Text style={styles.headerSub}>Choisissez ce qui vous est notifié</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* 📑 SECTION GLOBALE */}
        <Text style={styles.sectionTitle}>Option générale</Text>
        <View style={styles.section}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconBg, { borderColor: 'rgba(59, 130, 246, 0.3)' }]}>
                <BellRing size={18} color="#3B82F6" />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.rowTitle}>Autoriser les notifications</Text>
                <Text style={styles.rowSub}>Activer ou couper toutes les alertes de l'application.</Text>
              </View>
            </View>
            <Switch 
              value={allNotifications}
              onValueChange={toggleAll}
              trackColor={{ false: "#1E293B", true: "rgba(59, 130, 246, 0.5)" }}
              thumbColor={allNotifications ? "#3B82F6" : "#94A3B8"}
            />
          </View>
        </View>

        {/* 📑 SECTION ACTIVITÉS */}
        <Text style={styles.sectionTitle}>Activités sur Wuro'en</Text>
        <View style={styles.section}>

          {/* Nouveaux Articles */}
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconBg, { borderColor: 'rgba(234, 179, 8, 0.3)' }]}>
                <Sparkles size={18} color="#EAB308" />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.rowTitle}>Publications scientifiques</Text>
                <Text style={styles.rowSub}>Alerte lorsqu'un chercheur publie un nouvel article.</Text>
              </View>
            </View>
            <Switch 
              value={newArticles}
              disabled={!allNotifications}
              onValueChange={setNewArticles}
              trackColor={{ false: "#1E293B", true: "rgba(234, 179, 8, 0.5)" }}
              thumbColor={newArticles ? "#EAB308" : "#94A3B8"}
            />
          </View>

          <View style={styles.divider} />

          {/* Mentions J'aime et Commentaires */}
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconBg, { borderColor: 'rgba(239, 68, 68, 0.3)' }]}>
                <Heart size={18} color="#EF4444" />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.rowTitle}>Interactions</Text>
                <Text style={styles.rowSub}>Quelqu'un aime ou commente votre travail.</Text>
              </View>
            </View>
            <Switch 
              value={likesAndComments}
              disabled={!allNotifications}
              onValueChange={setLikesAndComments}
              trackColor={{ false: "#1E293B", true: "rgba(239, 68, 68, 0.5)" }}
              thumbColor={likesAndComments ? "#EF4444" : "#94A3B8"}
            />
          </View>

          <View style={styles.divider} />

          {/* Messages directs */}
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconBg, { borderColor: 'rgba(16, 185, 129, 0.3)' }]}>
                <MessageSquare size={18} color="#10B981" />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.rowTitle}>Messages directs</Text>
                <Text style={styles.rowSub}>Discussions privées avec d'autres membres.</Text>
              </View>
            </View>
            <Switch 
              value={directMessages}
              disabled={!allNotifications}
              onValueChange={setDirectMessages}
              trackColor={{ false: "#1E293B", true: "rgba(16, 185, 129, 0.5)" }}
              thumbColor={directMessages ? "#10B981" : "#94A3B8"}
            />
          </View>

        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  header: { padding: 25, paddingBottom: 15, flexDirection: 'row', alignItems: 'center' },
  backBtn: { marginRight: 20, padding: 8, backgroundColor: '#0F172A', borderRadius: 12, borderWidth: 1, borderColor: '#1E293B' },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#FFF' },
  headerSub: { fontSize: 13, color: '#64748B', marginTop: 2 },
  scroll: { paddingHorizontal: 20, paddingTop: 15 },
  sectionTitle: { fontSize: 11, fontWeight: '900', color: '#475569', marginBottom: 12, marginLeft: 10, letterSpacing: 1.5, textTransform: 'uppercase' },
  section: { backgroundColor: 'rgba(15, 23, 42, 0.6)', borderRadius: 24, paddingVertical: 4, marginBottom: 25, borderWidth: 1, borderColor: '#1E293B' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  rowLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 10 },
  iconBg: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#020617', justifyContent: 'center', alignItems: 'center', marginRight: 15, borderWidth: 1 },
  textContainer: { flex: 1 },
  rowTitle: { fontSize: 15, color: '#F8FAFC', fontWeight: '700' },
  rowSub: { fontSize: 12, color: '#64748B', marginTop: 4, lineHeight: 16 },
  divider: { height: 1, backgroundColor: '#1E293B', marginHorizontal: 16 }
});