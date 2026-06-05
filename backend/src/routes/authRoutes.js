const express     = require('express');
const router      = express.Router();
const rateLimit   = require('express-rate-limit');
const { register, login, refreshToken, logout } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// ─────────────────────────────────────────────────────────────
// RATE LIMITER — Protection force brute sur les routes sensibles
// ─────────────────────────────────────────────────────────────

/**
 * Limiteur strict pour login/register
 * ✅ 10 tentatives / 15 min par IP
 * Si un attaquant essaie 1000 mots de passe → bloqué après 10
 */
const authLimiter = rateLimit({
  windowMs:         15 * 60 * 1000, // 15 minutes
  max:              10,
  standardHeaders:  true,           // Renvoie les headers RateLimit-* standard
  legacyHeaders:    false,
  message: { message: "Trop de tentatives. Réessayez dans 15 minutes." },
  // ✅ Skip le rate limit en développement pour ne pas gêner les tests
  skip: () => process.env.NODE_ENV === 'development',
});

/**
 * Limiteur souple pour le refresh token
 * ✅ 60 renouvellements / 15 min (normal pour une SPA active)
 */
const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      60,
  message:  { message: "Trop de renouvellements de session. Reconnectez-vous." },
  skip: () => process.env.NODE_ENV === 'development',
});

// ─────────────────────────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────────────────────────

// @route   POST /api/auth/register
// @desc    Inscription d'un nouvel utilisateur
// @access  Public
router.post('/register', authLimiter, register);

// @route   POST /api/auth/login
// @desc    Connexion — retourne access token (body) + refresh token (cookie)
// @access  Public
router.post('/login', authLimiter, login);

// @route   POST /api/auth/refresh
// @desc    Renouvelle l'access token via le refresh token (cookie HttpOnly)
// @access  Public (le cookie fait office d'authentification)
router.post('/refresh', refreshLimiter, refreshToken);

// @route   POST /api/auth/logout
// @desc    Déconnexion — efface le cookie refresh token
// @access  Privé (doit être connecté pour se déconnecter proprement)
router.post('/logout', protect, logout);

module.exports = router;