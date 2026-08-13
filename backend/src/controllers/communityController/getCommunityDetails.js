// Remplacez votre ligne actuelle par :
const Community = require('../../models/messages_models/Community');
const CommunityMember = require('../../models/messages_models/CommunityMember');
const Group = require('../../models/messages_models/Group');

exports.getCommunityDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // 1. Récupérer la communauté et vérifier si elle existe
    const community = await Community.findById(id)
      .populate('workspaceId', 'name type') // On récupère juste le nécessaire du workspace
      .lean(); // .lean() améliore les performances pour les lectures seules

    if (!community) {
      return res.status(404).json({ message: "Communauté introuvable." });
    }

    // 2. Vérifier si l'utilisateur est bien membre de cette communauté
    const isMember = await CommunityMember.findOne({ 
      communityId: id, 
      userId: userId 
    });

    if (!isMember) {
      return res.status(403).json({ message: "Vous n'êtes pas membre de cette communauté." });
    }

    // 3. Récupérer les statistiques et les membres (Organigramme)
    const members = await CommunityMember.find({ communityId: id })
      .populate('userId', 'name avatar role') // Supposant que vous avez un modèle User
      .sort({ level: 1 }); // Tri par niveau hiérarchique

    const groupCount = await Group.countDocuments({ communityId: id });

    // 4. Retourner l'objet complet pour le dashboard
    return res.status(200).json({
      success: true,
      community: {
        ...community,
        stats: {
          memberCount: members.length,
          groupCount: groupCount
        },
        members: members // Utilisé pour l'écran OrganizationChartScreen
      }
    });

  } catch (error) {
    console.error("Erreur récupération communauté :", error);
    return res.status(500).json({ 
      success: false, 
      message: "Erreur lors de la récupération des détails.",
      error: error.message 
    });
  }
};