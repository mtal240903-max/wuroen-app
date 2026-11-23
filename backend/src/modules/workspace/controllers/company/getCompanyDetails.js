const Company = require('../../models/Company');

module.exports = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id || req.user._id;

    // Recherche de l'entreprise par son ID et vérification qu'elle appartient bien à l'utilisateur
    const company = await Company.findOne({ _id: id, user: userId });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Entreprise introuvable."
      });
    }

    return res.status(200).json({
      success: true,
      data: company // ou l'objet direct selon ce que votre front attend
    });

  } catch (error) {
    console.error("Erreur récupération détails entreprise:", error);
    return res.status(500).json({ 
      success: false,
      message: "Erreur lors de la récupération des détails de l'entreprise", 
      error: error.message 
    });
  }
};