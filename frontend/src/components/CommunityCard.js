import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';

const CommunityCard = ({ community, onPress }) => {
  // Fonction utilitaire pour la couleur des badges selon le niveau
  const getLevelColor = (level) => {
    switch(level) {
      case 1: return 'bg-yellow-500'; // Fondateur
      case 2: return 'bg-blue-500';   // Responsable
      default: return 'bg-gray-400';  // Membre
    }
  };

  return (
    <TouchableOpacity 
      onPress={onPress}
      className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-3 flex-row items-center"
    >
      {/* Avatar / Icône de la communauté */}
      <View className="w-14 h-14 bg-gray-200 rounded-xl items-center justify-center mr-4">
        <Text className="text-xl font-bold text-gray-500">
          {community.name.substring(0, 2).toUpperCase()}
        </Text>
      </View>

      {/* Détails */}
      <View className="flex-1">
        <Text className="text-lg font-bold text-gray-800">{community.name}</Text>
        <Text className="text-sm text-gray-500 mb-2">{community.memberCount} membres</Text>
        
        {/* Badge de niveau utilisateur */}
        <View className={`self-start px-2 py-1 rounded-full ${getLevelColor(community.userLevel)}`}>
          <Text className="text-[10px] text-white font-bold">
            NIVEAU {community.userLevel}
          </Text>
        </View>
      </View>

      {/* Icône de navigation */}
      <Text className="text-blue-500 font-bold">Entrer →</Text>
    </TouchableOpacity>
  );
};

export default CommunityCard;