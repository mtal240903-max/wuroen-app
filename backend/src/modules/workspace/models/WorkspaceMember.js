// src/modules/workspace/models/CompanyMember.js
const mongoose = require('mongoose');

const CompanyMemberSchema = new mongoose.Schema({
  // Lien vers l'entreprise spécifique
  company: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Company', 
    required: true 
  },
  // L'utilisateur invité
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  role: { 
    type: String, 
    enum: ['admin', 'manager', 'member'], 
    default: 'member' 
  },
  permissions: [{ 
    type: String // ex: 'manage_members', 'approve_document'
  }],
  status: { 
    type: String, 
    enum: ['pending', 'active', 'declined'], 
    default: 'active' 
  }
}, { 
  timestamps: true 
});

// Empêche un utilisateur d'être ajouté deux fois à la même entreprise
CompanyMemberSchema.index({ company: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('CompanyMember', CompanyMemberSchema);