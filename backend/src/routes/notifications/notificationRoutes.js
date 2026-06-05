const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/authMiddleware');
const Notification = require('../../models/Notification'); // Assurez-vous d'avoir ce modèle

// ─────────────────────────────────────────────
// 🔔 ROUTES NOTIFICATIONS
// ─────────────────────────────────────────────

// Récupérer toutes les notifications de l'utilisateur
router.get('/', protect, async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user._id })
            .sort({ createdAt: -1 })
            .limit(20);
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ msg: 'Erreur serveur.' });
    }
});

// Marquer une notification comme lue
router.put('/:id/read', protect, async (req, res) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
        res.json({ msg: 'Notification lue.' });
    } catch (error) {
        res.status(500).json({ msg: 'Erreur lors de la mise à jour.' });
    }
});

// Supprimer une notification
router.delete('/:id', protect, async (req, res) => {
    try {
        await Notification.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Notification supprimée.' });
    } catch (error) {
        res.status(500).json({ msg: 'Erreur lors de la suppression.' });
    }
});

module.exports = router;