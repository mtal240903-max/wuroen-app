const Community = require('../../models/messages_models/Community');
const CommunityMember = require('../../models/messages_models/CommunityMember');

exports.joinCommunity = async (req, res) => {
  try {
    const { id } = req.params; // ID de la communauté
    const userId = req.user._id;

    // 1. Vérifier si la communauté existe
    const community = await Community.findById(id);
    if (!community) {
      return res.status(404).json({ message: "Communauté introuvable." });
    }

    // 2. Vérifier si l'utilisateur est déjà membre
    const existingMember = await CommunityMember.findOne({ communityId: id, userId });
    if (existingMember) {
      return res.status(400).json({ message: "Vous êtes déjà membre de cette communauté." });
    }

    // 3. Gestion de la visibilité
    if (community.visibility === 'private') {
      return res.status(403).json({ 
        message: "Cette communauté est privée. Veuillez demander une invitation." 
      });
    }

    // 4. Ajouter le membre
    await CommunityMember.create({
      userId,
      communityId: id,
      role: 'member',
      level: 5, // Niveau membre simple
      permissions: ['read_content'] // Permissions restreintes par défaut
    });

    // 5. Ajouter l'ID dans le tableau des membres de la communauté (pour faciliter les requêtes)
    await Community.findByIdAndUpdate(id, { $addToSet: { members: userId } });

    return res.status(200).json({
      success: true,
      message: "Vous avez rejoint la communauté avec succès."
    });

  } catch (error) {
    console.error("Erreur lors de la jointure :", error);
    return res.status(500).json({ 
      success: false, 
      message: "Erreur lors de l'adhésion à la communauté.",
      error: error.message 
    });
  }
};