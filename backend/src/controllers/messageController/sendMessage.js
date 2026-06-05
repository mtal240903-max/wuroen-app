const mongoose = require('mongoose');
const Message = require('../../models/messages_models/Message');
const Group = require('../../models/messages_models/Group');
const Collaboration = require('../../models/Collaboration');

module.exports = async (req, res) => {
  try {
    const { receiverId, chatId, groupId, content, isGroup } = req.body;
    const userId = req.user._id;

    // Détermination intelligente du targetId et du type de conversation
    const targetId = groupId || chatId || receiverId;
    const isGroupBool = isGroup === true || isGroup === 'true' || isGroup === 1;

    // 1. Validation basique
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({ message: "Le message ne peut pas être vide." });
    }
    
    if (content.trim().length > 5000) {
      return res.status(400).json({ message: "Message trop long." });
    }

    if (!targetId || !mongoose.Types.ObjectId.isValid(targetId)) {
      console.error("DEBUG: targetId invalide ou manquant:", targetId);
      return res.status(400).json({ message: "Destinataire ou groupe invalide." });
    }

    const msgData = { 
      sender: userId, 
      content: content.trim(),
      messageType: 'text' 
    };

    // 2. Logique selon type (Groupe vs Privé)
    if (isGroupBool) {
      const group = await Group.findOne({ _id: targetId, members: userId });
      if (!group) {
        return res.status(404).json({ message: "Groupe introuvable ou accès refusé." });
      }
      msgData.groupId = targetId;
      await Group.findByIdAndUpdate(targetId, { updatedAt: new Date() });
    } else {
      if (userId.toString() === targetId.toString()) {
        return res.status(400).json({ message: "Impossible de s'envoyer un message à soi-même." });
      }

      const activeCollab = await Collaboration.findOne({
        status: 'accepted',
        $or: [
          { sender: userId, receiver: targetId },
          { sender: targetId, receiver: userId }
        ]
      });

      if (!activeCollab) {
        return res.status(403).json({ message: "Envoi impossible : aucune collaboration active." });
      }
      msgData.receiver = targetId;
    }

    // 3. Sauvegarde
    const newMessage = await new Message(msgData).save();

    // 4. Peuplement (Populate)
    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender', 'name specialty role')
      .populate('receiver', 'name specialty role')
      .lean();

    // 5. Émission Socket.io
    const io = req.app.get('io');
    if (io) {
      const event = isGroupBool ? 'new_group_message' : 'new_private_message';
      io.to(targetId.toString()).emit(event, populatedMessage);
    }

    return res.status(201).json(populatedMessage);
    
  } catch (err) {
    console.error("❌ Erreur critique sendMessage:", err);
    return res.status(500).json({ message: "Erreur interne lors de l'envoi." });
  }
};