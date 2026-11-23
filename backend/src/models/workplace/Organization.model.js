const mongoose = require('mongoose');

const OrganizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['COMPANY', 'ASSOCIATION', 'INSTITUTION', 'OTHER'],
    default: 'COMPANY',
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  logoUrl: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'SUSPENDED', 'ARCHIVED'],
    default: 'ACTIVE',
    index: true,
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Membership',
    default: null,
  },
  settings: {
    timezone: { type: String, default: 'UTC' },
    currency: { type: String, default: 'EUR' },
    language: { type: String, default: 'fr' },
  },
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

OrganizationSchema.index({ status: 1 });

module.exports = mongoose.model('WorkplaceOrganization', OrganizationSchema);