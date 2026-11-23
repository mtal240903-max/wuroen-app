const mongoose = require('mongoose');

const RoleSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'WorkplaceOrganization',
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  code: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  permissions: [{
    type: String,
    trim: true,
  }],
  isSystem: {
    type: Boolean,
    default: false, // Empêche la suppression des rôles par défaut de l'orga
  },
}, {
  timestamps: true,
});

// Un code de rôle doit être unique au sein d'une même organisation
RoleSchema.index({ organizationId: 1, code: 1 }, { unique: true });

module.exports = mongoose.model('WorkplaceRole', RoleSchema);