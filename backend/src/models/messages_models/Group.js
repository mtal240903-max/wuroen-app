const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },

  description: { 
    type: String, 
    trim: true 
  },

  // 🔗 MISE À JOUR : Liaison obligatoire avec la Communauté parente
  communityId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Community', 
    required: true 
  },

  avatar: { 
    type: String, 
    default: "" 
  },

  creator: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },

  members: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],

  admins: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],

  mutedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  isArchived: {
    type: Boolean,
    default: false
  },

  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  }

}, { 
  timestamps: true 
});

// Index composé pour optimiser la recherche des groupes par communauté
GroupSchema.index({ communityId: 1, members: 1, updatedAt: -1 });

module.exports = mongoose.models.Group || mongoose.model('Group', GroupSchema);