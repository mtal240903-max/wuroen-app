const mongoose = require('mongoose');

const CommunitySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  description: String,
  
  // 🔗 Liaison avec le Workspace (l'organisation)
  workspaceId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Workspace', 
    required: true 
  },

  // 🔗 Créateur de la communauté (Fondateur par défaut)
  creator: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },

  // Configuration de visibilité
  visibility: { 
    type: String, 
    enum: ['public', 'private'], 
    default: 'public' 
  },

  // Liste des membres globaux de la communauté
  members: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }]
}, { 
  timestamps: true 
});

// Index pour accélérer la recherche des communautés d'un workspace
CommunitySchema.index({ workspaceId: 1 });

module.exports = mongoose.models.Community || mongoose.model('Community', CommunitySchema);