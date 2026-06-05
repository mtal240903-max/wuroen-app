const mongoose = require('mongoose');
const Group = require('../../models/messages_models/Group');

module.exports = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { mute } = req.body; 
        const userId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(groupId)) {
            return res.status(400).json({ msg: "Identifiant groupe invalide." });
        }

        const operator = mute ? '$addToSet' : '$pull';

        const updatedGroup = await Group.findOneAndUpdate(
            { _id: groupId, members: userId }, 
            { [operator]: { mutedBy: userId } },
            { new: true }
        );

        if (!updatedGroup) {
            return res.status(404).json({ msg: "Groupe introuvable ou vous n'êtes pas membre." });
        }

        return res.json({ success: true, isMuted: mute });
    } catch (err) {
        console.error("❌ Erreur toggleMuteGroup :", err);
        return res.status(500).json({ msg: "Erreur lors de la modification des notifications." });
    }
};