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

  // ✅ AJOUT IMPORTANT
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  }

}, { 
  timestamps: true 
});

GroupSchema.index({ members: 1, updatedAt: -1 });

module.exports = mongoose.models.Group || mongoose.model('Group', GroupSchema);