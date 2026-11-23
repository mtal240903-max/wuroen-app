const Company = require('../../models/Company');

module.exports = async (req, res) => {
  try {
    const companyId = req.params.id;

    const company = await Company.findById(companyId).populate({
      path: 'staff.userId',
      select: 'name email avatar'
    });

    if (!company) {
      return res.status(404).json({ success: false, message: "Structure introuvable." });
    }

    return res.status(200).json({ 
      success: true, 
      count: company.staff ? company.staff.length : 0, 
      data: company.staff || [] 
    });
  } catch (error) {
    console.error("Erreur lors de la récupération du personnel :", error);
    return res.status(500).json({ success: false, message: "Erreur serveur", error: error.message });
  }
};