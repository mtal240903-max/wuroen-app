const mongoose = require('mongoose');
const Message = require('../../models/messages_models/Message');
const Group = require('../../models/messages_models/Group'); 

module.exports = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(groupId)) {
            return res.status(400).json({ msg: "Identifiant groupe invalide." });
        }

        const group = await Group.findOne({ _id: groupId, members: userId });
        if (!group) {
            return res.status(403).json({ msg: "Accès refusé ou groupe introuvable." });
        }

        const messages = await Message.find({ 
            groupId: groupId,
            hiddenFor: { $ne: userId }
        })
        .sort({ createdAt: 1 })
        .populate('sender', 'name specialty role');

        return res.json(messages);
    } catch (err) {
        console.error("❌ Erreur historique groupe :", err);
        return res.status(500).json({ msg: "Erreur lors du chargement de l'historique de groupe." });
    }
};