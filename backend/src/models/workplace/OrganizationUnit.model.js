const mongoose = require('mongoose');

const OrganizationUnitSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'WorkplaceOrganization',
    index: true,
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkplaceOrganizationUnit',
    default: null,
    index: true,
  },
  type: {
    type: String,
    enum: [
      'DEPARTMENT',
      'TEAM',
      'GROUP',
      'PROJECT',
      'COMMITTEE',
      'COMMISSION',
      'CELL',
      'BRANCH',
      'REGION'
    ],
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'ARCHIVED'],
    default: 'ACTIVE',
  },
  managerMembershipId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkplaceMembership',
    default: null,
  },
  // Pour les projets transversaux impliquant plusieurs unités
  participatingUnitIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkplaceOrganizationUnit',
  }],
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  archivedAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

// Index uniques et composés
OrganizationUnitSchema.index({ organizationId: 1, slug: 1 }, { unique: true });
OrganizationUnitSchema.index({ organizationId: 1, type: 1 });
OrganizationUnitSchema.index({ parentId: 1 });

module.exports = mongoose.model('WorkplaceOrganizationUnit', OrganizationUnitSchema);