const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'WorkplaceOrganization',
    index: true,
  },
  actorMembershipId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkplaceMembership',
    default: null,
    index: true,
  },
  action: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  targetResource: {
    type: String,
    required: true, // Ex: "OrganizationUnit:60c72b2f9b1d8b2d88f12345"
  },
  changes: {
    before: { type: mongoose.Schema.Types.Mixed, default: null },
    after: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  ipAddress: {
    type: String,
    default: null,
  },
  userAgent: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    enum: ['SUCCESS', 'DENIED', 'FAILURE'],
    default: 'SUCCESS',
  },
}, {
  timestamps: { createdAt: true, updatedAt: false }, // Immuable : pas d'updatedAt
});

AuditLogSchema.index({ organizationId: 1, createdAt: -1 });

module.exports = mongoose.model('WorkplaceAuditLog', AuditLogSchema);