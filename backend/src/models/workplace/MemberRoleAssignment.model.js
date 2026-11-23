const mongoose = require('mongoose');

const MemberRoleAssignmentSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'WorkplaceOrganization',
    index: true,
  },
  membershipId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'WorkplaceMembership',
    index: true,
  },
  roleId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'WorkplaceRole',
    index: true,
  },
  scopeType: {
    type: String,
    enum: ['ORGANIZATION', 'UNIT'],
    required: true,
    default: 'ORGANIZATION',
  },
  scopeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkplaceOrganizationUnit',
    default: null, // Requis si scopeType = UNIT
  },
  inheritPermissions: {
    type: Boolean,
    default: true, // Hérite ou non de la hiérarchie parente
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkplaceMembership',
    default: null,
  },
}, {
  timestamps: true,
});

// Index pour optimiser la recherche des rôles d'un membre dans une orga ou une unité
MemberRoleAssignmentSchema.index({ organizationId: 1, membershipId: 1 });
MemberRoleAssignmentSchema.index({ scopeType: 1, scopeId: 1 });

module.exports = mongoose.model('WorkplaceMemberRoleAssignment', MemberRoleAssignmentSchema);