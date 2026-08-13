const TeamMember = require('../models/TeamMember');
const User = require('../../../models/User');

exports.inviteMember = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;
    const { email, role } = req.body;

    if (!email || !role) {
      return res.status(400).json({ 
        success: false, 
        message: "L'email et le rôle du collaborateur sont obligatoires." 
      });
    }

    const validRoles = ['Admin', 'Manager', 'Researcher', 'Accountant', 'Member', 'Guest'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ 
        success: false, 
        message: "Le rôle spécifié est invalide." 
      });
    }

    const userToInvite = await User.findOne({ email: email.toLowerCase().trim() });
    if (!userToInvite) {
      return res.status(404).json({ 
        success: false, 
        message: "Aucun utilisateur trouvé sur la plateforme avec cette adresse email." 
      });
    }

    const alreadyMember = await TeamMember.findOne({
      workspace: workspaceId,
      user: userToInvite._id
    });

    if (alreadyMember) {
      return res.status(400).json({ 
        success: false, 
        message: alreadyMember.status === 'Pending' 
          ? "Une invitation est déjà en attente pour cet utilisateur."
          : "Cet utilisateur est déjà membre de cet espace de travail." 
      });
    }

    const newMember = await TeamMember.create({
      workspace: workspaceId,
      user: userToInvite._id,
      role,
      status: 'Pending'
    });

    res.status(201).json({
      success: true,
      message: "Invitation envoyée avec succès.",
      data: newMember
    });
  } catch (error) {
    next(error);
  }
};

exports.respondToInvitation = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;
    const { action } = req.body;

    if (!['Accept', 'Decline'].includes(action)) {
      return res.status(400).json({ 
        success: false, 
        message: "Action invalide. Choisissez 'Accept' ou 'Decline'." 
      });
    }

    const membership = await TeamMember.findOne({
      workspace: workspaceId,
      user: req.user._id,
      status: 'Pending'
    });

    if (!membership) {
      return res.status(404).json({ 
        success: false, 
        message: "Aucune invitation en attente trouvée pour ce Workspace." 
      });
    }

    if (action === 'Accept') {
      membership.status = 'Accepted';
      membership.joinedAt = Date.now();
      await membership.save();

      return res.status(200).json({
        success: true,
        message: "Vous avez rejoint l'espace de travail avec succès !",
        data: membership
      });
    }

    if (action === 'Decline') {
      await membership.deleteOne();
      return res.status(200).json({
        success: true,
        message: "Invitation déclinée avec succès."
      });
    }
  } catch (error) {
    next(error);
  }
};

exports.getPendingInvitations = async (req, res, next) => {
  try {
    const invitations = await TeamMember.find({ 
      user: req.user._id, 
      status: 'Pending' 
    }).populate('workspace', 'name plan');

    res.status(200).json({
      success: true,
      count: invitations.length,
      data: invitations
    });
  } catch (error) {
    next(error);
  }
};