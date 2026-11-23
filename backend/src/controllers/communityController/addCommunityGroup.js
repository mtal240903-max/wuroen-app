const Group = require('../../models/messages_models/Group');
const CommunityMember = require('../../models/messages_models/CommunityMember');


exports.addCommunityGroup = async (req, res) => {
  try {
    const { id: communityId } = req.params; // ID de la communauté
    const { name, description, avatar } = req.body;
    const userId = req.user._id;

    // 1. Vérification des permissions : l'utilisateur a-t-il le droit de créer des groupes ?
    const member = await CommunityMember.findOne({ communityId, userId });
    
    if (!member || !member.permissions.includes('manage_groups')) {
      return res.status(403).json({ 
        message: "Vous n'avez pas la permission de créer un groupe dans cette communauté." 
      });
    }

    // 2. Création du groupe
    const newGroup = await Group.create({
      name: name.trim(),
      description: description || "",
      communityId: communityId, // Liaison avec la communauté
      creator: userId,
      members: [userId], // Le créateur est automatiquement membre
      admins: [userId],  // Le créateur est automatiquement admin du groupe
      avatar: avatar || ""
    });

    return res.status(201).json({
      success: true,
      message: "Groupe créé avec succès.",
      group: newGroup
    });

  } catch (error) {
    console.error("Erreur création groupe :", error);
    return res.status(500).json({ 
      success: false, 
      message: "Erreur lors de la création du groupe.",
      error: error.message 
    });
  }
};