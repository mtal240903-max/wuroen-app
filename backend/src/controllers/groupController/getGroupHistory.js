const mongoose = require('mongoose');
const Group = require('../../models/messages_models/Group');
const Message = require('../../models/messages_models/Message');

module.exports = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(groupId)) {
            return res.status(404).json({ msg: "Groupe introuvable." });
        }

        const isMember = await Group.findOne({ _id: groupId, members: userId });
        if (!isMember) {
            return res.status(404).json({ msg: "Groupe introuvable." });
        }

        const messages = await Message.find({ 
            groupId: groupId,
            hiddenFor: { $ne: userId }
        })
        .sort({ createdAt: 1 })
        .populate('sender', 'name specialty role');
            
        return res.json(messages);
    } catch (err) { 
        console.error("❌ Erreur getGroupHistory :", err);
        return res.status(500).json({ msg: "Erreur lors de la récupération de l'historique." }); 
    }
};