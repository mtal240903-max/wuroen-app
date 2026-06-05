const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
  title: {
    type:     String,
    required: [true, "Le titre est obligatoire"],
    trim:     true,
    maxlength: [200, "Le titre ne peut pas dépasser 200 caractères"]
  },
  description: {
    type:    String,
    default: "",
    maxlength: [1000, "La description ne peut pas dépasser 1000 caractères"]
  },
  category: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'Category',
    required: [true, "La catégorie est obligatoire"]
  },
  type: {
    type:      String,
    required:  true,
    lowercase: true
  },
  createdBy: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'User',
    required: true
  },
  fileUrl: {
    type:     String,
    required: [true, "L'URL du fichier est obligatoire"]
  },
  // ✅ FIX : cloudinaryId manquait — nécessaire pour supprimer le fichier sur Cloudinary
  cloudinaryId: {
    type:    String,
    default: ""
  },
  size: {
    type:    String,
    default: ""
  },
  views: {
    type:    Number,
    default: 0,
    min:     0
  },
  isApproved: {
    type:    Boolean,
    default: true
  }
}, {
  timestamps: true
});

ResourceSchema.index({ category: 1, createdAt: -1 });
ResourceSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Resource', ResourceSchema);