const Collaboration = require('../../models/Collaboration');
const User = require('../../models/User');

const requestCollaboration = async (req, res, next) => {
  try {
    const targetId = req.params.id;
    const currentUserId = req.user._id;
    
    // 🛡️ 1. Sécurité : Empêcher l'auto-collaboration
    if (targetId === currentUserId.toString()) {
      return res.status(400).json({ message: "Action impossible sur soi-même." });
    }
    
    // 🔍 2. Récupérer l'utilisateur cible pour s'assurer qu'il existe toujours
    const userToRequest = await User.findById(targetId);
    if (!userToRequest) {
      return res.status(404).json({ message: "Expert non trouvé." });
    }
    
    // 🔍 3. Vérifier s'il existe déjà une relation (en attente ou acceptée) dans la collection Collaboration
    const existingCollab = await Collaboration.findOne({
      $or: [
        { sender: currentUserId, receiver: targetId },
        { sender: targetId, receiver: currentUserId }
      ]
    });
    
    if (existingCollab) {
      if (existingCollab.status === 'accepted') {
        return res.status(400).json({ message: "Déjà dans votre réseau de partenaires." });
      }
      if (existingCollab.status === 'pending') {
        return res.status(400).json({ message: "Demande déjà envoyée et en attente d'approbation." });
      }
    }
    
    // 📥 4. Enregistrement de la demande dans la collection dédiée 'collaborations'
    const newCollab = new Collaboration({
      sender: currentUserId,
      receiver: targetId,
      status: 'pending'
    });
    
    await newCollab.save();
    
    // 📤 5. Réponse structurée pour ton terminal React Native
    return res.status(200).json({ 
      success: true,
      message: "Demande de collaboration envoyée !", 
      status: "pending",
      collabId: newCollab._id
    });

  } catch (error) {
    console.error("🔥 Erreur critique requestCollaboration :", error.message);
    // ✅ Utilisation sécurisée de next() connectée à ton routeur Express
    return next(error);
  }
};

// Exportation directe (Aucune accolade {})
module.exports = requestCollaboration;