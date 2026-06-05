const Collaboration = require('../../models/Collaboration');
const User = require('../../models/User');

const respondCollaboration = async (req, res, next) => {
  try {
    const { senderId, action } = req.body; // action: 'accept' ou 'reject'
    const currentUserId = req.user._id;

    // 🔍 1. Trouver la demande de collaboration existante dans la collection dédiée
    const collab = await Collaboration.findOne({
      sender: senderId,
      receiver: currentUserId,
      status: 'pending'
    });

    if (!collab) {
      return res.status(404).json({ message: "Demande introuvable, expirée ou déjà traitée." });
    }

    // ⚡ 2. Si l'action est 'accept', on effectue la liaison dans les profils User
    if (action === 'accept') {
      const [me, sender] = await Promise.all([
        User.findById(currentUserId),
        User.findById(senderId)
      ]);

      if (!me || !sender) {
        return res.status(404).json({ message: "L'un des profils utilisateurs est introuvable." });
      }

      // Liaison bidirectionnelle sécurisée (évite les doublons)
      if (!me.followers.includes(senderId)) me.followers.push(senderId);
      if (!me.following.includes(senderId)) me.following.push(senderId);

      if (!sender.followers.includes(currentUserId)) sender.followers.push(currentUserId);
      if (!sender.following.includes(currentUserId)) sender.following.push(currentUserId);

      // Sauvegarde des deux profils utilisateurs mis à jour
      await Promise.all([me.save(), sender.save()]);

      // Mise à jour du statut du document Collaboration
      collab.status = 'accepted';
      await collab.save();

      return res.status(200).json({ 
        success: true,
        message: "Réseau mis à jour avec succès !", 
        status: "accepted" 
      });
    }

    // ❌ 3. Si l'action est 'reject' (ou autre), on met à jour ou on supprime
    // Option A : Mettre à jour le statut en 'rejected' (recommandé pour l'historique)
    collab.status = 'rejected';
    await collab.save();

    // Option B : Si tu préfères la supprimer définitivement comme ton ancien splice, utilise :
    // await Collaboration.findByIdAndDelete(collab._id);

    return res.status(200).json({ 
      success: true,
      message: "Demande de liaison ignorée.", 
      status: "rejected" 
    });

  } catch (error) {
    console.error("🔥 Erreur critique respondCollaboration :", error.message);
    // ✅ Sécurisation de la propagation de l'erreur vers le routeur Express
    return next(error);
  }
};

module.exports = respondCollaboration;