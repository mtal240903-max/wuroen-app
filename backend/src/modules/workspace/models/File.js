const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true
  },
  folder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder',
    default: null // null signifie que le fichier est à la racine du projet
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  url: {
    type: String,
    required: true // L'adresse de stockage du fichier
  },
  size: {
    type: Number // Taille en octets (optionnel mais utile)
  },
  mimeType: {
    type: String // Exemple: 'application/pdf', 'image/png'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('File', FileSchema);