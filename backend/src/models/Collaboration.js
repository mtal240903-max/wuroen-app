const mongoose = require('mongoose');

const CollaborationSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    },
    // ✅ NOUVEAU : Champ pour l'archivage persistant
    isArchived: {
        type: Boolean,
        default: false
    },
    // ✅ NOUVEAU : Champ pour la sourdine persistante
    isMuted: {
        type: Boolean,
        default: false
    }
}, {
    // Gère automatiquement createdAt et updatedAt
    timestamps: true 
});

// Empêcher les doublons de demandes entre deux mêmes personnes
CollaborationSchema.index({ sender: 1, receiver: 1 }, { unique: true });

module.exports = mongoose.model('Collaboration', CollaborationSchema);