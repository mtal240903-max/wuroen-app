const Company = require('../../models/Company'); 

// 🚀 Créer une entreprise / structure (POST /api/workspaces/:workspaceId/companies)
exports.createCompany = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { workspaceId } = req.params; // Récupéré de l'URL si nécessaire
    const { name, description, type, sector, location, investment, staffCount, website, isPublic } = req.body;

    let bgImage = "";
    if (req.file) {
      bgImage = req.file.path || req.file.filename;
    } else if (req.body.bgImage) {
      bgImage = req.body.bgImage;
    }

    const newCompany = await Company.create({
      user: userId,
      name: name ? name.trim() : "",
      description: description ? description.trim() : "",
      type,
      sector,
      location: location ? location.trim() : "",
      investment: investment || '0M',
      staffCount: parseInt(staffCount, 10) || 0,
      website: website || "",
      bgImage,
      isPublic: isPublic === 'true' || isPublic === true,
      status: "active"
    });

    return res.status(201).json({ success: true, data: newCompany });

  } catch (error) {
    console.error("DEBUG ERROR COMPAGNIE :", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 🚀 Récupérer toutes les entreprises de l'utilisateur (GET /api/companies)
exports.getCompanies = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    // ⚠️ Aucun .populate('workspace') ici pour éviter l'erreur Mongoose
    const companies = await Company.find({ user: userId });
    return res.status(200).json({ success: true, data: companies });
  } catch (error) {
    console.error("Erreur récupération compagnies :", error);
    return res.status(500).json({ success: false, message: "Erreur lors de la récupération de la liste des entreprises", error: error.message });
  }
};

// 🚀 Récupérer une entreprise par ID (GET /api/companies/:id)
exports.getCompanyById = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ success: false, message: "Entreprise introuvable" });
    }
    return res.status(200).json({ success: true, data: company });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.addCompanyStaff = async (req, res) => { /* Votre code */ };
exports.updateCompany = async (req, res) => { /* Votre code */ };
exports.removeCompanyStaff = async (req, res) => { /* Votre code */ };
exports.getCompanyAuditLogs = async (req, res) => { /* Votre code */ };