const mongoose = require('mongoose');

const IntegrationConfigSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'WorkplaceOrganization',
    index: true,
  },
  applicationName: {
    type: String,
    enum: ['FINANCE', 'PA', 'FESTIVOX', 'MESSAGERIE', 'BIBLIOTHEQUE', 'EDUKAYA'],
    required: true,
  },
  endpointUrl: {
    type: String,
    required: true,
    trim: true,
  },
  webhookSecret: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'ERROR'],
    default: 'ACTIVE',
  },
}, {
  timestamps: true,
});

IntegrationConfigSchema.index({ organizationId: 1, applicationName: 1 }, { unique: true });

module.exports = mongoose.model('WorkplaceIntegrationConfig', IntegrationConfigSchema);