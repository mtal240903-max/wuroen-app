import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import { organizationUnitService } from '../../../services/organizationUnitService';

const DARK_COLORS = {
  background: '#090D1A',
  surface: '#111726',
  surfaceCard: '#131B2E',
  textMain: '#FFFFFF',
  textSub: '#64748B',
  primary: '#6366F1', 
  border: '#1E293B',
  success: '#10B981',
  danger: '#EF4444'
};

export default function OrganizationUnitsScreen({ route }) {
  const { organizationId, rootUnitId } = route.params || {};

  const [subTree, setSubTree] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unitName, setUnitName] = useState('');
  const [unitType, setUnitType] = useState('DEPARTMENT');
  const [submitting, setSubmitting] = useState(false);

  const loadSubTree = async () => {
    if (!rootUnitId) return;
    try {
      setLoading(true);
      const response = await organizationUnitService.getSubTree(rootUnitId);
      // Ajustez selon la structure de retour de votre API (ex: response.data ou directement response)
      const dataList = response.success ? response.data : response;
      setSubTree(Array.isArray(dataList) ? dataList : []);
    } catch (error) {
      Alert.alert("Erreur", error.message || "Impossible de charger l'arborescence.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubTree();
  }, [rootUnitId]);

  const handleCreateUnit = async () => {
    if (!unitName.trim()) {
      Alert.alert("Champ requis", "Veuillez entrer un nom pour l'unité.");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        organizationId: organizationId,
        parentId: rootUnitId,
        name: unitName,
        type: unitType,
      };

      const result = await organizationUnitService.createUnit(payload);
      if (result) {
        Alert.alert("Succès", "Unité organisationnelle créée avec succès !");
        setUnitName('');
        loadSubTree();
      }
    } catch (error) {
      Alert.alert("Erreur", error.message || "Erreur lors de la création.");
    } finally {
      setSubmitting(false);
    }
  };

  const calculateIndentation = (path) => {
    if (!path) return 0;
    const parts = path.split('/');
    return Math.max(0, parts.length - 1);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestion des Unités</Text>

      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nom du département / service"
          placeholderTextColor={DARK_COLORS.textSub}
          value={unitName}
          onChangeText={setUnitName}
        />
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleCreateUnit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Ajouter une sous-unité</Text>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>Arborescence hiérarchique :</Text>

      {loading ? (
        <ActivityIndicator size="large" color={DARK_COLORS.primary} style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={subTree}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => {
            const depth = calculateIndentation(item.path);
            return (
              <View style={[styles.itemContainer, { marginLeft: depth * 20 }]}>
                <View style={styles.itemContent}>
                  <Text style={styles.itemName}>
                    {depth > 0 ? '└── ' : '📁 '} {item.name}
                  </Text>
                  <Text style={styles.itemType}>{item.type}</Text>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={<Text style={styles.emptyText}>Aucune sous-unité trouvée.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: DARK_COLORS.background 
  },
  title: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginBottom: 15, 
    color: DARK_COLORS.textMain 
  },
  subtitle: { 
    fontSize: 14, 
    fontWeight: '600', 
    marginVertical: 15, 
    color: DARK_COLORS.textSub 
  },
  formContainer: { 
    backgroundColor: DARK_COLORS.surface, 
    padding: 15, 
    borderRadius: 8, 
    marginBottom: 10, 
    borderWidth: 1,
    borderColor: DARK_COLORS.border 
  },
  input: { 
    borderWidth: 1, 
    borderColor: DARK_COLORS.border, 
    borderRadius: 6, 
    padding: 10, 
    marginBottom: 10, 
    backgroundColor: DARK_COLORS.background,
    color: DARK_COLORS.textMain
  },
  button: { 
    backgroundColor: DARK_COLORS.primary, 
    padding: 12, 
    borderRadius: 6, 
    alignItems: 'center' 
  },
  buttonText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 14 
  },
  itemContainer: { 
    marginBottom: 8 
  },
  itemContent: { 
    backgroundColor: DARK_COLORS.surface, 
    padding: 12, 
    borderRadius: 6, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: DARK_COLORS.border 
  },
  itemName: { 
    fontSize: 14, 
    fontWeight: '500', 
    color: DARK_COLORS.textMain 
  },
  itemType: { 
    fontSize: 11, 
    color: DARK_COLORS.textSub, 
    backgroundColor: DARK_COLORS.surfaceCard, 
    paddingHorizontal: 6, 
    paddingVertical: 2, 
    borderRadius: 4,
    borderWidth: 1,
    borderColor: DARK_COLORS.border
  },
  emptyText: { 
    textAlign: 'center', 
    color: DARK_COLORS.textSub, 
    marginTop: 20 
  }
});