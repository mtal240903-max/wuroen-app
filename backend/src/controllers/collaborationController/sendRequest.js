const Collaboration = require('../../models/Collaboration');
const User          = require('../../models/User');
const mongoose      = require('mongoose');

module.exports = async (req, res, next) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user._id;

    // ✅ Validation receiverId
    if (!receiverId || !mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({ message: "receiverId invalide ou manquant." });
    }

    // ✅ Auto-collaboration interdite
    if (senderId.toString() === receiverId) {
      return res.status(400).json({ message: "Vous ne pouvez pas collaborer avec vous-même." });
    }

    // ✅ Vérifier que le destinataire existe et n'est pas banni
    const receiver = await User.findById(receiverId).select('name isBanned isSuspended');
    if (!receiver) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }
    if (receiver.isBanned || receiver.isSuspended) {
      return res.status(403).json({ message: "Impossible d'envoyer une invitation à ce compte." });
    }

    // ✅ Vérifier relation existante
    const existing = await Collaboration.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId }
      ]
    });

    if (existing) {
      if (existing.status === 'accepted') {
        return res.status(400).json({ message: "Vous collaborez déjà avec cet expert." });
      }
      if (existing.status === 'pending') {
        return res.status(400).json({ message: "Demande déjà envoyée et en attente." });
      }
      // Si 'rejected' → on supprime et on recréé
      await Collaboration.findByIdAndDelete(existing._id);
    }

    const newCollab = new Collaboration({
      sender:   senderId,
      receiver: receiverId,
      status:   'pending'
    });

    await newCollab.save();

    return res.status(201).json({
      success:  true,
      message:  "Demande de collaboration envoyée !",
      status:   "pending",
      collabId: newCollab._id
    });
  } catch (err) {
    console.error("🔥 sendRequest:", err.message);
    return next(err);
  }
};