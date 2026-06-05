const path = require('path');
// Chargement sécurisé de ton modèle de Message
const Message = require(path.join(process.cwd(), 'src', 'models', 'messages_models', 'Message'));

const initiateCall = async (req, res) => {
  try {
    const { receiverId, groupId, isVideo } = req.body;

    // Définition de la cible de l'appel
    const targetId = groupId || receiverId;
    if (!targetId) {
      return res.status(400).json({ message: "Cible de l'appel (receiverId ou groupId) manquante." });
    }

    // 🔑 Génération d'un identifiant de salon unique pour WebRTC
    const roomId = `room_${req.user._id}_${targetId}_${Date.now()}`;

    // On peut aussi enregistrer une trace de l'appel manqué/émis dans la table Message
    const callLog = await Message.create({
      sender: req.user._id,
      receiver: receiverId || undefined,
      groupId: groupId || null,
      content: isVideo ? "🎥 Appel vidéo démarré" : "📞 Appel audio démarré",
      messageType: 'text', // Reste un message texte standard pour l'historique
      createdAt: new Date()
    });

    // Renvoie les informations nécessaires à l'application mobile pour rejoindre le salon
    res.status(200).json({
      success: true,
      roomId: roomId,
      isVideo: isVideo || false,
      callLog: callLog
    });

  } catch (error) {
    console.error("Erreur contrôleur appel:", error.message);
    res.status(500).json({ message: "Impossible d'initialiser l'appel.", error: error.message });
  }
};

module.exports = initiateCall;