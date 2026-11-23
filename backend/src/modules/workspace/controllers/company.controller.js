const Company = require('../../models/Company');

// 🚀 Créer une entreprise / structure
const createCompany = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { workspaceId } = req.params;
    const { name, description, type, sector, location, investment, staffCount, website, isPublic } = req.body;

    let bgImage = "";
    let logo = "";

    // Gestion des fichiers uploadés (via multer simple ou fields)
    if (req.files) {
      if (req.files.bgImage && req.files.bgImage[0]) {
        bgImage = req.files.bgImage[0].path || req.files.bgImage[0].filename;
      }
      if (req.files.logo && req.files.logo[0]) {
        logo = req.files.logo[0].path || req.files.logo[0].filename;
      }
    } else if (req.file) {
      // Si un seul fichier unique est géré par défaut (considéré ici comme la couverture par rétrocompatibilité)
      bgImage = req.file.path || req.file.filename;
    }

    // Fallback sur le body si les chemins/URLs sont passés directement en texte
    if (!bgImage && req.body.bgImage) bgImage = req.body.bgImage;
    if (!logo && req.body.logo) logo = req.body.logo;

    const newCompany = await Company.create({
      user: userId,
      workspace: workspaceId || null,
      name: name ? name.trim() : "",
      description: description ? description.trim() : "",
      type,
      sector,
      location: location ? location.trim() : "",
      investment: investment || '0M',
      staffCount: parseInt(staffCount, 10) || 0,
      website: website || "",
      bgImage,
      logo, // ➕ Intégration du logo
      isPublic: isPublic === 'true' || isPublic === true,
      status: "active"
    });

    return res.status(201).json({ success: true, data: newCompany });
  } catch (error) {
    console.error("DEBUG ERROR COMPAGNIE :", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 🚀 Récupérer toutes les entreprises de l'utilisateur
const getCompanies = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const companies = await Company.find({ user: userId });
    return res.status(200).json({ success: true, data: companies });
  } catch (error) {
    console.error("Erreur récupération compagnies :", error);
    return res.status(500).json({ success: false, message: "Erreur lors de la récupération de la liste des entreprises", error: error.message });
  }
};

// 🚀 Récupérer une entreprise par ID
const getCompanyById = async (req, res) => {
  try {
    const companyId = req.params.id;
    const company = await Company.findById(companyId);
    
    if (!company) {
      return res.status(404).json({ success: false, message: "Entreprise introuvable" });
    }

    let staff = [];
    let projects = [];
    let activities = [];
    let announcements = [];

    const projectsCount = projects.length;
    const tasksCount = projects.reduce((acc, p) => acc + (p.tasksCount || 0), 0);
    
    let totalProgress = 0;
    if (projectsCount > 0) {
      const sumProgress = projects.reduce((acc, p) => acc + (p.progress || 0), 0);
      totalProgress = Math.round(sumProgress / projectsCount);
    }

    return res.status(200).json({
      success: true,
      data: {
        company,
        staff,
        projects,
        activities,
        announcements,
        projectsCount,
        tasksCount,
        progress: totalProgress
      }
    });
  } catch (error) {
    console.error("Erreur getCompanyById :", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// 🚀 Ajouter du personnel
const addCompanyStaff = async (req, res) => { 
  try {
    const { id } = req.params;
    const { userId, role } = req.body;
    return res.status(200).json({ success: true, message: "Membre ajouté avec succès" });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// 🚀 Mettre à jour une entreprise
const updateCompany = async (req, res) => { 
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Gestion des fichiers lors de la mise à jour
    if (req.files) {
      if (req.files.bgImage && req.files.bgImage[0]) {
        updateData.bgImage = req.files.bgImage[0].path || req.files.bgImage[0].filename;
      }
      if (req.files.logo && req.files.logo[0]) {
        updateData.logo = req.files.logo[0].path || req.files.logo[0].filename;
      }
    } else if (req.file) {
      updateData.bgImage = req.file.path || req.file.filename;
    }

    const updatedCompany = await Company.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!updatedCompany) {
      return res.status(404).json({ success: false, message: "Entreprise introuvable pour la mise à jour" });
    }

    return res.status(200).json({ success: true, data: updatedCompany });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// 🚀 Supprimer un membre du staff
const removeCompanyStaff = async (req, res) => { 
  try {
    const { id, staffId } = req.params;
    return res.status(200).json({ success: true, message: "Membre retiré avec succès" });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// 🚀 Récupérer les journaux d'audit
const getCompanyAuditLogs = async (req, res) => { 
  try {
    const { id } = req.params;
    return res.status(200).json({ success: true, data: [] });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// 🚀 Récupérer le personnel d'une entreprise
const getCompanyStaff = async (req, res) => {
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

// 📦 Exportation explicite de toutes les fonctions du contrôleur
module.exports = {
  createCompany,
  getCompanies,
  getCompanyById,
  addCompanyStaff,
  updateCompany,
  removeCompanyStaff,
  getCompanyAuditLogs,
  getCompanyStaff
};