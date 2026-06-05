import React, { useContext, useMemo } from 'react';
import { View, ActivityIndicator, Platform, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Book, MessageSquare, User } from 'lucide-react-native';

import { navigationRef } from '../../App'; 
import { AuthContext } from '../context/AuthContext';
import { COLORS } from '../theme/theme';

// --- IMPORTS DES ÉCRANS ---
// (Vos imports restent identiques, assurez-vous qu'ils sont bien résolus)
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import HomeScreen from '../screens/home/HomeScreen';
import LibraryScreen from '../screens/library/LibraryScreen';
import InboxScreen from '../screens/messages/InboxScreen';
import ProfileScreen from '../screens/user/ProfileScreen';
import ArticleDetailScreen from '../screens/articles/ArticleDetailScreen';
import CreateArticleScreen from '../screens/articles/CreateArticleScreen';
import UserProfileScreen from '../screens/user/UserProfileScreen';
import CollaborationRequestsScreen from '../screens/relations/CollaborationRequestsScreen';
import SearchScreen from '../screens/home/recherche/SearchScreen';
import MenuScreen from '../screens/menu/MenuScreen';
import ChatDetailScreen from '../screens/messages/ChatDetailScreen';
import GroupChatDetailScreen from '../screens/messages/GroupChatDetailScreen'; 
import SearchUsersScreen from '../screens/messages/SearchUsersScreen';
import MessageOptionsScreen from '../screens/messages/MessageOptionsScreen';
import CreateGroup from '../screens/messages/paramètres_messages/CreateGroupScreen';
import BlockedUsers from '../screens/messages/paramètres_messages/BlockedUsersScreen';
import ArchivedChats from '../screens/messages/paramètres_messages/ArchivedChatsScreen';
import MuteSettings from '../screens/messages/paramètres_messages/MuteSettingsScreen';
import CallScreen from '../screens/messages/CallScreen'; 
import GroupSettingsScreen from '../screens/messages/paramètres_groupes/GroupSettingsScreen';
import GroupMembersScreen from '../screens/messages/paramètres_groupes/GroupMembersScreen';
import SharedFilesScreen from '../screens/messages/paramètres_groupes/SharedFilesScreen';
import AddMembersScreen from '../screens/messages/paramètres_groupes/AddMembersScreen';
import NotificationsScreen from '../screens/user/NotificationsScreen';
import SettingsScreen from '../screens/user/SettingsScreen';
import EditProfileScreen from '../screens/user/EditProfileScreen';
import MyArticlesScreen from '../screens/user/MyArticlesScreen';
import SavedArticlesScreen from '../screens/user/SavedArticlesScreen';
import ProfilePrivacyScreen from '../screens/user/paramètres_profile/ProfilePrivacyScreen';
import SecurityScreen from '../screens/user/paramètres_profile/SecurityScreen';
import NotificationsSettingsScreen from '../screens/user/paramètres_profile/NotificationsSettingsScreen';
import LanguageSettingsScreen from '../screens/user/paramètres_profile/LanguageSettingsScreen';
import StorageSettingsScreen from '../screens/user/paramètres_profile/StorageSettingsScreen';
import AboutScreen from '../screens/user/paramètres_profile/AboutScreen';
import PrivacyPolicyScreen from '../screens/user/paramètres_profile/PrivacyPolicyScreen';
import SuperAdminDashboardScreen from '../screens/admin/superadmin/SuperAdminDashboardScreen';
import AdminDashboardScreen from '../screens/admin/dashboard/AdminDashboardScreen';
import AdminArticlesScreen from '../screens/admin/dashboard/AdminArticlesScreen';
import LibraryManagementScreen from '../screens/admin/dashboard/LibraryManagementScreen';
import UsersManagementScreen from '../screens/admin/superadmin/UsersManagementScreen';
import ModerationScreen from '../screens/admin/moderator/ModerationScreen';
import ArticleDetailReview from '../screens/admin/moderator/ArticleDetailReview';
import AdminLibraryManager from '../screens/admin/superadmin/AdminLibraryManager';
import AdminAddResource from '../screens/admin/dashboard/AdminAddResource'; 
import ResourceDetailScreen from '../screens/library/ResourceDetailScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const headerOptions = {
  headerStyle: { backgroundColor: '#0F172A', elevation: 0, shadowOpacity: 0, borderBottomWidth: 1, borderBottomColor: '#1E293B' },
  headerTitleStyle: { fontWeight: '800', fontSize: 17, color: '#F1F5F9' },
  headerTintColor: COLORS.primary,
  headerBackTitleVisible: false,
};

const MainTabs = () => {
  const { unreadCount, collabCount } = useContext(AuthContext);

  const screenOptions = useMemo(() => ({
    tabBarActiveTintColor: COLORS.primary,
    tabBarInactiveTintColor: '#94A3B8',
    tabBarStyle: { 
      height: Platform.OS === 'ios' ? 88 : 68, 
      paddingBottom: Platform.OS === 'ios' ? 30 : 12, 
      paddingTop: 10, 
      backgroundColor: '#0F172A', 
      borderTopWidth: 1, 
      borderTopColor: '#1E293B' 
    },
    headerShown: false,
    tabBarLabelStyle: { fontSize: 11, fontWeight: '700', marginTop: -5 }
  }), []);

  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen name="Accueil" component={HomeScreen} options={{ tabBarIcon: ({ color }) => <Home color={color} size={22} /> }} />
      <Tab.Screen name="Biblio" component={LibraryScreen} options={{ tabBarIcon: ({ color }) => <Book color={color} size={22} /> }} />
      <Tab.Screen 
        name="Messages" 
        component={InboxScreen} 
        options={{ 
          tabBarIcon: ({ color }) => <MessageSquare color={color} size={22} />, 
          tabBarBadge: unreadCount > 0 ? unreadCount : null, 
          tabBarBadgeStyle: { backgroundColor: '#EF4444', fontSize: 10, fontWeight: 'bold' } 
        }} 
      />
      <Tab.Screen 
        name="Profil" 
        component={ProfileScreen} 
        options={{ 
          tabBarIcon: ({ color }) => <User color={color} size={22} />, 
          tabBarBadge: collabCount > 0 ? collabCount : null, 
          tabBarBadgeStyle: { backgroundColor: COLORS.primary, fontSize: 10, fontWeight: 'bold' } 
        }} 
      />
    </Tab.Navigator>
  );
};

export default function AppNavigator() {
  const { userToken, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={headerOptions}>
        {!userToken ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
          </>
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
            <Stack.Screen name="Menu" component={MenuScreen} options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ title: 'Espace Administration' }} />
            <Stack.Screen name="LibraryManagement" component={LibraryManagementScreen} options={{ title: 'Gestion Bibliothèque' }} />
            <Stack.Screen name="AdminArticles" component={AdminArticlesScreen} options={{ title: 'Gestion des Flux' }} />
            <Stack.Screen name="SuperAdminDashboard" component={SuperAdminDashboardScreen} options={{ headerShown: false }} />
            <Stack.Screen name="UsersManagement" component={UsersManagementScreen} options={{ title: "Gestion des Membres" }} />
            <Stack.Screen name="AdminLibraryManager" component={AdminLibraryManager} options={{ title: "Configuration Avancée" }} />
            <Stack.Screen name="AdminAddResource" component={AdminAddResource} options={{ title: "Nouveau Document" }} />
            <Stack.Screen name="ModerationScreen" component={ModerationScreen} options={{ title: "Files de Modération" }} />
            <Stack.Screen name="ArticleDetailReview" component={ArticleDetailReview} options={{ title: "Révision Technique" }} />
            <Stack.Screen name="ArticleDetail" component={ArticleDetailScreen} options={{ headerShown: false }} />
            <Stack.Screen name="ResourceDetail" component={ResourceDetailScreen} options={{ headerShown: false }} />
            <Stack.Screen name="CreateArticle" component={CreateArticleScreen} options={{ title: 'Publication' }} />
            <Stack.Screen name="UserProfile" component={UserProfileScreen} options={{ title: "Profil Expert" }} />
            <Stack.Screen name="ChatDetail" component={ChatDetailScreen} options={{ headerShown: false }} />
            <Stack.Screen name="GroupChatDetail" component={GroupChatDetailScreen} options={{ headerShown: false }} />
            <Stack.Screen name="CollaborationRequests" component={CollaborationRequestsScreen} options={{ title: "Demandes d'accès" }} />
            <Stack.Screen name="Search" component={SearchScreen} options={{ headerShown: false }} />
            <Stack.Screen name="SearchUsers" component={SearchUsersScreen} options={{ headerShown: false }} />
            <Stack.Screen name="MessageOptions" component={MessageOptionsScreen} options={{ headerShown: false }} />
            <Stack.Screen name="CreateGroup" component={CreateGroup} options={{ title: 'Nouveau Groupe' }} />
            <Stack.Screen name="BlockedUsers" component={BlockedUsers} options={{ title: 'Contacts Bloqués' }} />
            <Stack.Screen name="ArchivedChats" component={ArchivedChats} options={{ title: 'Archives' }} />
            <Stack.Screen name="MuteSettings" component={MuteSettings} options={{ title: 'Notifications' }} />
            <Stack.Screen name="GroupSettings" component={GroupSettingsScreen} options={{ headerShown: false }} />
            <Stack.Screen name="GroupMembersScreen" component={GroupMembersScreen} options={{ title: 'Membres du groupe' }} />
            <Stack.Screen name="SharedFilesScreen" component={SharedFilesScreen} options={{ title: 'Ressources partagées' }} />
            <Stack.Screen name="AddMembersScreen" component={AddMembersScreen} options={{ title: 'Inviter des chercheurs' }} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Modifier Profil' }} />
            <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Paramètres' }} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Centre d\'alertes' }} />
            <Stack.Screen name="MyArticles" component={MyArticlesScreen} options={{ title: 'Mes Publications' }} />
            <Stack.Screen name="SavedArticles" component={SavedArticlesScreen} options={{ title: 'Favoris' }} />
            <Stack.Screen name="ProfilePrivacy" component={ProfilePrivacyScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Security" component={SecurityScreen} options={{ headerShown: false }} />
            <Stack.Screen name="NotificationsSettings" component={NotificationsSettingsScreen} options={{ headerShown: false }} />
            <Stack.Screen name="LanguageSettings" component={LanguageSettingsScreen} options={{ headerShown: false }} />
            <Stack.Screen name="StorageSettings" component={StorageSettingsScreen} options={{ headerShown: false }} />
            <Stack.Screen name="About" component={AboutScreen} options={{ headerShown: false }} />
            <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} options={{ headerShown: false }} />
            <Stack.Screen name="CallScreen" component={CallScreen} options={{ headerShown: false, animation: 'fade_from_bottom' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#020617' },
});