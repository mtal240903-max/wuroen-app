const Company = require('../../models/Company');
const Project = require('../../models/Project'); // Assurez-vous d'importer votre modèle Project

module.exports = async (req, res) => {
  try {
    const companyId = req.params.id;
    const userId = req.user.id || req.user._id;

    const company = await Company.findOne({ _id: companyId });
    if (!company) {
      return res.status(404).json({ success: false, message: "Structure introuvable." });
    }

    // 🔒 CONTRÔLE DE CONFIDENTIALITÉ
    const isOwner = company.user.toString() === userId.toString();
    if (!isOwner && !company.isPublic) {
      return res.status(403).json({ success: false, message: "Accès refusé. Cette structure est privée." });
    }

    // 🛠️ Récupération des projets liés à cette compagnie
    const projects = await Project.find({ company: companyId }).sort({ createdAt: -1 });

    return res.status(200).json({ 
      success: true, 
      data: { 
        company, 
        staff: company.staff || [], 
        projects // <-- On inclut enfin les projets ici !
      } 
    });

  } catch (error) {
    console.error("Erreur de récupération de la structure:", error);
    return res.status(500).json({ success: false, message: "Erreur serveur", error: error.message });
  }
};