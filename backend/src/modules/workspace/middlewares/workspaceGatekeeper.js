const Company = require('../../models/Company');

/**
 * Middleware de contrôle d'accès basé sur les Entreprises / Structures
 */
const verifyCompanyAccess = () => {
  return async (req, res, next) => {
    try {
      const companyId = req.params.companyId || req.params.id;
      
      if (!req.user || !req.user._id) {
        return res.status(401).json({ message: "Authentification requise. Utilisateur non reconnu." });
      }

      const userId = req.user._id;

      if (!companyId) {
        return res.status(400).json({ message: "L'identifiant de la structure est requis dans l'URL." });
      }

      if (req.user.role === 'superadmin') {
        return next();
      }

      const company = await Company.findOne({ _id: companyId });

      if (!company) {
        return res.status(404).json({ message: "Accès refusé. Structure introuvable ou ID invalide." });
      }

      if (company.status === 'archived') {
        return res.status(403).json({ message: "Cette structure est archivée." });
      }

      if (company.user.toString() !== userId.toString()) {
        return res.status(403).json({ message: "Accès refusé. Vous n'êtes pas propriétaire de cette structure." });
      }

      req.company = company;
      next();
    } catch (error) {
      return res.status(500).json({ message: "Erreur lors de la vérification des accès à la structure.", error: error.message });
    }
  };
};

module.exports = { verifyCompanyAccess };