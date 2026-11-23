const Company = require('../../models/Company');

module.exports = async (req, res) => {
  try {
    const companyId = req.params.id;

    // Récupération de l'entreprise via le modèle Company (sans populate)
    const companyData = await Company.findOne({ _id: companyId })
      .select('+auditLog'); // Force l'affichage si le champ auditLog existe et était masqué

    if (!companyData) {
      return res.status(404).json({ success: false, message: "Structure introuvable." });
    }

    return res.status(200).json({
      success: true,
      data: companyData.auditLog || []
    });

  } catch (error) {
    console.error("Erreur de récupération des logs d'audit :", error);
    return res.status(500).json({ 
      success: false, 
      message: "Erreur de récupération des logs d'audit", 
      error: error.message 
    });
  }
};