const mongoose = require('mongoose');
const crypto = require('crypto');

const WorkspaceInvitationSchema = new mongoose.Schema({
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: [true, "L'identifiant du workspace est obligatoire"]
  },
  inviter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, "L'auteur de l'invitation est obligatoire"]
  },
  invitedEmail: {
    type: String,
    required: [true, "L'email de la personne invitée est requis"],
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Veuillez fournir un email valide"]
  },
  roleAssigned: {
    type: String,
    enum: ['Admin', 'Manager', 'Member', 'Guest'],
    default: 'Member'
  },
  status: {
    type: String,
    enum: ['En attente', 'Acceptée', 'Refusée', 'Expirée'],
    default: 'En attente'
  },
  token: {
    type: String,
    unique: true
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Expire automatiquement après 7 jours
  }
}, { 
  timestamps: true 
});

// --- INDEX DE SÉCURITÉ ET PERFORMANCE ---
// Index unique composite : Empêche d'envoyer plusieurs invitations en attente à la même personne pour le même espace
WorkspaceInvitationSchema.index({ workspace: 1, invitedEmail: 1, status: 1 }, { unique: true });

// Index TTL (Time-To-Live) : MongoDB supprime automatiquement le document dès que la date actuelle dépasse 'expiresAt'
WorkspaceInvitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// --- HOOK PRE-SAVE ---
// Génère un jeton cryptographique hautement sécurisé (anti-devinette) avant l'enregistrement en base
WorkspaceInvitationSchema.pre('save', function(next) {
  if (this.isNew && !this.token) {
    this.token = crypto.randomBytes(32).toString('hex');
  }
  next();
});

module.exports = mongoose.model('WorkspaceInvitation', WorkspaceInvitationSchema);