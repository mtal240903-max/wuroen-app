const Company = require('../../models/Company');

module.exports = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    // On récupère simplement toutes les entreprises de l'utilisateur
    const companies = await Company.find({ user: userId })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: companies
    });

  } catch (error) {
    console.error("Erreur récupération compagnies:", error);
    return res.status(500).json({ 
      success: false,
      message: "Erreur lors de la récupération de la liste des entreprises", 
      error: error.message 
    });
  }
};