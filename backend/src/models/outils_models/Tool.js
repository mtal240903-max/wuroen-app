const mongoose = require('mongoose');

const toolSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Le nom de l'outil est requis."],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "La description est requise."],
    trim: true,
  },
  category: {
    type: String,
    required: [true, "La catégorie est requise."],
    trim: true,
  },
  status: {
    type: String,
    enum: ['active', 'beta', 'maintenance', 'coming_soon'],
    default: 'active',
  },
  logo: {
    type: String,
    required: [true, "Le logo ou l'icône est requis."],
  },
  actionType: {
    type: String,
    enum: ['internal', 'external', 'download'],
    default: 'internal',
  },
  actionUrl: {
    type: String,
    required: [true, "L'URL ou la route d'action est requise."],
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Tool', toolSchema);