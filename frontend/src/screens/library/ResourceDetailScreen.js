import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  SafeAreaView, ActivityIndicator, Share, Alert, Linking, StatusBar
} from 'react-native';
import { WebView } from 'react-native-webview'; 
import apiClient from '../../api/client'; 
import { COLORS } from '../../theme/theme';
import { 
  ArrowLeft, Eye, Calendar, 
  User, FileText, Share2, Bookmark, ExternalLink, Globe
} from 'lucide-react-native';

export default function ResourceDetailScreen({ route, navigation }) {
  const { resource: initialResource, id } = route.params || {};
  const [resource, setResource] = useState(initialResource || null);
  const [loading, setLoading] = useState(!initialResource);

  useEffect(() => {
    const resourceId = id || initialResource?._id || initialResource?.id;
    
    if (resourceId) {
      // Si on a déjà l'objet initial complet, on peut lancer le tracking de vue en parallèle
      if (!initialResource) {
        fetchDetail(resourceId);
      }
      incrementViews(resourceId);
    } else {
      Alert.alert("Erreur", "Document introuvable.");
      navigation.goBack();
    }
  }, [id, initialResource]);

  const fetchDetail = async (resourceId) => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/library/resources/${resourceId}`);
      if (response.data) setResource(response.data);
    } catch (error) {
      Alert.alert("Erreur", "Impossible de charger les détails.");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const incrementViews = async (resourceId) => {
    try {
      await apiClient.patch(`/library/resources/${resourceId}/view`);
    } catch (e) { /* Silencieux */ }
  };

  const handleOpenExternal = async () => {
    if (!resource?.fileUrl) {
      Alert.alert("Info", "Le lien du fichier est indisponible.");
      return;
    }
    try {
      await Linking.openURL(resource.fileUrl);
    } catch (err) {
      Alert.alert("Erreur", "Impossible d'ouvrir le document.");
    }
  };

  const handleShare = async () => {
    if (!resource?.fileUrl) return;
    try {
      await Share.share({
        message: `Wuro’en - Ressource Scientifique : ${resource.title}\nLien : ${resource.fileUrl}`,
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={{ marginTop: 15, color: '#64748B', fontWeight: '600' }}>Chargement du savoir...</Text>
    </View>
  );

  if (!resource) return null;

  // Configuration robuste du viewer Google Docs Embedded
  const viewerUrl = resource.fileUrl 
    ? `https://docs.google.com/viewer?url=${encodeURIComponent(resource.fileUrl)}&embedded=true`
    : null;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* NAVBAR NÉON */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navBtn}>
          <ArrowLeft color="#FFF" size={24} />
        </TouchableOpacity>
        <View style={styles.navActions}>
          <TouchableOpacity style={styles.navBtn} onPress={handleShare}>
            <Share2 color="#FFF" size={22} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navBtn}>
            <Bookmark color={COLORS.primary} size={22} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* HEADER INFO */}
        <View style={styles.badgeRow}>
          <View style={styles.domainBadge}>
            <Text style={styles.domainText}>{resource?.category?.name || 'Général'}</Text>
          </View>
          <View style={styles.typeBadge}>
            <Text style={styles.typeLabel}>{String(resource?.type || 'PDF').toUpperCase()}</Text>
          </View>
        </View>

        <Text style={styles.title}>{resource?.title}</Text>

        <View style={styles.metaGrid}>
          <View style={styles.metaBox}>
            <User size={14} color={COLORS.primary} />
            <Text style={styles.metaValue}>Expert Wuro’en</Text>
          </View>
          <View style={styles.metaBox}>
            <Eye size={14} color="#10B981" />
            <Text style={styles.metaValue}>{resource?.views || 0} vues</Text>
          </View>
          <View style={styles.metaBox}>
            <Calendar size={14} color="#64748B" />
            <Text style={styles.metaValue}>
              {resource?.createdAt ? new Date(resource.createdAt).toLocaleDateString() : '--/--'}
            </Text>
          </View>
        </View>

        <View style={styles.glassDivider} />

        <Text style={styles.sectionTitle}>Résumé scientifique</Text>
        <Text style={styles.description}>{resource?.description || "Pas de description détaillée."}</Text>

        {/* WEBVIEW AREA */}
        <View style={styles.viewerHeader}>
          <Text style={styles.sectionTitle}>Aperçu du contenu</Text>
          <TouchableOpacity style={styles.externalBtn} onPress={handleOpenExternal}>
            <Globe size={16} color={COLORS.primary} style={{ marginRight: 6 }} />
            <Text style={styles.externalBtnText}>Lien direct</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.viewerWrapper}>
          {resource?.fileUrl ? (
            <View style={styles.pdfFrame}>
              <WebView
                originWhitelist={['*']}
                source={{ uri: viewerUrl }}
                style={styles.webview}
                startInLoadingState={true}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                scalesPageToFit={true}
                // ✅ Forcer un User-Agent desktop évite que Google Docs refuse l'iframe sur certains périphériques mobiles Android
                userAgent="Mozilla/5.0 (Linux; Android 10; SM-A205U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Mobile Safari/537.36"
                renderLoading={() => (
                  <ActivityIndicator 
                    color={COLORS.primary} 
                    style={styles.loader} 
                  />
                )}
                onError={() => {
                  console.log("Aperçu indisponible dans la WebView");
                }}
              />
            </View>
          ) : (
            <View style={styles.noFile}>
              <FileText size={40} color="#1E293B" />
              <Text style={styles.noFileText}>Lien de visualisation non configuré.</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* FOOTER ACTION */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.mainBtn}
          onPress={handleOpenExternal}
          activeOpacity={0.8}
        >
          <ExternalLink color="#FFF" size={20} style={{ marginRight: 10 }} />
          <Text style={styles.btnText}>Ouvrir en plein écran</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#020617' },
  navbar: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, alignItems: 'center', backgroundColor: '#0F172A' },
  navActions: { flexDirection: 'row' },
  navBtn: { padding: 10, backgroundColor: '#1E293B', borderRadius: 14, marginLeft: 10 },
  scrollContent: { padding: 20 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  domainBadge: { backgroundColor: 'rgba(37, 99, 235, 0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginRight: 10 },
  domainText: { color: COLORS.primary, fontWeight: '800', fontSize: 11, textTransform: 'uppercase' },
  typeBadge: { borderWidth: 1, borderColor: '#1E293B', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  typeLabel: { color: '#64748B', fontWeight: '700', fontSize: 11 },
  title: { fontSize: 26, fontWeight: '900', color: '#FFF', marginBottom: 20, lineHeight: 32 },
  metaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 25 },
  metaBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F172A', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: '#1E293B' },
  metaValue: { color: '#F1F5F9', fontSize: 12, marginLeft: 8, fontWeight: '600' },
  glassDivider: { height: 1, backgroundColor: '#1E293B', marginBottom: 25 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#FFF', marginBottom: 12 },
  description: { fontSize: 15, color: '#94A3B8', lineHeight: 24, marginBottom: 30 },
  viewerWrapper: { height: 450, marginBottom: 30 },
  viewerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  externalBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(37, 99, 235, 0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  externalBtnText: { color: COLORS.primary, fontSize: 13, fontWeight: '700' },
  pdfFrame: { flex: 1, borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: '#1E293B' },
  webview: { flex: 1, backgroundColor: '#0F172A' },
  loader: { position: 'absolute', top: '50%', left: '50%', transform: [{ translateX: -10 }, { translateY: -10 }] },
  noFile: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F172A', borderRadius: 24, borderWidth: 1, borderStyle: 'dashed', borderColor: '#1E293B' },
  noFileText: { color: '#475569', fontSize: 14, marginTop: 15 },
  footer: { padding: 20, backgroundColor: '#0F172A', borderTopWidth: 1, borderTopColor: '#1E293B' },
  mainBtn: { backgroundColor: COLORS.primary, height: 60, borderRadius: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', shadowColor: COLORS.primary, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  btnText: { color: '#FFF', fontSize: 16, fontWeight: '800' }
});