const express = require('express');
const router = express.Router();

// Importation unitaire de chaque action
const getNotifications = require('../../controllers/notifications/getNotifications');
const markAsRead       = require('../../controllers/notifications/markAsRead');

const { protect } = require('../../middleware/authMiddleware');

// =====================================================
// 🔔 FLUX DE NOTIFICATIONS (ACTIONS SÉPARÉES)
// =====================================================

// GET /api/users/notifications
router.get('/notifications', protect, getNotifications);

// PUT /api/users/notifications/:id/read
router.put('/notifications/:id/read', protect, markAsRead);

module.exports = router;