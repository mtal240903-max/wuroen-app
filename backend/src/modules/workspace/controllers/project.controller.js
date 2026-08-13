const Project = require('../models/Project');
const Company = require('../models/Company');
const Folder = require('../models/Folder');
const File = require('../models/File');

// Helper de vérification d'accès à un projet
async function verifyProjectAccess(projectId, userId) {
  const project = await Project.findById(projectId).populate('company');
  if (!project) return { project: null, hasAccess: false };

  let hasAccess = project.createdBy.toString() === userId.toString();
  if (!hasAccess && project.company && project.company.user) {
    hasAccess = project.company.user.toString() === userId.toString();
  }
  if (!hasAccess && project.company && project.company.isPublic) {
    hasAccess = true;
  }

  return { project, hasAccess };
}

// ─── 1. CRÉER UN PROJET ───────────────────────────────────────────────────
exports.createProject = async (req, res, next) => {
  try {
    const { name, description, companyId, category, imageUrl } = req.body;
    const userId = req.user._id || req.user.id;

    if (!name) {
      return res.status(400).json({ 
        success: false, 
        message: "Le nom du projet est requis." 
      });
    }

    let assignedCompany = null;

    // Si un companyId est fourni, on vérifie qu'il appartient bien à l'utilisateur
    if (companyId) {
      const company = await Company.findOne({ _id: companyId, user: userId });
      if (!company) {
        return res.status(404).json({
          success: false,
          message: "Entreprise introuvable ou non autorisée."
        });
      }
      assignedCompany = companyId;
    }

    const newProject = await Project.create({
      company: assignedCompany, // Lié à l'entreprise si fourni, sinon null
      name: name.trim(),
      description: description ? description.trim() : "",
      category: category || 'Elevage',
      imageUrl: imageUrl || null,
      createdBy: userId // Toujours lié à l'utilisateur créateur
    });

    res.status(201).json({
      success: true,
      message: "Projet créé avec succès !",
      data: newProject
    });
  } catch (error) {
    next(error);
  }
};

// ─── 2. LISTER LES PROJETS DE L'UTILISATEUR ────────────────────────────────
exports.getUserProjects = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;

    // Récupérer les entreprises de l'utilisateur
    const userCompanies = await Company.find({ user: userId }).select('_id');
    const companyIds = userCompanies.map(c => c._id);

    const projects = await Project.find({
      $or: [
        { createdBy: userId },
        { company: { $in: companyIds } }
      ]
    })
      .populate('createdBy', 'name email')
      .populate('company', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    next(error);
  }
};

// ─── 2. BIS - LISTER LES PROJETS D'UNE ENTREPRISE ──────────────────────────
exports.getCompanyProjects = async (req, res, next) => {
  try {
    const { companyId } = req.params;
    const userId = req.user._id || req.user.id;

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Entreprise introuvable."
      });
    }

    // Sécurité : Propriétaire ou entreprise publique
    if (company.user.toString() !== userId.toString() && !company.isPublic) {
      return res.status(403).json({
        success: false,
        message: "Accès refusé à cette entreprise."
      });
    }

    const projects = await Project.find({ company: companyId })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    next(error);
  }
};

// ─── 3. CRÉER UN DOSSIER ──────────────────────────────────────────────────
exports.createFolder = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { name, parentFolder } = req.body;
    const userId = req.user._id || req.user.id;

    if (!name) {
      return res.status(400).json({ 
        success: false, 
        message: "Le nom du dossier est requis." 
      });
    }

    const { project, hasAccess } = await verifyProjectAccess(projectId, userId);
    if (!project) {
      return res.status(404).json({ success: false, message: "Projet introuvable." });
    }
    if (!hasAccess) {
      return res.status(403).json({ success: false, message: "Accès refusé." });
    }

    const newFolder = await Folder.create({
      project: projectId,
      name,
      parentFolder: parentFolder || null,
      createdBy: userId
    });

    res.status(201).json({
      success: true,
      message: "Dossier créé avec succès !",
      data: newFolder
    });
  } catch (error) {
    next(error);
  }
};

// ─── 4. LISTER LE CONTENU D'UN PROJET / DOSSIER ───────────────────────────
exports.getFolderContent = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const parentFolder = req.query.parentFolder || null;
    const userId = req.user._id || req.user.id;

    const { project, hasAccess } = await verifyProjectAccess(projectId, userId);
    if (!project) {
      return res.status(404).json({ success: false, message: "Projet introuvable." });
    }
    if (!hasAccess) {
      return res.status(403).json({ success: false, message: "Accès refusé." });
    }

    const folders = await Folder.find({
      project: projectId,
      parentFolder: parentFolder
    }).populate('createdBy', 'name');

    const files = await File.find({
      project: projectId,
      folder: parentFolder
    }).populate('createdBy', 'name');

    res.status(200).json({
      success: true,
      currentFolder: parentFolder,
      data: {
        folders,
        files
      }
    });
  } catch (error) {
    next(error);
  }
};

// ─── 5. AJOUTER UN FICHIER ────────────────────────────────────────────────
exports.createFile = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { name, url, size, mimeType, folderId } = req.body;
    const userId = req.user._id || req.user.id;

    if (!name || !url) {
      return res.status(400).json({ 
        success: false, 
        message: "Le nom et l'URL du fichier sont requis." 
      });
    }

    const { project, hasAccess } = await verifyProjectAccess(projectId, userId);
    if (!project) {
      return res.status(404).json({ success: false, message: "Projet introuvable." });
    }
    if (!hasAccess) {
      return res.status(403).json({ success: false, message: "Accès refusé." });
    }

    const newFile = await File.create({
      project: projectId,
      folder: folderId || null,
      name,
      url,
      size,
      mimeType,
      createdBy: userId
    });

    res.status(201).json({
      success: true,
      message: "Fichier enregistré avec succès !",
      data: newFile
    });
  } catch (error) {
    next(error);
  }
};