const mongoose = require('mongoose');

const TeamMemberSchema = new mongoose.Schema({
  // Le workspace concerné
  workspace: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Workspace', 
    required: true, 
    index: true 
  },
  // L'utilisateur invité dans ce workspace
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },
  // Le rôle spécifique au sein de ce workspace
  role: { 
    type: String, 
    enum: ['Owner', 'Admin', 'Manager', 'Researcher', 'Accountant', 'Member', 'Guest'], 
    default: 'Member' 
  },
  // 🆕 État de l'invitation dans le workspace
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Declined'],
    default: 'Pending' 
  },
  // Date d'intégration effective dans l'équipe
  joinedAt: { 
    type: Date, 
    default: Date.now 
  }
}); // Accolade fermée correctement ici

// Sécurité importante : Un utilisateur ne peut avoir qu'un seul rôle par Workspace unique
TeamMemberSchema.index({ workspace: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('TeamMember', TeamMemberSchema);