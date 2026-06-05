const express = require('express');
const router  = express.Router();
const { protect, authorize } = require('../../middleware/authMiddleware');
const {
  getAllUsers,
  updateUserRole,
  updateUserStatus,
  deleteUser,
  getAdminStats,
  verifyUserExpert,
  getPendingArticles,
  assignModerator
} = require('../../controllers/adminController');

// ✅ Toutes les routes ici sont réservées au SuperAdmin
router.use(protect);
router.use(authorize('superadmin'));

// ── STATS ────────────────────────────────────────────────────
router.get('/stats', getAdminStats);

// ── UTILISATEURS ─────────────────────────────────────────────
router.get('/users',                getAllUsers);

// ✅ FIX : PUT au lieu de PATCH — cohérent avec adminController.updateUserRole
router.put('/users/:id/role',       updateUserRole);

// ✅ FIX : route status pour ban/suspension (manquait dans superAdminRoutes)
router.put('/users/:id/status',     updateUserStatus);

// Badge expert
router.patch('/users/:id/verify',   verifyUserExpert);

// Suppression définitive
router.delete('/users/:id',         deleteUser);

// ── ARTICLES ─────────────────────────────────────────────────
router.get('/articles/pending',     getPendingArticles);
router.patch('/articles/:id/assign', assignModerator);

module.exports = router;