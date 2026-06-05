const mongoose    = require('mongoose');
const Message     = require('../../models/messages_models/Message');
const Collaboration = require('../../models/Collaboration');

module.exports = async (req, res) => {
  try {
    const userId    = req.user._id;
    const { partnerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(partnerId)) {
      return res.status(400).json({ msg: "Identifiant partenaire invalide." });
    }

    const userObjId    = new mongoose.Types.ObjectId(userId);
    const partnerObjId = new mongoose.Types.ObjectId(partnerId);

    // ✅ FIX CRITIQUE : status: 'accepted' — pas de $regex
    const hasCollab = await Collaboration.findOne({
      status: 'accepted',
      $or: [
        { sender: userObjId, receiver: partnerObjId },
        { sender: partnerObjId, receiver: userObjId }
      ]
    });

    if (!hasCollab) {
      return res.status(403).json({
        msg: "Accès refusé : une collaboration active est requise pour échanger."
      });
    }

    // Marquer comme lus
    await Message.updateMany(
      {
        sender: partnerObjId,
        receiver: userObjId,
        isRead: false,
        $or: [{ groupId: null }, { groupId: { $exists: false } }]
      },
      { $set: { isRead: true } }
    );

    const chatHistory = await Message.find({
      $or: [
        { sender: userObjId, receiver: partnerObjId },
        { sender: partnerObjId, receiver: userObjId }
      ],
      $and: [
        { $or: [{ groupId: null }, { groupId: { $exists: false } }] },
        { hiddenFor: { $not: { $elemMatch: { $eq: userObjId } } } }
      ]
    })
    .sort({ createdAt: 1 })
    .populate('sender receiver', 'name specialty role avatar');

    return res.json(chatHistory);
  } catch (err) {
    console.error("❌ getPrivateHistory:", err.message);
    return res.status(500).json({ msg: "Erreur lors du chargement de l'historique." });
  }
};