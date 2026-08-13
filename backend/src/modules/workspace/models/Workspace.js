const mongoose = require('mongoose');

const WorkspaceSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxLength: 100 },
  plan: { type: String, enum: ['free', 'premium'], default: 'free' },
  type: { type: String, required: true, default: 'company' },
  
  // Les champs requis par ton contrôleur de sécurité
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, default: 'Owner' },
    joinedAt: { type: Date, default: Date.now }
  }],
  enabledApps: [{ type: String }]
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Workspace', WorkspaceSchema);