import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { ChevronLeft, FileText, Image as ImageIcon, FileCode } from 'lucide-react-native';

const FILES = [
  { id: '1', name: 'Rapport_Final.pdf', size: '2.4 MB', type: 'pdf', date: 'Hier' },
  { id: '2', name: 'Schéma_Structure.png', size: '1.1 MB', type: 'img', date: '12 Mai' },
  { id: '3', name: 'Data_Analyses.xlsx', size: '540 KB', type: 'doc', date: '10 Mai' },
];

export default function SharedFilesScreen({ navigation }) {
  const getIcon = (type) => {
    if (type === 'pdf') return <FileText color="#EF4444" size={24} />;
    if (type === 'img') return <ImageIcon color="#3B82F6" size={24} />;
    return <FileCode color="#10B981" size={24} />;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><ChevronLeft color="#FFF" size={28} /></TouchableOpacity>
        <Text style={styles.headerTitle}>Ressources partagées</Text>
        <View style={{width: 28}} />
      </View>
      <FlatList 
        data={FILES}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <TouchableOpacity style={styles.fileRow}>
            <View style={styles.iconBox}>{getIcon(item.type)}</View>
            <View style={{flex: 1}}>
              <Text style={styles.fileName}>{item.name}</Text>
              <Text style={styles.fileMeta}>{item.size} • {item.date}</Text>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={{padding: 20}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 50, marginBottom: 20 },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  fileRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, backgroundColor: '#0F172A', padding: 12, borderRadius: 12 },
  iconBox: { width: 45, height: 45, backgroundColor: '#020617', borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  fileName: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  fileMeta: { color: '#475569', fontSize: 12, marginTop: 4 }
});