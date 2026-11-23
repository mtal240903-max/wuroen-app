import mongoose from 'mongoose';

const organizationUnitSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Organization',
    index: true,
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OrganizationUnit',
    default: null,
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
    trim: true,
    default: '',
  },
  type: {
    type: String,
    enum: [
      'DEPARTMENT',
      'TEAM',
      'GROUP',
      'PROJECT',
      'COMMITTEE',
      'CELL',
      'COMMISSION',
      'REGION',
      'BRANCH'
    ],
    default: 'DEPARTMENT',
  },
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // ou 'Membership' selon la nomenclature de votre base
    default: null,
    index: true,
  },
  inheritPermissions: {
    type: Boolean,
    default: true,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  path: {
    type: String,
    required: true,
    index: true, // Indexation pour la recherche rapide des sous-arborescences
  },
  deletedAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

// Index composé pour l'unicité du slug dans une même organisation
organizationUnitSchema.index({ organizationId: 1, slug: 1 }, { unique: true });

export default mongoose.model('OrganizationUnit', organizationUnitSchema);