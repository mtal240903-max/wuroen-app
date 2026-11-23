import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Import du fournisseur de contexte unifié
import { WorkspaceProvider } from '../../../context/WorkspaceContext';

// Import des écrans principaux
import WorkspaceHomeScreen from '../screens/WorkspaceHomeScreen'; 
import SelectWorkspaceScreen from '../screens/SelectWorkspaceScreen';
import WorkspaceDashboardScreen from '../screens/WorkspaceDashboardScreen'; 
import CreateWorkspaceScreen from '../screens/CreateWorkspaceScreen';

// Import des écrans Projets
import ProjectsScreen from '../screens/projects/ProjectsScreen'; 
import CreateProjectScreen from '../screens/projects/CreateProjectScreen'; 
import ProjectDetailScreen from '../screens/projects/ProjectDetailScreen'; 

// Import des écrans Companies
import CompaniesScreen from '../screens/companies/CompaniesScreen';
import CreateCompanyScreen from '../screens/companies/CreateCompanyScreen'; 
import CompanyDetailScreen from '../screens/companies/CompanyDetailScreen'; 
import CompanyStaffScreen from '../screens/companies/CompanyStaffScreen';

const Stack = createStackNavigator();

export default function WorkspaceNavigator() {
  return (
    <WorkspaceProvider>
      <Stack.Navigator
        initialRouteName="WorkspaceHome"
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#090D1A' },
        }}
      >
        <Stack.Screen name="WorkspaceHome" component={WorkspaceHomeScreen} />
        <Stack.Screen name="SelectWorkspace" component={SelectWorkspaceScreen} />
        <Stack.Screen name="WorkspaceDashboard" component={WorkspaceDashboardScreen} />
        
        {/* Nom mis à jour pour correspondre à navigation.navigate('CreateWorkspaceScreen') */}
        <Stack.Screen name="CreateWorkspaceScreen" component={CreateWorkspaceScreen} />
        
        {/* Projets */}
        <Stack.Screen name="Projects" component={ProjectsScreen} />
        <Stack.Screen name="CreateProject" component={CreateProjectScreen} />
        <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} />
        
        {/* Entreprises */}
        <Stack.Screen name="Companies" component={CompaniesScreen} />
        <Stack.Screen name="CreateCompany" component={CreateCompanyScreen} />
        <Stack.Screen name="CompanyDetail" component={CompanyDetailScreen} />
        <Stack.Screen name="CompanyStaff" component={CompanyStaffScreen} />
      </Stack.Navigator>
    </WorkspaceProvider>
  );
}