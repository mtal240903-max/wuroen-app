import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Alert, Modal, ActivityIndicator,
  StatusBar, ScrollView
} from 'react-native';
import { AuthContext } from '../../../context/AuthContext';
import { COLORS } from '../../../theme/theme';
import {
  Users, UserCog, Trash2, X, ChevronRight,
  ShieldCheck, Mail, Lock, Crown,
  BookOpen, FileStack, LayoutGrid, Search
} from 'lucide-react-native';
import api from '../../../services/api';

// ─────────────────────────────────────────────────────────────
// COULEURS PAR RÔLE
// ─────────────────────────────────────────────────────────────
const ROLE_COLORS = {
  superadmin: '#7C3AED',
  admin:      '#2563EB',
  moderator:  '#10B981',
  user:       '#64748B',
};

const adminTypeLabel = {
  content:   'Admin Contenu',
  library:   'Admin Bibliothèque',
  workspace: 'Admin Général',
};

const adminTypeIcon = {
  content:   FileStack,
  library:   BookOpen,
  workspace: LayoutGrid,
};

const adminTypeColor = {
  content:   '#10B981',
  library:   '#3B82F6',
  workspace: '#F59E0B',
};

// ─────────────────────────────────────────────────────────────
// BADGE RÔLE
// ─────────────────────────────────────────────────────────────
const RoleBadge = ({ role, adminType }) => {
  const color = ROLE_COLORS[role] || '#64748B';

  if (role === 'superadmin') {
    return (
      <View style={[badge.pill, { backgroundColor: '#7C3AED15', borderColor: '#7C3AED30' }]}>
        <Crown size={10} color="#7C3AED" />
        <Text style={[badge.text, { color: '#7C3AED' }]}>SUPER ADMIN</Text>
      </View>
    );
  }

  if (role === 'admin' && adminType) {
    const TypeIcon = adminTypeIcon[adminType] || LayoutGrid;
    const typeColor = adminTypeColor[adminType] || '#2563EB';
    return (
      <View style={badge.row}>
        <View style={[badge.pill, { backgroundColor: '#2563EB15', borderColor: '#2563EB30' }]}>
          <ShieldCheck size={10} color="#2563EB" />
          <Text style={[badge.text, { color: '#2563EB' }]}>ADMIN</Text>
        </View>
        <View style={[badge.pill, { backgroundColor: typeColor + '15', borderColor: typeColor + '30' }]}>
          <TypeIcon size={10} color={typeColor} />
          <Text style={[badge.text, { color: typeColor }]}>
            {(adminTypeLabel[adminType] || adminType).toUpperCase()}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[badge.pill, { backgroundColor: color + '15', borderColor: color + '30' }]}>
      <ShieldCheck size={10} color={color} />
      <Text style={[badge.text, { color }]}>{role?.toUpperCase()}</Text>
    </View>
  );
};

const badge = StyleSheet.create({
  row:  { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 10 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1, alignSelf: 'flex-start', marginTop: 10 },
  text: { fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
});

// ─────────────────────────────────────────────────────────────
// ÉCRAN PRINCIPAL
// ─────────────────────────────────────────────────────────────
export default function UsersManagementScreen() {
  const { user: currentUser } = useContext(AuthContext);
  const [users, setUsers]           = useState([]);
  const [filtered, setFiltered]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [updating, setUpdating]     = useState(false);
  const [page, setPage]             = useState(1);
  const [hasMore, setHasMore]       = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [adminTypeFilter, setAdminTypeFilter] = useState(null);

  const FILTERS = [
    { key: 'all',        label: 'Tous' },
    { key: 'superadmin', label: 'Super Admin' },
    { key: 'admin',      label: 'Admins' },
    { key: 'moderator',  label: 'Modérateurs' },
    { key: 'user',       label: 'Membres' },
  ];

  const ADMIN_TYPE_FILTERS = [
    { key: null,        label: 'Tous les admins' },
    { key: 'content',   label: 'Contenu',       color: '#10B981' },
    { key: 'library',   label: 'Bibliothèque',  color: '#3B82F6' },
    { key: 'workspace', label: 'Général',       color: '#F59E0B' },
  ];

  const fetchUsers = useCallback(async (pageNum = 1, append = false) => {
    if (pageNum === 1) setLoading(true);
    try {
      const res = await api.get('/superadmin/users', { params: { page: pageNum, limit: 30 } });
      const data        = res.data?.users       ?? res.data ?? [];
      const totalPages  = res.data?.totalPages ?? 1;
      setUsers(prev => append ? [...prev, ...data] : data);
      setHasMore(pageNum < totalPages);
    } catch (err) {
      console.error("Fetch users:", err.response?.status, err.message);
      Alert.alert("Erreur", "Impossible de charger les membres.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(1); }, [fetchUsers]);

  useEffect(() => {
    let result = [...users];
    if (activeFilter !== 'all') {
      result = result.filter(u => u.role === activeFilter);
    }
    if (activeFilter === 'admin' && adminTypeFilter) {
      result = result.filter(u => u.adminType === adminTypeFilter);
    }
    setFiltered(result);
  }, [users, activeFilter, adminTypeFilter]);

  const loadMore = () => {
    if (!hasMore || loading) return;
    const next = page + 1;
    setPage(next);
    fetchUsers(next, true);
  };

  const openModal = (item) => {
    if (item.role === 'superadmin' && item._id !== currentUser._id) return;
    setSelectedUser(item);
    setModalVisible(true);
  };

  const handleUpdateRole = async (newRole, newAdminType = null) => {
    if (selectedUser._id === currentUser._id) {
      Alert.alert("Impossible", "Vous ne pouvez pas modifier votre propre rôle.");
      return;
    }
    setUpdating(true);
    try {
      // ✅ Utilisation de PUT comme attendu par le backend
      await api.put(`/superadmin/users/${selectedUser._id}/role`, {
        role:      newRole,
        adminType: newRole === 'admin' ? newAdminType : null,
      });
      setUsers(prev => prev.map(u =>
        u._id === selectedUser._id
          ? { ...u, role: newRole, adminType: newRole === 'admin' ? newAdminType : null }
          : u
      ));
      setModalVisible(false);
      Alert.alert("✅ Succès", `Rôle mis à jour : ${newRole.toUpperCase()}`);
    } catch (err) {
      Alert.alert("Erreur", err.response?.data?.message || "Mise à jour échouée.");
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteUser = () => {
    if (selectedUser._id === currentUser._id) {
      Alert.alert("Erreur", "Auto-suppression impossible.");
      return;
    }
    Alert.alert(
      "⚠️ Révocation d'accès",
      `Supprimer définitivement le compte de ${selectedUser?.name} ?\nCette action est irréversible.`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer", style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/superadmin/users/${selectedUser._id}`);
              setUsers(prev => prev.filter(u => u._id !== selectedUser._id));
              setModalVisible(false);
            } catch (err) {
              Alert.alert("Erreur", err.response?.data?.message || "Action refusée.");
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }) => {
    const isSuperAdmin = item.role === 'superadmin';
    const isMe         = item._id === currentUser._id;
    const isClickable  = !isSuperAdmin || isMe;

    return (
      <TouchableOpacity
        style={[styles.card, isSuperAdmin && !isMe && styles.cardLocked]}
        onPress={() => openModal(item)}
        activeOpacity={isClickable ? 0.7 : 1}
        disabled={!isClickable}
      >
        <View style={[styles.cardAvatar, { backgroundColor: (ROLE_COLORS[item.role] || '#64748B') + '20' }]}>
          {isSuperAdmin
            ? <Crown size={18} color="#7C3AED" />
            : <Text style={[styles.cardAvatarText, { color: ROLE_COLORS[item.role] || '#64748B' }]}>
                {(item.name || '?')[0].toUpperCase()}
              </Text>
          }
        </View>

        <View style={styles.cardInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
            {isMe && <View style={styles.meBadge}><Text style={styles.meText}>MOI</Text></View>}
            {isSuperAdmin && !isMe && <Lock size={12} color="#475569" style={{ marginLeft: 6 }} />}
          </View>
          <View style={styles.emailRow}>
            <Mail size={11} color="#334155" />
            <Text style={styles.cardEmail} numberOfLines={1}>{item.email}</Text>
          </View>
          <RoleBadge role={item.role} adminType={item.adminType} />
        </View>

        {isClickable && <ChevronRight size={18} color="#1E293B" />}
      </TouchableOpacity>
    );
  };

  const ModalContent = () => {
    const [selectedRole, setSelectedRole] = useState(selectedUser?.role || 'user');
    const [selectedAdminType, setSelectedAdminType] = useState(selectedUser?.adminType || null);

    const ROLES = [
      { key: 'user',      label: 'Membre',      icon: Users,      color: '#64748B' },
      { key: 'moderator', label: 'Modérateur',  icon: ShieldCheck,color: '#10B981' },
      { key: 'admin',     label: 'Admin',       icon: UserCog,    color: '#2563EB' },
    ];

    const ADMIN_TYPES = [
      { key: 'content',   label: 'Admin Contenu',      icon: FileStack,  color: '#10B981', desc: "Gère les articles et la modération" },
      { key: 'library',   label: 'Admin Bibliothèque', icon: BookOpen,   color: '#3B82F6', desc: "Gère les documents et dossiers" },
      { key: 'workspace', label: 'Admin Général',      icon: LayoutGrid, color: '#F59E0B', desc: "Accès aux deux sections" },
    ];

    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={modal.indicator} />
        <View style={modal.header}>
          <Text style={modal.title}>Modifier les accès</Text>
          <TouchableOpacity onPress={() => setModalVisible(false)} style={modal.closeBtn}>
            <X size={20} color="#64748B" />
          </TouchableOpacity>
        </View>

        <View style={modal.userBox}>
          <View style={[modal.userAvatar, { backgroundColor: (ROLE_COLORS[selectedUser?.role] || '#64748B') + '20' }]}>
            <Text style={[modal.userAvatarText, { color: ROLE_COLORS[selectedUser?.role] || '#64748B' }]}>
              {(selectedUser?.name || '?')[0].toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={modal.userName}>{selectedUser?.name}</Text>
            <Text style={modal.userEmail}>{selectedUser?.email}</Text>
          </View>
        </View>

        <Text style={modal.sectionLabel}>RÔLE</Text>
        <View style={modal.roleGrid}>
          {ROLES.map(r => {
            const RIcon = r.icon;
            const isSel = selectedRole === r.key;
            return (
              <TouchableOpacity
                key={r.key}
                style={[modal.roleBtn, isSel && { borderColor: r.color, backgroundColor: r.color + '12' }]}
                onPress={() => { setSelectedRole(r.key); if (r.key !== 'admin') setSelectedAdminType(null); }}
              >
                <RIcon size={18} color={isSel ? r.color : '#475569'} />
                <Text style={[modal.roleBtnLabel, isSel && { color: r.color }]}>{r.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {selectedRole === 'admin' && (
          <>
            <Text style={modal.sectionLabel}>SPÉCIALISATION ADMIN</Text>
            {ADMIN_TYPES.map(t => {
              const TIcon = t.icon;
              const isSel = selectedAdminType === t.key;
              return (
                <TouchableOpacity
                  key={t.key}
                  style={[modal.typeBtn, isSel && { borderColor: t.color, backgroundColor: t.color + '10' }]}
                  onPress={() => setSelectedAdminType(t.key)}
                >
                  <View style={[modal.typeIconBox, { backgroundColor: t.color + '20' }]}>
                    <TIcon size={16} color={t.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[modal.typeBtnLabel, isSel && { color: t.color }]}>{t.label}</Text>
                    <Text style={modal.typeBtnDesc}>{t.desc}</Text>
                  </View>
                  {isSel && <View style={[modal.typeCheck, { backgroundColor: t.color }]} />}
                </TouchableOpacity>
              );
            })}
          </>
        )}

        <TouchableOpacity
          style={[modal.confirmBtn, updating && { opacity: 0.5 }]}
          onPress={() => handleUpdateRole(selectedRole, selectedAdminType)}
          disabled={updating || (selectedRole === 'admin' && !selectedAdminType)}
        >
          {updating
            ? <ActivityIndicator color="#FFF" />
            : <Text style={modal.confirmText}>
                {selectedRole === 'admin' && !selectedAdminType
                  ? "Choisissez une spécialisation"
                  : "Confirmer les modifications"}
              </Text>
          }
        </TouchableOpacity>

        {selectedUser?._id !== currentUser?._id && (
          <TouchableOpacity style={modal.deleteBtn} onPress={handleDeleteUser}>
            <Trash2 size={16} color="#EF4444" />
            <Text style={modal.deleteText}>Supprimer ce compte</Text>
          </TouchableOpacity>
        )}
        <View style={{ height: 30 }} />
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Crown color="#FFF" size={24} />
          <View>
            <Text style={styles.headerTitle}>Gestion Membres</Text>
            <Text style={styles.headerSub}>{users.length} comptes · {filtered.length} affichés</Text>
          </View>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersRow}>
        {FILTERS.map(f => {
          const isActive = activeFilter === f.key;
          const color    = ROLE_COLORS[f.key] || COLORS.primary;
          return (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterPill, isActive && { backgroundColor: color, borderColor: color }]}
              onPress={() => { setActiveFilter(f.key); setAdminTypeFilter(null); }}
            >
              <Text style={[styles.filterText, isActive && { color: '#FFF' }]}>{f.label}</Text>
              <Text style={[styles.filterCount, isActive && { color: 'rgba(255,255,255,0.7)' }]}>
                {users.filter(u => f.key === 'all' ? true : u.role === f.key).length}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {activeFilter === 'admin' && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subFiltersRow}>
          {ADMIN_TYPE_FILTERS.map(f => {
            const isActive = adminTypeFilter === f.key;
            return (
              <TouchableOpacity
                key={String(f.key)}
                style={[styles.subPill, isActive && f.color && { backgroundColor: f.color + '20', borderColor: f.color }]}
                onPress={() => setAdminTypeFilter(f.key)}
              >
                <Text style={[styles.subPillText, isActive && f.color && { color: f.color }]}>{f.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {loading && page === 1 ? (
        <View style={styles.loaderBox}>
          <ActivityIndicator size="large" color="#7C3AED" />
          <Text style={styles.loaderText}>Synchronisation...</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Search size={40} color="#1E293B" />
              <Text style={styles.emptyText}>Aucun membre dans cette catégorie</Text>
            </View>
          }
          ListFooterComponent={hasMore ? <ActivityIndicator color="#7C3AED" style={{ marginVertical: 20 }} /> : null}
        />
      )}

      <Modal visible={modalVisible} transparent animationType="slide" statusBarTranslucent>
        <View style={modal.overlay}>
          <View style={modal.sheet}>
            {selectedUser && <ModalContent />}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#020617' },
  header:      { backgroundColor: '#7C3AED', paddingTop: 55, paddingBottom: 20, paddingHorizontal: 20, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  headerLeft:  { flexDirection: 'row', alignItems: 'center', gap: 14 },
  headerTitle: { color: '#FFF', fontSize: 20, fontWeight: '900' },
  headerSub:   { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 2 },
  filtersRow:  { paddingHorizontal: 20, paddingVertical: 14, gap: 8 },
  filterPill:  { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#0F172A', borderWidth: 1, borderColor: '#1E293B' },
  filterText:  { color: '#64748B', fontSize: 12, fontWeight: '700' },
  filterCount: { color: '#334155', fontSize: 10, fontWeight: '900', backgroundColor: '#1E293B', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 6 },
  subFiltersRow:{ paddingHorizontal: 20, paddingBottom: 10, gap: 8 },
  subPill:     { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#0F172A', borderWidth: 1, borderColor: '#1E293B' },
  subPillText: { color: '#64748B', fontSize: 11, fontWeight: '700' },
  loaderBox:   { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loaderText:  { color: '#475569', marginTop: 10, fontSize: 12 },
  list:        { padding: 16, paddingBottom: 40 },
  card:        { backgroundColor: '#0F172A', padding: 16, borderRadius: 20, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 1, borderColor: '#1E293B' },
  cardLocked:  { opacity: 0.5 },
  cardAvatar:  { width: 46, height: 46, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  cardAvatarText:{ fontSize: 18, fontWeight: '900' },
  cardInfo:    { flex: 1 },
  nameRow:     { flexDirection: 'row', alignItems: 'center' },
  cardName:    { color: '#F8FAFC', fontSize: 15, fontWeight: '800' },
  meBadge:     { marginLeft: 8, backgroundColor: '#10B98120', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  meText:      { color: '#10B981', fontSize: 9, fontWeight: '900' },
  emailRow:    { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 },
  cardEmail:   { color: '#334155', fontSize: 11, fontWeight: '500', flex: 1 },
  empty:       { alignItems: 'center', paddingTop: 80 },
  emptyText:   { color: '#334155', fontSize: 14, fontWeight: '600', marginTop: 16 },
});

const modal = StyleSheet.create({
  overlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.88)', justifyContent: 'flex-end' },
  sheet:      { backgroundColor: '#0F172A', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 10, maxHeight: '90%' },
  indicator:  { width: 42, height: 5, backgroundColor: '#1E293B', borderRadius: 10, alignSelf: 'center', marginBottom: 22 },
  header:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title:      { color: '#FFF', fontSize: 18, fontWeight: '900' },
  closeBtn:   { backgroundColor: '#1E293B', padding: 8, borderRadius: 10 },
  userBox:    { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#020617', padding: 16, borderRadius: 18, marginBottom: 24, borderWidth: 1, borderColor: '#1E293B' },
  userAvatar: { width: 44, height: 44, borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
  userAvatarText: { fontSize: 18, fontWeight: '900' },
  userName:   { color: '#FFF', fontSize: 16, fontWeight: '800' },
  userEmail:  { color: '#475569', fontSize: 12, marginTop: 2 },
  sectionLabel:{ color: '#334155', fontSize: 10, fontWeight: '900', letterSpacing: 2, marginBottom: 12, marginTop: 4 },
  roleGrid:   { flexDirection: 'row', gap: 10, marginBottom: 20 },
  roleBtn:    { flex: 1, alignItems: 'center', padding: 14, borderRadius: 16, borderWidth: 1, borderColor: '#1E293B', gap: 8, backgroundColor: '#020617' },
  roleBtnLabel:{ color: '#475569', fontSize: 11, fontWeight: '800' },
  typeBtn:    { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 18, borderWidth: 1, borderColor: '#1E293B', gap: 14, marginBottom: 10, backgroundColor: '#020617' },
  typeIconBox:{ width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  typeBtnLabel:{ color: '#F8FAFC', fontSize: 14, fontWeight: '800' },
  typeBtnDesc:{ color: '#475569', fontSize: 11, marginTop: 2 },
  typeCheck:  { width: 10, height: 10, borderRadius: 5 },
  confirmBtn: { backgroundColor: COLORS.primary, borderRadius: 18, paddingVertical: 16, alignItems: 'center', marginTop: 20, marginBottom: 12 },
  confirmText:{ color: '#FFF', fontWeight: '900', fontSize: 15 },
  deleteBtn:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 14, borderRadius: 18, borderWidth: 1, borderColor: '#EF444425', backgroundColor: '#EF444408' },
  deleteText: { color: '#EF4444', fontWeight: '800', fontSize: 14 },
});