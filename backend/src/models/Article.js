const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true, trim: true, default: "Utilisateur" },
  text: { type: String, required: [true, "Le texte du commentaire est obligatoire"], trim: true, maxlength: [2000, "Max 2000 caractères"] },
  isEdited: { type: Boolean, default: false }
}, { timestamps: true });

const articleSchema = new mongoose.Schema({

  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: [true, "L'auteur est obligatoire"] },
  assignedModerator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  coAuthors: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['co-author', 'contributor', 'reviewer'], default: 'co-author' }
  }],

  title: { type: String, required: [true, "Le titre est obligatoire"], trim: true, maxlength: [200, "Max 200 caractères"] },
  slug:  { type: String, unique: true, lowercase: true, trim: true },

  // ✅ FIX CRITIQUE : Mixed au lieu de ObjectId
  // Les anciens articles ont category = String ("Agronomie")
  // ObjectId causait un crash sur populate() → toute la route retournait 404
  category: { type: mongoose.Schema.Types.Mixed, default: null },

  image:       { type: String, default: "", trim: true },
  imageUrl:    { type: String, default: "", trim: true }, // Compatibilité anciens articles
  cloudinaryId:{ type: String, default: "" },

  intro:     { type: String, required: [true, "L'introduction est obligatoire"], maxlength: [5000, "Max 5000"] },
  methodo:   { type: String, default: "", maxlength: [20000, "Max 20000"] },
  results:   { type: String, default: "", maxlength: [20000, "Max 20000"] },
  references:[{ type: String, trim: true }],

  status:       { type: String, enum: ['pending', 'published', 'rejected', 'assigned'], default: 'pending' },
  isPublic:     { type: Boolean, default: false },
  reviewComment:{ type: String, default: "" },
  reviewedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  reviewedAt:   { type: Date, default: null },
  publishedAt:  { type: Date, default: null },

  likes:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments:[commentSchema],

  shareCount:{ type: Number, default: 0, min: 0 },
  views:     { type: Number, default: 0, min: 0 }

}, {
  timestamps: true,
  strict: false // Accepte les champs anciens (contributors, imageUrl...)
});

// ─── SLUG ────────────────────────────────────────────────────
articleSchema.pre('save', async function () {
  // ✅ Hook unique — async sans next(), Mongoose gère la Promise

  // 1. Slug
  if (this.isModified('title')) {
    const baseSlug = this.title.toLowerCase().normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s-]/g, "")
      .trim().replace(/\s+/g, "-").replace(/-+/g, "-");
    let slug = baseSlug, count = 1;
    while (count <= 100 && await mongoose.model('Article').exists({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${count++}`;
    }
    this.slug = slug;
  }

  // 2. Cohérence isPublic ↔ status
  if (this.isModified('status')) {
    this.isPublic = this.status === 'published';
    if (this.status === 'published' && !this.publishedAt) this.publishedAt = new Date();
    if (this.status !== 'published') this.publishedAt = null;
  }
});

// ─── COHÉRENCE isPublic : gérée dans le hook principal ──────

// ─── INDEX ───────────────────────────────────────────────────
articleSchema.index({ status: 1, publishedAt: -1 });
articleSchema.index({ author: 1, status: 1 });
articleSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Article', articleSchema);