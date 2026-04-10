import React, { useContext } from 'react';
import { View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Book, MessageSquare, User, ArrowLeft } from 'lucide-react-native';

import { AuthContext } from '../context/AuthContext';
import { COLORS } from '../theme/theme';

// Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import HomeScreen from '../screens/user/HomeScreen';
import LibraryScreen from '../screens/library/LibraryScreen';
import InboxScreen from '../screens/messages/InboxScreen';
import ProfileScreen from '../screens/user/ProfileScreen';
import ArticleDetailScreen from '../screens/user/ArticleDetailScreen'; 
import CreateArticleScreen from '../screens/user/CreateArticleScreen';
import UserProfileScreen from '../screens/user/UserProfileScreen'; 
import CollaborationRequestsScreen from '../screens/user/CollaborationRequestsScreen'; 
import ChatDetailScreen from '../screens/messages/ChatDetailScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// --- TABS (Mise à jour avec Double Badge) ---
const MainTabs = () => {
  // ✅ On récupère les deux compteurs pour les badges
  const { unreadCount, collabCount } = useContext(AuthContext);

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: { 
          height: 65, 
          paddingBottom: 10,
          paddingTop: 5,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: COLORS.border
        },
        headerShown: false 
      }}
    >
      <Tab.Screen 
        name="Accueil" 
        component={HomeScreen} 
        options={{ 
          tabBarIcon: ({ color }) => <Home color={color} size={24} />
        }} 
      />

      <Tab.Screen 
        name="Bibliothèque" 
        component={LibraryScreen} 
        options={{ 
          tabBarIcon: ({ color }) => <Book color={color} size={24} />
        }} 
      />

      <Tab.Screen 
        name="Messages" 
        component={InboxScreen} 
        options={{ 
          tabBarIcon: ({ color }) => <MessageSquare color={color} size={24} />,
          // Badge pour les messages non lus
          tabBarBadge: unreadCount > 0 ? unreadCount : null,
          tabBarBadgeStyle: {
            backgroundColor: '#FF3B30',
            color: '#FFF',
            fontSize: 10,
            fontWeight: 'bold',
          }
        }} 
      />

      <Tab.Screen 
        name="Profil" 
        component={ProfileScreen} 
        options={{ 
          tabBarIcon: ({ color }) => <User color={color} size={24} />,
          // ✅ Badge pour les demandes de collaboration en attente
          tabBarBadge: collabCount > 0 ? collabCount : null,
          tabBarBadgeStyle: {
            backgroundColor: COLORS.primary, // On utilise le bleu MTAL pour différencier des messages
            color: '#FFF',
            fontSize: 10,
            fontWeight: 'bold',
          }
        }} 
      />
    </Tab.Navigator>
  );
};


// --- NAV PRINCIPAL ---
export default function AppNavigator() {
  const { userToken, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: COLORS.background 
      }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        
        {userToken == null ? (
          // AUTH
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
          // APP
          <>
            <Stack.Screen 
              name="Main" 
              component={MainTabs} 
              options={{ headerShown: false }}
            />

            <Stack.Screen 
              name="ArticleDetail" 
              component={ArticleDetailScreen} 
              options={{ title: "Détail de l'article" }}
            />

            <Stack.Screen 
              name="CreateArticle" 
              component={CreateArticleScreen} 
              options={{ title: "Créer un article" }}
            />

            <Stack.Screen 
              name="ChatDetail" 
              component={ChatDetailScreen} 
              options={{ headerShown: false }}
            />

            <Stack.Screen 
              name="CollaborationRequests" 
              component={CollaborationRequestsScreen} 
              options={({ navigation }) => ({ 
                headerShown: true, 
                title: 'Demandes reçues',
                headerTitleStyle: { fontWeight: 'bold', fontSize: 16 },
                headerLeft: () => (
                  <TouchableOpacity 
                    style={{ marginLeft: 15 }} 
                    onPress={() => navigation.goBack()}
                  >
                    <ArrowLeft color={COLORS.textPrimary || '#000'} size={24} />
                  </TouchableOpacity>
                )
              })} 
            />

            <Stack.Screen 
              name="UserProfile" 
              component={UserProfileScreen} 
              options={{ 
                headerShown: true, 
                title: 'Profil du Chercheur' 
              }} 
            />
          </>
        )}

      </Stack.Navigator>
    </NavigationContainer>
  );
}