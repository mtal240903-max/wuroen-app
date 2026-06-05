const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() { return !this.groupId; }
  },
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    default: null
  },
  content: {
    type: String,
    required: function() { return this.messageType !== 'voice'; },
    trim: true,
    maxlength: 5000
  },
  messageType: {
    type: String,
    enum: ['text', 'voice', 'image', 'file'],
    default: 'text'
  },
  fileUrl: { type: String, default: null },
  edited: { type: Boolean, default: false },
  deletedForEveryone: { type: Boolean, default: false },
  isRead: { type: Boolean, default: false },
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  hiddenFor: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, {
  timestamps: true 
});

/**
 * 🛡️ HOOK DE VALIDATION CORRIGÉ
 * En supprimant le callback 'next', on élimine le risque 'TypeError: next is not a function'
 */
MessageSchema.pre('validate', function() {
  // Si le message a à la fois un destinataire ET un groupe -> Erreur
  if (this.receiver && this.groupId) {
    throw new Error('Un message ne peut pas avoir simultanément un receiver et un groupId.');
  }
  
  // Si le message n'a ni l'un ni l'autre -> Erreur
  if (!this.receiver && !this.groupId) {
    throw new Error('Un message doit avoir soit un destinataire, soit un groupe.');
  }
});

// Indexation pour optimiser les performances
MessageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });
MessageSchema.index({ groupId: 1, createdAt: -1 });

module.exports = mongoose.models.Message || mongoose.model('Message', MessageSchema);