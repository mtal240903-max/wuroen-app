const mongoose = require('mongoose');

const MembershipSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User', // Référence au compte global Wuro'en Core
    index: true,
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'WorkplaceOrganization',
    index: true,
  },
  status: {
    type: String,
    enum: ['PENDING', 'ACTIVE', 'SUSPENDED', 'REVOKED'],
    default: 'ACTIVE',
    index: true,
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
  leftAt: {
    type: Date,
    default: null,
  },
  globalRoles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkplaceRole',
  }],
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: true,
});

// Contrainte d'unicité : un utilisateur ne peut avoir qu'un seul membership par organisation
MembershipSchema.index({ userId: 1, organizationId: 1 }, { unique: true });
MembershipSchema.index({ organizationId: 1, status: 1 });

module.exports = mongoose.model('WorkplaceMembership', MembershipSchema);