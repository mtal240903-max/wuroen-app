const mongoose = require('mongoose');

const CommunityMemberSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  communityId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Community', 
    required: true 
  },

  // Rôle textuel (ex: "président", "secrétaire", "admin", "membre")
  role: { 
    type: String, 
    required: true 
  },

  // Niveau hiérarchique pour l'organigramme (1 = Fondateur/Plus haut, 5 = Membre simple)
  level: { 
    type: Number, 
    default: 5 
  },

  // Gestion des mandats (Spécifique aux associations/organisations)
  mandate: {
    startDate: { type: Date, default: Date.now },
    endDate: Date,
    status: { type: String, enum: ['active', 'expired'], default: 'active' }
  },

  // Permissions granulaires (ex: "manage_members", "send_announcements")
  permissions: [{ 
    type: String 
  }],

  department: { type: String, default: "Général" },
  position: { type: String, default: "Membre" }

}, { 
  timestamps: true 
});

// Index pour optimiser les recherches fréquentes
CommunityMemberSchema.index({ communityId: 1, userId: 1 }, { unique: true });
CommunityMemberSchema.index({ level: 1 });

module.exports = mongoose.models.CommunityMember || mongoose.model('CommunityMember', CommunityMemberSchema);