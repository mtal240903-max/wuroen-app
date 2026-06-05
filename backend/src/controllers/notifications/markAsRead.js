const Notification = require('../../models/notifications_models/Notification');
const mongoose = require('mongoose');

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID de notification invalide." });
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipient: req.user._id },
      { $set: { read: true } },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification introuvable ou non autorisée." });
    }

    res.status(200).json({ success: true, notification });
  } catch (error) {
    console.error("🔥 Erreur dans markAsRead:", error.message);
    res.status(500).json({ message: "Erreur serveur lors de la mise à jour de la notification." });
  }
};

module.exports = markAsRead;