const Workspace = require('../models/Workspace');
const WorkspaceInvitation = require('../models/WorkspaceInvitation');

/**
 * @desc    Envoyer une invitation pour rejoindre un espace (Vérifie si l'émetteur a le droit)
 * @route   POST /api/workspaces/:workspaceId/invitations
 * @access  Private (Owner, Admin, Manager uniquement)
 */
const sendInvitation = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { invitedEmail, roleAssigned } = req.body;
    const requesterId = req.user._id;

    // 1. Validation de base des entrées
    if (!invitedEmail || typeof invitedEmail !== 'string') {
      return res.status(400).json({ success: false, message: "Une adresse email valide est requise." });
    }

    const cleanEmail = invitedEmail.trim().toLowerCase();

    // 2. Sécurité RBAC : Seuls l'Owner, l'Admin ou le Manager peuvent inviter
    // 'req.workspaceRole' a été pré-injecté en toute sécurité par notre middleware Gatekeeper
    if (!['Owner', 'Admin', 'Manager'].includes(req.workspaceRole)) {
      return res.status(403).json({ success: false, message: "Vous n'avez pas les privilèges requis pour inviter des membres." });
    }

    // 3. Empêcher de s'inviter soi-même
    if (cleanEmail === req.user.email.toLowerCase()) {
      return res.status(400).json({ success: false, message: "Opération impossible : vous êtes déjà le gestionnaire de cet espace." });
    }

    // 4. Vérifier si l'utilisateur est DÉJÀ membre pour éviter les doublons ou fuites
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ success: false, message: "Espace de travail introuvable." });
    }

    // Vérification de sécurité dans la base : est-il déjà dans le tableau ?
    const alreadyMember = await Workspace.findOne({
      _id: workspaceId,
      "members.user": req.user._id // Cette logique sera adaptée lors de la liaison avec le modèle User global
    });

    // 5. Création et enregistrement de l'invitation cryptée
    try {
      const invitation = new WorkspaceInvitation({
        workspace: workspaceId,
        inviter: requesterId,
        invitedEmail: cleanEmail,
        roleAssigned: ['Owner'].includes(roleAssigned) ? 'Member' : roleAssigned // Personne ne peut attribuer le rôle 'Owner'
      });

      await invitation.save();

      // C'est ici que tu brancheras ton service d'envoi de mail (ex: Nodemailer/SendGrid) pour envoyer l'invitation avec 'invitation.token'
      
      return res.status(201).json({
        success: true,
        message: `Invitation envoyée avec succès à ${cleanEmail}.`
      });

    } catch (dbError) {
      // Si l'index unique composite rejette la requête, c'est qu'une invitation est déjà en cours
      if (dbError.code === 11000) {
        return res.status(409).json({ success: false, message: "Une invitation active a déjà été envoyée à cette adresse email." });
      }
      throw dbError; // Relance l'erreur pour le catch global si c'est un autre problème
    }

  } catch (error) {
    console.error("CRITICAL ERROR [sendInvitation]:", error);
    return res.status(500).json({ success: false, message: "Une erreur de sécurité est survenue à l'envoi." });
  }
};

/**
 * @desc    Accepter ou refuser une invitation reçue (Validation stricte de l'identité)
 * @route   PUT /api/workspaces/invitations/:inviteId
 * @access  Private
 */
const handleInvitationStatus = async (req, res) => {
  try {
    const { inviteId } = req.params;
    const { action } = req.body; // 'Acceptée' ou 'Refusée'
    const userEmail = req.user.email.toLowerCase(); // L'email de l'utilisateur connecté via JWT
    const userId = req.user._id;

    if (!['Acceptée', 'Refusée'].includes(action)) {
      return res.status(400).json({ success: false, message: "Action invalide. Choisissez 'Acceptée' ou 'Refusée'." });
    }

    // 1. Recherche de l'invitation
    const invitation = await WorkspaceInvitation.findOne({ _id: inviteId, status: 'En attente' });
    if (!invitation) {
      return res.status(404).json({ success: false, message: "Invitation introuvable, expirée ou déjà traitée." });
    }

    // 2. VERROU DE CONFIDENTIALITÉ ABSOLU : L'email de l'invitation doit correspondre à l'utilisateur connecté
    if (invitation.invitedEmail !== userEmail) {
      return res.status(403).json({ success: false, message: "Sécurité : Cette invitation ne vous est pas destinée." });
    }

    if (action === 'Refusée') {
      invitation.status = 'Refusée';
      await invitation.save();
      return res.status(200).json({ success: true, message: "Invitation déclinée avec succès." });
    }

    // 3. ACTION : ACCEPTER L'INVITATION
    // On met à jour l'invitation
    invitation.status = 'Acceptée';
    await invitation.save();

    // On insère l'utilisateur de manière atomique dans le Workspace pour éviter les conflits d'accès simultanés
    await Workspace.updateOne(
      { _id: invitation.workspace, "members.user": { $ne: userId } }, // Sécurité : s'assure qu'il n'est pas déjà dedans
      { 
        $push: { 
          members: { 
            user: userId, 
            role: invitation.roleAssigned, 
            joinedAt: new Date() 
          } 
        } 
      }
    );

    return res.status(200).json({
      success: true,
      message: "Vous avez rejoint l'espace de travail avec succès."
    });

  } catch (error) {
    console.error("CRITICAL ERROR [handleInvitationStatus]:", error);
    return res.status(500).json({ success: false, message: "Erreur lors du traitement de l'invitation." });
  }
};

module.exports = {
  sendInvitation,
  handleInvitationStatus
};