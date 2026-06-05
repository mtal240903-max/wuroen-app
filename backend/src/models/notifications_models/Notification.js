const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // 👤 L'utilisateur qui reçoit la notification
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true // indexé pour accélérer les requêtes GET /notifications
  },
  
  // 👤 L'utilisateur qui a déclenché l'action (optionnel, ex: système)
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // 📝 Le nom de l'expéditeur au moment de l'action (évite les gros populatings sur le mobile)
  senderName: {
    type: String,
    default: 'Un confrère'
  },
  
  // 🏷️ Le type de notification (aligné avec ton icône React Native)
  type: {
    type: String,
    enum: ['like', 'comment', 'collaboration', 'system'],
    required: true
  },
  
  // 💬 Le message textuel qui s'affichera sur le téléphone
  message: {
    type: String,
    required: true,
    trim: true
  },
  
  // 🔗 Lien optionnel vers l'objet concerné (ex: l'ID de l'article liké ou commenté)
  relatedId: {
    type: mongoose.Schema.Types.ObjectId
  },
  
  // 👁️ Statut de lecture
  read: {
    type: Boolean,
    default: false,
    index: true // indexé pour compter rapidement les notifications non lues
  }
}, {
  timestamps: true // Génère automatiquement createdAt et updatedAt
});

// Index composé pour optimiser les requêtes de nettoyage ou de tri par date
notificationSchema.index({ recipient: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);