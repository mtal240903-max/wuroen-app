import React, { useContext } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer, CommonActions } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Référence unifiée pour la navigation hors-composant
import { navigationRef } from './RootNavigation';

// Contextes
import { AuthContext } from '../context/AuthContext';
import { COLORS } from '../theme/theme';
import { ProjectProvider } from '../modules/workspace/context/ProjectContext';

// Navigation Workspace (IMPORT AJOUTÉ)
import WorkspaceNavigator from '../modules/workspace/navigation/WorkspaceNavigator';

// Bulle FAB et menu flottant globaux
import FloatingFab from '../components/FloatingFab';
import FloatingMenu from '../components/FloatingMenu';

// ================================
// IMPORTS DES ÉCRANS
// ================================

// Auth
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Écrans principaux
import HomeScreen from '../screens/home/HomeScreen';
import LibraryScreen from '../screens/library/LibraryScreen';
import InboxScreen from '../screens/messages/InboxScreen';
import ProfileScreen from '../screens/user/ProfileScreen';
import ToolsScreen from '../screens/outils/ToolsScreen';

// Articles
import ArticleDetailScreen from '../screens/articles/ArticleDetailScreen';
import CreateArticleScreen from '../screens/articles/CreateArticleScreen';

// Utilisateurs
import UserProfileScreen from '../screens/user/UserProfileScreen';
import CollaborationRequestsScreen from '../screens/relations/CollaborationRequestsScreen';

// Recherche / Menu
import SearchScreen from '../screens/home/recherche/SearchScreen';
import MenuScreen from '../screens/menu/MenuScreen';

// Messages
import ChatDetailScreen from '../screens/messages/ChatDetailScreen';
import GroupChatDetailScreen from '../screens/messages/GroupChatDetailScreen';
import SearchUsersScreen from '../screens/messages/SearchUsersScreen';
import MessageOptionsScreen from '../screens/messages/MessageOptionsScreen';

import CreateGroup from '../screens/messages/paramètres_messages/CreateGroupScreen';
import BlockedUsers from '../screens/messages/paramètres_messages/BlockedUsersScreen';
import ArchivedChats from '../screens/messages/paramètres_messages/ArchivedChatsScreen';
import MuteSettings from '../screens/messages/paramètres_messages/MuteSettingsScreen';

import CallScreen from '../screens/messages/CallScreen';

// Groupes
import GroupSettingsScreen from '../screens/messages/paramètres_groupes/GroupSettingsScreen';
import GroupMembersScreen from '../screens/messages/paramètres_groupes/GroupMembersScreen';
import SharedFilesScreen from '../screens/messages/paramètres_groupes/SharedFilesScreen';
import AddMembersScreen from '../screens/messages/paramètres_groupes/AddMembersScreen';

// Profil / paramètres
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

// Administration
import SuperAdminDashboardScreen from '../screens/admin/superadmin/SuperAdminDashboardScreen';
import AdminDashboardScreen from '../screens/admin/dashboard/AdminDashboardScreen';
import AdminArticlesScreen from '../screens/admin/dashboard/AdminArticlesScreen';
import LibraryManagementScreen from '../screens/admin/dashboard/LibraryManagementScreen';
import UsersManagementScreen from '../screens/admin/superadmin/UsersManagementScreen';
import ModerationScreen from '../screens/admin/moderator/ModerationScreen';
import ArticleDetailReview from '../screens/admin/moderator/ArticleDetailReview';
import AdminLibraryManager from '../screens/admin/superadmin/AdminLibraryManager';
import AdminAddResource from '../screens/admin/dashboard/AdminAddResource';
import AdminToolsScreen from '../screens/admin/superadmin/AdminToolsScreen';

// Bibliothèque
import ResourceDetailScreen from '../screens/library/ResourceDetailScreen';


// ==========================================
// STACK NAVIGATOR
// ==========================================

const Stack = createStackNavigator();


// ==========================================
// OPTIONS GÉNÉRALES DU HEADER
// ==========================================

const headerOptions = {
  headerStyle: {
    backgroundColor: '#0F172A',
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },

  headerTitleStyle: {
    fontWeight: '800',
    fontSize: 17,
    color: '#F1F5F9',
  },

  headerTintColor: COLORS.primary,

  headerBackTitleVisible: false,
};


// ==========================================
// NAVIGATEUR PRINCIPAL
// ==========================================

export default function AppNavigator() {

  const { userToken, isLoading } = useContext(AuthContext);


  // ------------------------------------------
  // Écran de chargement
  // ------------------------------------------

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
        />
      </View>
    );
  }


  // ------------------------------------------
  // Navigation
  // ------------------------------------------

  return (
    <ProjectProvider>

      <View style={styles.container}>

        <NavigationContainer ref={navigationRef}>

          <Stack.Navigator screenOptions={headerOptions}>

            {/* ==================================
                UTILISATEUR NON CONNECTÉ
            ================================== */}

            {!userToken ? (

              <>
                <Stack.Screen
                  name="Login"
                  component={LoginScreen}
                  options={{ headerShown: false }}
                />

                <Stack.Screen
                  name="Register"
                  component={RegisterScreen}
                  options={{ headerShown: false }}
                />
              </>

            ) : (

              <>
                {/* ==================================
                    ÉCRANS PRINCIPAUX
                ================================== */}

                <Stack.Screen
                  name="Home"
                  component={HomeScreen}
                  options={{ headerShown: false }}
                />

                <Stack.Screen
                  name="Outils"
                  component={ToolsScreen}
                  options={{ title: 'Outils' }}
                />

                <Stack.Screen
                  name="Library"
                  component={LibraryScreen}
                  options={{ title: 'Bibliothèque' }}
                />

                <Stack.Screen
                  name="Messages"
                  component={InboxScreen}
                  options={{ title: 'Messages' }}
                />

                <Stack.Screen
                  name="Profil"
                  component={ProfileScreen}
                  options={{ title: 'Profil' }}
                />

                {/* ==================================
                    WORKSPACE
                ================================== */}

                <Stack.Screen
                  name="Workspace"
                  component={WorkspaceNavigator}
                  options={{ headerShown: false }}
                />

                {/* ==================================
                    MENU
                ================================== */}

                <Stack.Screen
                  name="Menu"
                  component={MenuScreen}
                  options={{
                    headerShown: false,
                    animation: 'slide_from_right',
                  }}
                />

                {/* ==================================
                    ADMINISTRATION
                ================================== */}

                <Stack.Screen
                  name="AdminDashboard"
                  component={AdminDashboardScreen}
                  options={{ title: 'Espace Administration' }}
                />

                <Stack.Screen
                  name="LibraryManagement"
                  component={LibraryManagementScreen}
                  options={{ title: 'Gestion Bibliothèque' }}
                />

                <Stack.Screen
                  name="AdminArticles"
                  component={AdminArticlesScreen}
                  options={{ title: 'Gestion des Flux' }}
                />

                <Stack.Screen
                  name="SuperAdminDashboard"
                  component={SuperAdminDashboardScreen}
                  options={{ headerShown: false }}
                />

                <Stack.Screen
                  name="UsersManagement"
                  component={UsersManagementScreen}
                  options={{ title: 'Gestion des Membres' }}
                />

                <Stack.Screen
                  name="AdminLibraryManager"
                  component={AdminLibraryManager}
                  options={{ title: 'Configuration Avancée' }}
                />

                <Stack.Screen
                  name="AdminAddResource"
                  component={AdminAddResource}
                  options={{ title: 'Nouveau Document' }}
                />

                <Stack.Screen
                  name="AdminToolsManager"
                  component={AdminToolsScreen}
                  options={{ headerShown: false }}
                />

                <Stack.Screen
                  name="ModerationScreen"
                  component={ModerationScreen}
                  options={{ title: 'Files de Modération' }}
                />

                <Stack.Screen
                  name="ArticleDetailReview"
                  component={ArticleDetailReview}
                  options={{ title: 'Révision Technique' }}
                />

                {/* ==================================
                    ARTICLES
                ================================== */}

                <Stack.Screen
                  name="ArticleDetail"
                  component={ArticleDetailScreen}
                  options={{ headerShown: false }}
                />

                <Stack.Screen
                  name="ResourceDetail"
                  component={ResourceDetailScreen}
                  options={{ headerShown: false }}
                />

                <Stack.Screen
                  name="CreateArticle"
                  component={CreateArticleScreen}
                  options={{ title: 'Publication' }}
                />

                {/* ==================================
                    UTILISATEURS
                ================================== */}

                <Stack.Screen
                  name="UserProfile"
                  component={UserProfileScreen}
                  options={{ title: 'Profil Expert' }}
                />

                <Stack.Screen
                  name="CollaborationRequests"
                  component={CollaborationRequestsScreen}
                  options={{ title: "Demandes d'accès" }}
                />

                {/* ==================================
                    RECHERCHE
                ================================== */}

                <Stack.Screen
                  name="Search"
                  component={SearchScreen}
                  options={{ headerShown: false }}
                />

                <Stack.Screen
                  name="SearchUsers"
                  component={SearchUsersScreen}
                  options={{ headerShown: false }}
                />

                {/* ==================================
                    MESSAGES
                ================================== */}

                <Stack.Screen
                  name="ChatDetail"
                  component={ChatDetailScreen}
                  options={{ headerShown: false }}
                />

                <Stack.Screen
                  name="GroupChatDetail"
                  component={GroupChatDetailScreen}
                  options={{ headerShown: false }}
                />

                <Stack.Screen
                  name="MessageOptions"
                  component={MessageOptionsScreen}
                  options={{ headerShown: false }}
                />

                <Stack.Screen
                  name="CreateGroup"
                  component={CreateGroup}
                  options={{ title: 'Nouveau Groupe' }}
                />

                <Stack.Screen
                  name="BlockedUsers"
                  component={BlockedUsers}
                  options={{ title: 'Contacts Bloqués' }}
                />

                <Stack.Screen
                  name="ArchivedChats"
                  component={ArchivedChats}
                  options={{ title: 'Archives' }}
                />

                <Stack.Screen
                  name="MuteSettings"
                  component={MuteSettings}
                  options={{ title: 'Notifications' }}
                />

                {/* ==================================
                    GROUPES
                ================================== */}

                <Stack.Screen
                  name="GroupSettings"
                  component={GroupSettingsScreen}
                  options={{ headerShown: false }}
                />

                <Stack.Screen
                  name="GroupMembersScreen"
                  component={GroupMembersScreen}
                  options={{ title: 'Membres du groupe' }}
                />

                <Stack.Screen
                  name="SharedFilesScreen"
                  component={SharedFilesScreen}
                  options={{ title: 'Ressources partagées' }}
                />

                <Stack.Screen
                  name="AddMembersScreen"
                  component={AddMembersScreen}
                  options={{ title: 'Inviter des chercheurs' }}
                />

                {/* ==================================
                    PROFIL / PARAMÈTRES
                ================================== */}

                <Stack.Screen
                  name="EditProfile"
                  component={EditProfileScreen}
                  options={{ title: 'Modifier Profil' }}
                />

                <Stack.Screen
                  name="Settings"
                  component={SettingsScreen}
                  options={{ title: 'Paramètres' }}
                />

                <Stack.Screen
                  name="Notifications"
                  component={NotificationsScreen}
                  options={{ title: "Centre d'alertes" }}
                />

                <Stack.Screen
                  name="MyArticles"
                  component={MyArticlesScreen}
                  options={{ title: 'Mes Publications' }}
                />

                <Stack.Screen
                  name="SavedArticles"
                  component={SavedArticlesScreen}
                  options={{ title: 'Favoris' }}
                />

                <Stack.Screen
                  name="ProfilePrivacy"
                  component={ProfilePrivacyScreen}
                  options={{ headerShown: false }}
                />

                <Stack.Screen
                  name="Security"
                  component={SecurityScreen}
                  options={{ headerShown: false }}
                />

                <Stack.Screen
                  name="NotificationsSettings"
                  component={NotificationsSettingsScreen}
                  options={{ headerShown: false }}
                />

                <Stack.Screen
                  name="LanguageSettings"
                  component={LanguageSettingsScreen}
                  options={{ headerShown: false }}
                />

                <Stack.Screen
                  name="StorageSettings"
                  component={StorageSettingsScreen}
                  options={{ headerShown: false }}
                />

                <Stack.Screen
                  name="About"
                  component={AboutScreen}
                  options={{ headerShown: false }}
                />

                <Stack.Screen
                  name="PrivacyPolicy"
                  component={PrivacyPolicyScreen}
                  options={{ headerShown: false }}
                />

                {/* ==================================
                    APPELS
                ================================== */}

                <Stack.Screen
                  name="CallScreen"
                  component={CallScreen}
                  options={{
                    headerShown: false,
                    animation: 'fade_from_bottom',
                  }}
                />

              </>
            )}

          </Stack.Navigator>

        </NavigationContainer>

        {/* ==================================
            BULLE ET MENU FLOTTANTS GLOBAUX
        ================================== */}
        {userToken && (
          <>
            <FloatingFab
              onPress={() => navigationRef.navigate('CreateArticle')}
            />
            <FloatingMenu
              onHomePress={() => {
                navigationRef.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'Home' }],
                  })
                );
              }}
            />
          </>
        )}

      </View>

    </ProjectProvider>
  );
}


// ==========================================
// STYLES
// ==========================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#020617',
    position: 'relative',
  },

  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#020617',
  },

});