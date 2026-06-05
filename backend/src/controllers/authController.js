const jwt    = require('jsonwebtoken');
const User   = require('../models/User');

// ─────────────────────────────────────────────────────────────
// HELPERS TOKENS
// ─────────────────────────────────────────────────────────────

/**
 * Access token — courte durée (15min)
 * ✅ FIX : '30d' est dangereux. Si le token est volé ou si un compte
 *    est banni, il reste valide 30 jours. 15min force un renouvellement fréquent.
 */
const generateAccessToken = (id) => {
  return jwt.sign({ id, type: 'access' }, process.env.JWT_SECRET, {
    expiresIn: '15m'
  });
};

/**
 * Refresh token — longue durée (30j), secret séparé
 * ✅ Stocké en cookie HttpOnly, jamais dans localStorage
 *    Secret différent = un refresh token compromis ne compromet pas les access tokens
 */
const generateRefreshToken = (id) => {
  return jwt.sign({ id, type: 'refresh' }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '30d'
  });
};

/**
 * Envoie le refresh token en cookie sécurisé
 */
const setRefreshCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,   // ✅ Inaccessible au JavaScript côté client (protection XSS)
    secure:   process.env.NODE_ENV === 'production', // ✅ HTTPS uniquement en prod
    sameSite: 'strict',  // ✅ Protection CSRF
    maxAge:   30 * 24 * 60 * 60 * 1000 // 30 jours en ms
  });
};

/**
 * Formate la réponse utilisateur sans données sensibles
 */
const formatUserResponse = (user, accessToken) => ({
  _id:        user._id,
  name:       user.name,
  email:      user.email,
  role:       user.role,
  adminType:  user.adminType,
  isVerified: user.isVerified,
  token:      accessToken,   // access token dans le body
});

// ─────────────────────────────────────────────────────────────
// 1. INSCRIPTION
// ─────────────────────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const { name, email, password, specialty } = req.body;

    // ✅ Validation des champs obligatoires
    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ message: "Champs obligatoires manquants : name, email, password." });
    }

    // ✅ Validation format email (côté controller en plus du schéma Mongoose)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ message: "Format d'email invalide." });
    }

    // ✅ Validation longueur mot de passe
    if (password.length < 6) {
      return res.status(400).json({ message: "Le mot de passe doit contenir au moins 6 caractères." });
    }

    // ✅ Validation longueur nom (évite les noms de 1 caractère ou trop longs)
    if (name.trim().length < 2 || name.trim().length > 100) {
      return res.status(400).json({ message: "Le nom doit contenir entre 2 et 100 caractères." });
    }

    const userExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (userExists) {
      // ✅ Message volontairement vague — évite l'énumération d'emails (user enumeration attack)
      return res.status(400).json({ message: "Impossible de créer ce compte. Vérifiez vos informations." });
    }

    const user = await User.create({
      name:      name.trim(),
      email:     email.toLowerCase().trim(),
      password,
      specialty: specialty?.trim() || undefined
    });

    const accessToken  = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    setRefreshCookie(res, refreshToken);

    res.status(201).json(formatUserResponse(user, accessToken));
  } catch (error) {
    // ✅ Ne pas exposer les détails de l'erreur Mongoose en production
    const message = process.env.NODE_ENV === 'production'
      ? "Erreur lors de la création du compte."
      : error.message;
    res.status(500).json({ message });
  }
};

// ─────────────────────────────────────────────────────────────
// 2. CONNEXION
// ─────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ✅ Validation des champs
    if (!email?.trim() || !password) {
      return res.status(400).json({ message: "Email et mot de passe requis." });
    }

    // ✅ On sélectionne explicitement tous les champs de sécurité nécessaires
    const user = await User.findOne({ email: email.toLowerCase().trim() })
      .select('+password +isBanned +isSuspended +suspensionReason');

    // ✅ SÉCURITÉ : Message identique qu'il n'existe pas ou que le mdp soit faux
    // Évite de confirmer à un attaquant qu'un email est enregistré
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Email ou mot de passe invalide." });
    }

    // ✅ Vérifications de sécurité APRÈS la validation du mot de passe
    // (ne pas révéler qu'un compte existe avant d'avoir le bon mdp)
    if (user.isBanned) {
      return res.status(403).json({ message: "Ce compte a été définitivement banni." });
    }

    if (user.isSuspended) {
      return res.status(403).json({
        message: `Ce compte est temporairement suspendu. Motif : ${user.suspensionReason || 'Non spécifié'}`
      });
    }

    // ✅ Mise à jour de lastLogin sans bloquer la réponse (fire & forget)
    User.findByIdAndUpdate(user._id, { lastLogin: new Date() }).catch(err =>
      console.error("⚠️ Erreur mise à jour lastLogin:", err.message)
    );

    const accessToken  = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    setRefreshCookie(res, refreshToken);

    res.json(formatUserResponse(user, accessToken));
  } catch (error) {
    const message = process.env.NODE_ENV === 'production'
      ? "Erreur lors de la connexion."
      : error.message;
    res.status(500).json({ message });
  }
};

// ─────────────────────────────────────────────────────────────
// 3. REFRESH TOKEN — Renouvellement de l'access token
// ─────────────────────────────────────────────────────────────
exports.refreshToken = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      return res.status(401).json({ message: "Aucun refresh token fourni." });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(401).json({
        message: err.name === 'TokenExpiredError'
          ? "Session expirée. Reconnectez-vous."
          : "Refresh token invalide."
      });
    }

    if (decoded.type !== 'refresh') {
      return res.status(401).json({ message: "Token invalide." });
    }

    // ✅ Vérification que le compte est toujours actif au moment du refresh
    const user = await User.findById(decoded.id).select('+isBanned +isSuspended');
    if (!user) {
      return res.status(401).json({ message: "Compte introuvable ou supprimé." });
    }

    if (user.isBanned) {
      return res.status(403).json({ message: "Ce compte a été banni." });
    }

    if (user.isSuspended) {
      return res.status(403).json({ message: "Ce compte est suspendu." });
    }

    // ✅ Rotation du refresh token à chaque renouvellement (sécurité renforcée)
    const newAccessToken  = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    setRefreshCookie(res, newRefreshToken);
    res.json({ token: newAccessToken });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors du renouvellement de session." });
  }
};

// ─────────────────────────────────────────────────────────────
// 4. DÉCONNEXION — Effacement du cookie
// ─────────────────────────────────────────────────────────────
exports.logout = (req, res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  res.json({ message: "Déconnexion réussie." });
};