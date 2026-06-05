const mongoose = require('mongoose');
const Message = require('../../models/messages_models/Message');
const Group = require('../../models/messages_models/Group'); 

module.exports = async (req, res) => {
    try {
        const userId = req.user._id;
        const { targetId, isGroup } = req.body;

        if (!targetId || !mongoose.Types.ObjectId.isValid(targetId)) {
            return res.status(400).json({ msg: "Identifiant de cible manquant ou invalide." });
        }

        const userObjId = new mongoose.Types.ObjectId(userId);
        const targetObjId = new mongoose.Types.ObjectId(targetId);
        let query = {};

        if (isGroup === true || isGroup === 'true') {
            const groupExists = await Group.findOne({ _id: targetObjId, members: userObjId });
            if (!groupExists) {
                return res.status(403).json({ msg: "Vous ne faites pas partie de ce groupe." });
            }
            query = { groupId: targetObjId };
        } else {
            query = {
                groupId: { $exists: false },
                $or: [
                    { sender: userObjId, receiver: targetObjId },
                    { sender: targetObjId, receiver: userObjId }
                ]
            };
        }

        await Message.updateMany(query, {
            $addToSet: { hiddenFor: userObjId }
        });

        return res.json({ success: true, msg: "L'historique de la conversation a été vidé." });
    } catch (err) {
        console.error("❌ Erreur effacement conversation :", err);
        return res.status(500).json({ msg: "Erreur lors de la suppression de la conversation." });
    }
};
