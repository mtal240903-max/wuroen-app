const Notification = require('../../models/notifications_models/Notification');

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json(notifications);
  } catch (error) {
    console.error("🔥 Erreur dans getNotifications:", error.message);
    res.status(500).json({ message: "Erreur serveur lors de la récupération des notifications." });
  }
};

module.exports = getNotifications;