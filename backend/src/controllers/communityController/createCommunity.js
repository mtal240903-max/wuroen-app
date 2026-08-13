// Correction des chemins pour correspondre à votre structure réelle
const Community = require('../../models/messages_models/Community');
const CommunityMember = require('../../models/messages_models/CommunityMember');
const mongoose = require('mongoose');


exports.createCommunity = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { name, description, workspaceId, visibility } = req.body;
    const userId = req.user._id; // Injecté par le middleware 'protect'

    if (!name || !workspaceId) {
      return res.status(400).json({ message: "Le nom et le workspaceId sont obligatoires." });
    }

    // 1. Création de la communauté
    const [newCommunity] = await Community.create([{
      name: name.trim(),
      description: description || "",
      workspaceId,
      creator: userId,
      visibility: visibility || 'public',
      members: [userId] // Ajout immédiat du créateur dans la liste des membres
    }], { session });

    // 2. Création de la fiche "Membre" avec le rôle Fondateur (Hiérarchie)
    await CommunityMember.create([{
      userId: userId,
      communityId: newCommunity._id,
      role: 'founder',
      level: 1, // Niveau hiérarchique le plus élevé
      permissions: ['manage_workspace', 'manage_members', 'manage_roles', 'manage_groups']
    }], { session });

    await session.commitTransaction();
    
    return res.status(201).json({
      success: true,
      message: "Communauté créée avec succès.",
      community: newCommunity
    });

  } catch (error) {
    await session.abortTransaction();
    console.error("Erreur création communauté :", error);
    return res.status(500).json({ 
      success: false, 
      message: "Erreur lors de la création de la communauté",
      error: error.message 
    });
  } finally {
    session.endSession();
  }
};