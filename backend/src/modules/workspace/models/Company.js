// src/modules/workspace/models/Company.js
const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  name: { 
    type: String, 
    required: true, 
    trim: true, 
    maxLength: 100 
  },
  description: { 
    type: String, 
    required: true, 
    trim: true, 
    maxLength: 1000 
  },
  type: { 
    type: String, 
    required: true, 
    enum: [    
      'Association', 
      'Entreprise Individuelle',    
      'ONG', 
      'Organisation', 
      'Société',
      'Exploitation / Ferme',
      'Laboratoire / Centre' 
    ] 
  },
  sector: { 
    type: String, 
    required: true, 
    enum: [
      'Production Animale', 
      'Élevage', 
      'Agronomie', 
      'Santé', 
      'Commerce', 
      'Agri-Tech', 
      'R&D / Science', 
      'Tech / Dév',
      'Primaire',
      'Secondaire',
      'Tertiaire'
    ] 
  },
  location: { 
    type: String, 
    required: true, 
    trim: true 
  },
  investment: { 
    type: String, 
    default: '0M' 
  },
  staffCount: { 
    type: Number, 
    default: 0 
  },
  website: { 
    type: String, 
    trim: true, 
    default: '' 
  },
  bgImage: { 
    type: String, 
    default: '' 
  },
  logo: { // ➕ Ajout du champ pour le logo rond
    type: String, 
    default: '' 
  },
  isPublic: { 
    type: Boolean, 
    default: false 
  },
  status: { 
    type: String, 
    enum: ['active', 'archived'], 
    default: 'active' 
  },
  staff: [{
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    level: { 
      type: String, 
      default: 'member' 
    },
    position: { 
      type: String, 
      default: 'Employé' 
    },
    memberStatus: { 
      type: String, 
      default: 'active_member' 
    },
    permissions: [{ 
      type: String 
    }]
  }],
  auditLog: [{
    action: String,
    performedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    ipAddress: String,
    details: mongoose.Schema.Types.Mixed,
    createdAt: { 
      type: Date, 
      default: Date.now 
    }
  }]
}, { 
  timestamps: true,
  toJSON: { 
    transform: (doc, ret) => { 
      delete ret.__v; 
      return ret; 
    } 
  } 
});

module.exports = mongoose.model('Company', CompanySchema);