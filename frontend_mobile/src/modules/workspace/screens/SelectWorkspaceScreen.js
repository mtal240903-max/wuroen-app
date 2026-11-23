import React, { useEffect, useLayoutEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { useWorkspace } from '../../../context/WorkspaceContext';

export default function SelectWorkspaceScreen({ navigation }) {
  const { workspaces, loading, fetchMyWorkspaces, setCurrentWorkspace } = useWorkspace();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Mes Espaces',
      headerStyle: { backgroundColor: '#090D1A' },
      headerTintColor: '#FFF',
    });
  }, [navigation]);

  useEffect(() => {
    fetchMyWorkspaces();
  }, [fetchMyWorkspaces]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        onPress={() => navigation.navigate('CreateWorkspaceScreen')} 
        style={styles.topCreateButton}
      >
        <Text style={styles.createButtonText}>+ Créer un espace</Text>
      </TouchableOpacity>

      <FlatList
        data={workspaces}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listPadding}
        ListHeaderComponent={<Text style={styles.sectionTitle}>Espaces disponibles</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.card} 
            onPress={() => {
              // On transmet l'objet complet de l'espace sélectionné au contexte
              setCurrentWorkspace(item);
              navigation.goBack();
            }}
          >
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardSubtitle}>Appuyez pour sélectionner</Text>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => navigation.navigate('CreateWorkspaceScreen')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090D1A' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#090D1A' },
  listPadding: { padding: 20 },
  topCreateButton: { marginLeft: 20, marginTop: 10, marginBottom: 10 },
  createButtonText: { color: '#6366F1', fontWeight: 'bold', fontSize: 16 },
  sectionTitle: { fontSize: 18, color: '#9CA3AF', marginBottom: 15, fontWeight: '600' },
  card: { padding: 20, backgroundColor: '#111726', borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#1F2937' },
  cardTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  cardSubtitle: { color: '#6B7280', fontSize: 12, marginTop: 4 },
  fab: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  fabText: { color: '#FFF', fontSize: 32, fontWeight: '300' }
});