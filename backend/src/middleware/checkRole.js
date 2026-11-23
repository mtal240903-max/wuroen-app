const TeamMember = require('../modules/workspace/models/TeamMember');

/**
 * Middleware pour restreindre l'accès en fonction des rôles du Workspace
 * @param {Array} allowedRoles - Liste des rôles autorisés (ex: ['Owner', 'Admin'])
 */
const checkRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      // 1. Récupérer l'ID du workspace (soit dans les paramètres de l'URL, soit dans le corps de la requête)
      const workspaceId = req.params.workspaceId || req.body.workspaceId;
      
      if (!workspaceId) {
        return res.status(400).json({ 
          success: false, 
          message: "L'identifiant du Workspace est manquant dans la requête." 
        });
      }

      // 2. Vérifier si l'utilisateur est bien authentifié (fourni par ton middleware de login global req.user)
      if (!req.user || !req.user._id) {
        return res.status(401).json({ 
          success: false, 
          message: "Action non autorisée. Utilisateur non authentifié." 
        });
      }

      // 3. Chercher l'appartenance et le rôle de l'utilisateur dans ce workspace
      const memberShip = await TeamMember.findOne({
        workspace: workspaceId,
        user: req.user._id
      });

      // 4. Si l'utilisateur ne fait pas partie du workspace
      if (!memberShip) {
        return res.status(403).json({ 
          success: false, 
          message: "Accès refusé. Vous ne faites pas partie de cet espace de travail." 
        });
      }

      // 5. Vérifier si son rôle fait partie des rôles autorisés pour cette route
      if (!allowedRoles.includes(memberShip.role)) {
        return res.status(403).json({ 
          success: false, 
          message: `Accès refusé. Votre rôle (${memberShip.role}) ne vous donne pas les privilèges nécessaires.` 
        });
      }

      // 6. Si tout est bon, on attache le rôle à la requête pour pouvoir l'utiliser dans les contrôleurs si besoin
      req.workspaceRole = memberShip.role;
      
      next(); // On laisse passer la requête vers le contrôleur
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "Erreur lors de la vérification des droits d'accès.", 
        error: error.message 
      });
    }
  };
};

module.exports = checkRole;