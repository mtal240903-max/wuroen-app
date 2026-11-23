const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    default: null,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    trim: true,
    default: 'Elevage'
  },
  imageUrl: {
    type: String,
    default: null,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['En cours', 'Terminé', 'En pause', 'Archivé'],
    default: 'En cours'
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Project', ProjectSchema);