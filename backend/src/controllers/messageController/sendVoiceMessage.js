const path = require('path');
const Message = require(path.join(process.cwd(), 'src', 'models', 'messages_models', 'Message'));

const sendVoiceMessage = async (req, res) => {
  try {
    const { receiverId, groupId } = req.body;
    const senderId = req.user._id;

    // 1. Validation fichier
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Aucun fichier audio reçu.' });
    }

    // 2. Validation destinataire
    if (!receiverId && !groupId) {
      return res.status(400).json({ success: false, message: 'Aucun destinataire défini.' });
    }

    // 3. Construction URL propre
    // Utilisation de protocol/host pour garantir que le lien fonctionne sur mobile
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/voices/${req.file.filename}`;

    // 4. Enregistrement DB
    const newVoiceMessage = await Message.create({
      sender: senderId,
      receiver: receiverId || undefined,
      groupId: groupId || null,
      messageType: 'voice',
      fileUrl,
      content: '🎤 Message vocal',
      isRead: false
    });

    // 5. Peuplement (avec .lean() pour la performance)
    const populatedMessage = await Message.findById(newVoiceMessage._id)
      .populate('sender', 'name profilePhoto specialty')
      .populate('receiver', 'name')
      .lean();

    // 6. Socket.io (Temps Réel)
    const io = req.app.get('io');
    if (io) {
      if (receiverId) {
        io.to(receiverId.toString()).emit('new_private_message', populatedMessage);
      }
      if (groupId) {
        io.to(groupId.toString()).emit('new_group_message', populatedMessage);
      }
    }

    // 7. Réponse
    return res.status(201).json({
      success: true,
      message: 'Message vocal envoyé.',
      data: populatedMessage
    });

  } catch (error) {
    console.error('🔥 Erreur contrôleur vocal :', error);
    
    return res.status(500).json({
      success: false,
      message: "Erreur lors de l'enregistrement du vocal.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = sendVoiceMessage;