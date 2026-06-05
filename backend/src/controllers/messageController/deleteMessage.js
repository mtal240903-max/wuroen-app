const mongoose = require('mongoose');
const Message = require('../../models/messages_models/Message');
const Group = require('../../models/messages_models/Group'); 

module.exports = async (req, res) => {
    try {
        const userId = req.user._id;
        const { messageId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(messageId)) {
            return res.status(400).json({ msg: "Identifiant message invalide." });
        }

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ msg: "Message introuvable." });
        }

        const isSender = message.sender.toString() === userId.toString();
        const isReceiver = message.receiver && message.receiver.toString() === userId.toString();
        
        let isMember = false;
        if (message.groupId) {
            isMember = await Group.findOne({ _id: message.groupId, members: userId });
        }

        if (!isSender && !isReceiver && !isMember) {
            return res.status(403).json({ msg: "Action non autorisée sur ce message." });
        }

        await Message.findByIdAndUpdate(messageId, {
            $addToSet: { hiddenFor: userId }
        });

        return res.json({ success: true, msg: "Message supprimé avec succès." });
    } catch (err) {
        console.error("❌ Erreur suppression message :", err);
        return res.status(500).json({ msg: "Erreur serveur lors de la suppression." });
    }
};