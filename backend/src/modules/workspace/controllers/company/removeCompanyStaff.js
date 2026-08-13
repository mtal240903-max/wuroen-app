const Company = require('../../models/Company');

module.exports = async (req, res) => {
  try {
    const { id: companyId, staffId } = req.params;
    const userId = req.user.id || req.user._id;

    // Récupérer l'entreprise
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ success: false, message: "Structure introuvable." });
    }

    // 🔒 Contrôle : Seul le propriétaire de l'entreprise peut gérer le personnel
    if (company.user.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Action non autorisée." });
    }

    // Logique de mise à jour ou de retrait du membre (ex: tableau staff/team si vous en avez un)
    // Si vous stockez le staff directement dans un tableau de l'entreprise :
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    
    await Company.findByIdAndUpdate(companyId, {
      $pull: { staff: { userId: staffId } }, // Si le staff est un tableau d'objets dans le modèle Company
      $push: { 
        auditLog: { 
          action: 'STAFF_REMOVED', 
          performedBy: userId, 
          ipAddress, 
          details: { revokedStaffId: staffId } 
        } 
      }
    });

    return res.status(200).json({ success: true, message: "Le collaborateur a été retiré avec succès." });
  } catch (error) {
    console.error("Erreur lors de la révocation:", error);
    return res.status(500).json({ success: false, message: "Erreur lors de la révocation", error: error.message });
  }
};