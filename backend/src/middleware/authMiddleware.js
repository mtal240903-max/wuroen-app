/**
 * @file authMiddleware.js
 * @description Middleware de sécurité : Authentification JWT, Autorisation Rôles et Expertises.
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ─────────────────────────────────────────────────────────────
// 1. PROTECT — Authentification JWT
// ─────────────────────────────────────────────────────────────
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Accès refusé : aucun token fourni." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const targetId = decoded.id || decoded._id;

    const currentUser = await User.findById(targetId).select('-password');
    if (!currentUser) {
      return res.status(401).json({ message: "Session invalide : compte introuvable." });
    }

    // Gestion états de compte
    if (currentUser.isBanned) {
      return res.status(403).json({ message: "Accès interdit : compte banni." });
    }
    if (currentUser.isSuspended) {
      return res.status(403).json({
        message: `Compte suspendu. Motif : ${currentUser.suspensionReason || "Non spécifié"}`
      });
    }

    req.user = currentUser;
    next();
  } catch (err) {
    const message = err.name === 'TokenExpiredError' ? "Session expirée." : "Token invalide.";
    return res.status(401).json({ message });
  }
};

// ─────────────────────────────────────────────────────────────
// 2. AUTHORIZE — Filtrage par rôle(s)
// ─────────────────────────────────────────────────────────────
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // 🛡️ Sécurité : Vérification de la présence de req.user
    if (!req.user) return res.status(401).json({ message: "Authentification requise." });
    
    if (req.user.role === 'superadmin') return next();

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Accès refusé : rôle [${req.user.role}] non autorisé.`
      });
    }
    next();
  };
};

// ─────────────────────────────────────────────────────────────
// 3. AUTHORIZE ADMIN TYPE — Spécialisation Admin
// ─────────────────────────────────────────────────────────────
const authorizeAdminType = (...allowedTypes) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Authentification requise." });
    
    const { role, adminType } = req.user;

    if (role === 'superadmin') return next();

    if (role === 'admin' && allowedTypes.includes(adminType)) {
      return next();
    }

    return res.status(403).json({
      message: `Accès refusé : spécialisation [${allowedTypes.join(' ou ')}] requise.`
    });
  };
};

// ─────────────────────────────────────────────────────────────
// 4. CHECK EXPERT ACCESS — Certification
// ─────────────────────────────────────────────────────────────
const checkExpertAccess = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Authentification requise." });
  
  if (req.user.role === 'superadmin' || req.user.isVerified) {
    return next();
  }

  return res.status(403).json({
    message: "Accès restreint aux experts certifiés."
  });
};

module.exports = { protect, authorize, authorizeAdminType, checkExpertAccess };