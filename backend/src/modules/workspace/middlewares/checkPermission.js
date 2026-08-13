const WorkspaceMember = require('../models/WorkspaceMember');

/**
 * Middleware de contrôle d'accès dynamique pour les structures du Workspace
 * @param {String} requiredPermission - La permission requise (ex: 'manage_members', 'create_project')
 */
const checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      // 1. Récupération robuste de l'ID du workspace (depuis params.workspaceId ou params.id)
      const workspaceId = req.params.workspaceId || req.params.id;
      const userId = req.user.id;

      if (!workspaceId) {
        return res.status(400).json({ message: "L'identifiant du workspace est manquant dans la requête." });
      }

      // 2. Recherche du profil de l'utilisateur au sein de ce workspace
      let member = await WorkspaceMember.findOne({ workspaceId, userId });
      if (!member) {
        return res.status(403).json({ message: "Accès refusé. Vous ne faites pas partie du personnel de cet espace." });
      }

      // 3. Vérification du statut global du membre
      if (member.status === 'suspended') {
        return res.status(403).json({ message: "Votre accès à cet espace a été suspendu par l'administration." });
      }

      // 4. GESTION DYNAMIQUE DU MANDAT (Sécurité temporelle)
      if (member.mandate && member.mandate.status === 'active') {
        const now = new Date();
        
        if (member.mandate.endDate && member.mandate.endDate < now) {
          member.mandate.status = 'expired';
          member.level = 'member';
          member.memberStatus = 'passive_member';
          member.permissions = [];
          
          await member.save();
          
          return res.status(403).json({ 
            message: "Votre mandat de gestion a expiré. Vos privilèges administratifs ont été révoqués." 
          });
        }
      }

      // 5. CONTRÔLE DES DROITS & BYPASS (Founder)
      if (member.level === 'founder') {
        req.memberProfil = member;
        return next();
      }

      // 6. VÉRIFICATION DE LA PERMISSION REQUISE
      if (requiredPermission && !member.permissions.includes(requiredPermission)) {
        return res.status(403).json({ 
          message: `Action refusée. Vous n'avez pas la permission requise : [${requiredPermission}]` 
        });
      }

      req.memberProfil = member;
      next();
    } catch (error) {
      return res.status(500).json({ 
        message: "Erreur interne lors du contrôle des permissions du workspace", 
        error: error.message 
      });
    }
  };
};

module.exports = checkPermission;