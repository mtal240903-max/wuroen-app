import mongoose from 'mongoose';

const unitMembershipSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Organization',
    index: true,
  },
  organizationUnitId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'OrganizationUnit',
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User', // ou 'Membership' selon la structure existante
    index: true,
  },
  role: {
    type: String,
    enum: ['MEMBER', 'CONTRIBUTOR', 'MANAGER', 'LEAD', 'OBSERVER'],
    default: 'MEMBER',
  },
  permissions: {
    type: [String],
    default: [], // Permissions contextuelles additionnelles spécifiques à cette unité
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'PENDING'],
    default: 'ACTIVE',
  },
}, {
  timestamps: true,
});

// Index composé unique pour éviter qu'un utilisateur soit rattaché deux fois à la même unité
unitMembershipSchema.index({ organizationUnitId: 1, userId: 1 }, { unique: true });

// Index pour lister rapidement toutes les unités d'un utilisateur
unitMembershipSchema.index({ userId: 1, organizationId: 1 });

export default mongoose.model('UnitMembership', unitMembershipSchema);