const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Le nom est obligatoire"],
    trim: true
  },
  email: {
    type: String,
    required: [true, "L'email est obligatoire"],
    unique: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Veuillez entrer un email valide']
  },
  password: {
    type: String,
    required: [true, "Le mot de passe est obligatoire"],
    minlength: 6,
    select: false 
  },

  // --- 🛡️ SYSTÈME DE RÔLES & SÉCURITÉ (MAJ) ---
  role: {
    type: String,
    enum: ['user', 'moderator', 'admin', 'superadmin'],
    default: 'user'
  },

  // Spécialisation des admins pour Wuro’en
  adminType: {
    type: String,
    enum: ['content', 'library', 'workspace'],
    default: null
  },

  isVerified: {
    type: Boolean,
    default: false // Badge Expert / Certifié
  },
  
  // Contrôle d'accès Super Admin
  isSuspended: {
    type: Boolean,
    default: false
  },
  isBanned: {
    type: Boolean,
    default: false
  },
  suspensionReason: {
    type: String,
    default: ""
  },

  avatar: { type: String, default: '' },
  avatarCloudinaryId: { type: String, default: '' },

  // --- PROFIL PROFESSIONNEL ---
  specialty: {
    type: String,
    default: "Technicien / Chercheur"
  },
  bio: {
    type: String,
    maxlength: 200,
    default: "Passionné par les sciences animales et la tech."
  },

  // --- SYSTÈME DE COLLABORATION AVANCÉ ---
  collaborationRequests: [{
    from: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    status: { 
      type: String, 
      enum: ['pending', 'accepted'], 
      default: 'pending' 
    },
    createdAt: { 
      type: Date, 
      default: Date.now 
    }
  }],

  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  // --- 📊 TRACKING & LOGS ---
  lastLogin: {
    type: Date
  },
  // Historique des actions importantes (Audit Trail)
  actionLogs: [{
    action: { type: String, required: true }, // ex: "ROLE_CHANGE", "SUSPENSION", "RESOURCE_UPLOAD"
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    details: String,
    createdAt: { type: Date, default: Date.now }
  }]

}, {
  timestamps: true 
});

// --- MIDDLEWARES (PRE-SAVE) ---

userSchema.pre('save', async function() {
  // ✅ FIX : async sans next() — Mongoose gère la Promise
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  if (this.role !== 'admin') {
    this.adminType = null;
  }
});

// --- MÉTHODES ---

// Comparer les mots de passe
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Vérifier si l'utilisateur est autorisé à naviguer
userSchema.methods.isActive = function() {
  return !this.isBanned && !this.isSuspended;
};

module.exports = mongoose.model('User', userSchema);