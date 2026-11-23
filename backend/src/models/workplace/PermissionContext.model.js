const mongoose = require('mongoose');

const PermissionContextSchema = new mongoose.Schema({
  membershipId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'WorkplaceMembership',
    index: true,
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'WorkplaceOrganization',
    index: true,
  },
  effectivePermissions: [{
    type: String,
    trim: true,
  }],
  unitPermissions: {
    type: Map,
    of: [String], // Associe chaque unitId à une liste de permissions effectives
    default: {},
  },
  applicationAccess: {
    type: Map,
    of: String, // Associe chaque application à son niveau d'accès effectif
    default: {},
  },
  version: {
    type: Number,
    default: 1,
  },
  computedAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: '24h' }, // TTL Index : Nettoyage automatique du cache après expiration
  },
}, {
  timestamps: true,
});

PermissionContextSchema.index({ membershipId: 1, organizationId: 1 }, { unique: true });

module.exports = mongoose.model('WorkplacePermissionContext', PermissionContextSchema);