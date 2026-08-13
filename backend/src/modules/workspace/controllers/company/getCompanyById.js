const Company = require('../../models/Company');

module.exports = async (req, res) => {
  try {
    const companyId = req.params.id;
    const userId = req.user.id || req.user._id;

    const company = await Company.findOne({ _id: companyId });
    if (!company) {
      return res.status(404).json({ success: false, message: "Structure introuvable." });
    }

    // 🔒 CONTRÔLE DE CONFIDENTIALITÉ : L'utilisateur est-il le propriétaire ou l'entreprise est-elle publique ?
    const isOwner = company.user.toString() === userId.toString();

    if (!isOwner && !company.isPublic) {
      return res.status(403).json({ success: false, message: "Accès refusé. Cette structure est privée." });
    }

    // Si vous gérez du personnel lié directement à l'entreprise, vous pouvez l'adapter ici. 
    // Sinon, on renvoie simplement l'entreprise.
    return res.status(200).json({ 
      success: true, 
      data: { company, staff: [] } 
    });

  } catch (error) {
    console.error("Erreur de récupération de la structure:", error);
    return res.status(500).json({ success: false, message: "Erreur de confidentialité", error: error.message });
  }
};