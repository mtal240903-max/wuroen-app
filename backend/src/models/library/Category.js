const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, "Le nom de la catégorie est obligatoire"], 
    trim: true 
  },
  parent: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Category', 
    default: null // null pour le Niveau 1 (Domaines racine)
  },
  level: { 
    type: Number, 
    required: true, 
    enum: [1, 2, 3, 4, 5], // Strictement limité à tes 5 niveaux
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ✅ INDEXATION UNIQUE : Empêche d'avoir deux catégories avec le même nom sous le même parent
// Cela évite les doublons accidentels créés par le Super Admin
CategorySchema.index({ name: 1, parent: 1 }, { unique: true });

// ✅ INDEX DE PERFORMANCE : Accélère l'affichage de la navigation drill-down
CategorySchema.index({ parent: 1, level: 1 });

// ✅ VIRTUALS (Optionnel) : Pourrait servir plus tard pour compter les sous-catégories
CategorySchema.virtual('subCategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent'
});

module.exports = mongoose.model('Category', CategorySchema);