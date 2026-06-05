const express = require('express');
const router  = express.Router();

const { protect, authorize, authorizeAdminType } = require('../../middleware/authMiddleware');
const adminCtrl = require('../../controllers/adminController');

router.use(protect);

// ─────────────────────────────────────────────────────────────
// 👑 SUPERADMIN UNIQUEMENT
// ─────────────────────────────────────────────────────────────
router.get('/stats',                authorize('superadmin'), adminCtrl.getAdminStats);
router.get('/users',                authorize('superadmin'), adminCtrl.getAllUsers);
router.patch('/users/:id/role',     authorize('superadmin'), adminCtrl.updateUserRole);
router.patch('/users/:id/status',   authorize('superadmin'), adminCtrl.updateUserStatus);
router.delete('/users/:id',         authorize('superadmin'), adminCtrl.deleteUser);

// ─────────────────────────────────────────────────────────────
// 📝 ADMIN CONTENT ou WORKSPACE
// Bloque admin 'library' — il n'a rien à faire ici
// ─────────────────────────────────────────────────────────────
router.get('/articles/pending',        authorizeAdminType('content', 'workspace'), adminCtrl.getPendingArticles);
router.patch('/articles/:id/assign',   authorizeAdminType('content', 'workspace'), adminCtrl.assignModerator);
router.patch('/articles/:id/approve',  authorizeAdminType('content', 'workspace'), adminCtrl.approveArticle);
router.patch('/articles/:id/reject',   authorizeAdminType('content', 'workspace'), adminCtrl.rejectArticle);
router.patch('/users/:id/verify',      authorizeAdminType('content', 'workspace'), adminCtrl.verifyUserExpert);

module.exports = router;