const mongoose = require('mongoose');

const ApplicationAccessSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'WorkplaceOrganization',
    index: true,
  },
  targetType: {
    type: String,
    enum: ['ORGANIZATION', 'UNIT', 'MEMBERSHIP'],
    required: true,
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true, // ID de l'orga, de l'unité ou du membership cible
    index: true,
  },
  applicationName: {
    type: String,
    enum: ['FINANCE', 'PA', 'FESTIVOX', 'MESSAGERIE', 'BIBLIOTHEQUE', 'EDUKAYA', 'GORKO'],
    required: true,
    index: true,
  },
  accessLevel: {
    type: String,
    enum: ['NONE', 'READ_ONLY', 'READ_WRITE', 'FULL_ADMIN'],
    default: 'READ_ONLY',
    required: true,
  },
  grantedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkplaceMembership',
    default: null,
  },
}, {
  timestamps: true,
});

ApplicationAccessSchema.index({ organizationId: 1, applicationName: 1 });
ApplicationAccessSchema.index({ targetType: 1, targetId: 1 });

module.exports = mongoose.model('WorkplaceApplicationAccess', ApplicationAccessSchema);