const mongoose = require('mongoose');
const Resource = require('../../models/library/Resource');
const Category = require('../../models/library/Category');
const { cloudinary } = require('../../config/cloudinary'); // ✅ Import centralisé

// ==========================================
// 🔍 1. NAVIGATION & CATÉGORIES
// ==========================================

/**
 * Récupère les catégories enfants d'un parent donné
 */
exports.getCategoriesByParent = async (req, res) => {
  try {
    const { parentId } = req.params;

    const isRoot = !parentId || ['root', 'null', 'undefined'].includes(parentId);

    // ✅ Validation ObjectId si ce n'est pas la racine
    if (!isRoot && !mongoose.Types.ObjectId.isValid(parentId)) {
      return res.status(400).json({ message: "ID de catégorie invalide." });
    }

    const query = isRoot ? { parent: null } : { parent: parentId };

    const categories = await Category.find(query)
      .sort({ name: 1 })
      .select('name level parent'); // ✅ On ne renvoie que ce dont le frontend a besoin

    res.status(200).json(categories);
  } catch (error) {
    console.error("❌ Erreur getCategoriesByParent:", error);
    res.status(500).json({ message: "Erreur serveur lors de la navigation." });
  }
};

// ==========================================
// 📚 2. RESSOURCES (DOCUMENTS)
// ==========================================

/**
 * Récupère tous les documents d'une catégorie
 */
exports.getResourcesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    if (categoryId === 'root' || !mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(200).json([]);
    }

    // ✅ Vérifier que la catégorie existe réellement avant de chercher ses ressources
    const categoryExists = await Category.exists({ _id: categoryId });
    if (!categoryExists) {
      return res.status(404).json({ message: "Catégorie introuvable." });
    }

    // ✅ Pagination pour éviter de charger toute la bibliothèque en mémoire
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const [resources, total] = await Promise.all([
      Resource.find({ category: new mongoose.Types.ObjectId(categoryId) })
        .populate('createdBy', 'name') // ✅ FIX : 'firstName lastName' → 'name' (cohérent avec User.js)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-cloudinaryId'), // ✅ Ne pas exposer l'ID interne Cloudinary au frontend
      Resource.countDocuments({ category: categoryId })
    ]);

    res.status(200).json({ resources, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: "Erreur récupération ressources", error: error.message });
  }
};

/**
 * Récupère les détails d'un document spécifique
 */
exports.getResourceById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID de ressource invalide." });
    }

    const resource = await Resource.findById(id)
      .populate('createdBy', 'name')      // ✅ FIX : 'firstName lastName' → 'name'
      .populate('category', 'name level') // ✅ AJOUT : level utile pour le fil de navigation
      .select('-cloudinaryId');           // ✅ cloudinaryId non exposé

    if (!resource) {
      return res.status(404).json({ message: "Ressource non trouvée." });
    }

    res.status(200).json(resource);
  } catch (error) {
    res.status(500).json({ message: "Erreur récupération ressource.", error: error.message });
  }
};

// ==========================================
// ☁️ 3. AJOUT DE DOCUMENT
// ==========================================

exports.addResource = async (req, res) => {
  try {
    const { title, description, categoryId } = req.body;

    // ✅ Validation catégorie
    if (!categoryId || !mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ message: "ID de catégorie invalide ou manquant." });
    }

    // ✅ Vérifier que la catégorie cible existe
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Catégorie introuvable." });
    }

    // ✅ Validation fichier
    if (!req.file) {
      return res.status(400).json({ message: "Aucun fichier reçu." });
    }

    // ✅ Validation du type de fichier côté serveur (double sécurité après Multer)
    const allowedTypes = ['pdf', 'docx', 'doc', 'xlsx', 'pptx', 'txt'];
    const fileExt = req.file.originalname.split('.').pop().toLowerCase();
    if (!allowedTypes.includes(fileExt)) {
      // Si le fichier est déjà uploadé sur Cloudinary, on le supprime immédiatement
      if (req.file.filename) {
        await cloudinary.uploader.destroy(req.file.filename, { resource_type: 'raw' });
      }
      return res.status(400).json({
        message: `Type de fichier non autorisé. Types acceptés : ${allowedTypes.join(', ')}`
      });
    }

    // ✅ Validation titre
    const resourceTitle = (title || req.file.originalname).trim();
    if (resourceTitle.length < 3 || resourceTitle.length > 200) {
      return res.status(400).json({ message: "Le titre doit contenir entre 3 et 200 caractères." });
    }

    const newResource = new Resource({
      title: resourceTitle,
      description: (description || "").trim().slice(0, 1000), // ✅ Tronque si trop long
      category: categoryId,
      fileUrl: req.file.path,          // URL publique Cloudinary
      cloudinaryId: req.file.filename, // public_id pour la suppression future
      type: fileExt,
      size: (req.file.size / (1024 * 1024)).toFixed(2) + ' MB',
      createdBy: req.user._id,
      isApproved: true
    });

    await newResource.save();

    // On ne renvoie pas cloudinaryId dans la réponse
    const { cloudinaryId: _, ...resourceData } = newResource.toObject();

    res.status(201).json({
      message: "Document ajouté avec succès",
      resource: resourceData
    });
  } catch (error) {
    // ✅ Si la sauvegarde en base échoue APRÈS l'upload Cloudinary, on nettoie le cloud
    if (req.file?.filename) {
      try {
        await cloudinary.uploader.destroy(req.file.filename, { resource_type: 'raw' });
      } catch (cleanupError) {
        console.error("⚠️ Échec nettoyage Cloudinary après erreur DB:", cleanupError.message);
      }
    }
    res.status(500).json({ message: "Erreur lors de l'ajout", error: error.message });
  }
};

// ==========================================
// 🗑️ 4. SUPPRESSION DOCUMENT
// ==========================================

exports.deleteResource = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "ID de ressource invalide." });
    }

    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: "Ressource non trouvée." });
    }

    // ✅ FIX : Droits élargis — propriétaire, admin bibliothèque ou superadmin
    const isOwner = resource.createdBy?.toString() === req.user._id.toString();
    const isAdmin = ['admin', 'superadmin'].includes(req.user.role);
    const isLibraryAdmin = req.user.role === 'admin' && req.user.adminType === 'library';

    if (!isOwner && !isAdmin && !isLibraryAdmin) {
      return res.status(403).json({ message: "Accès refusé : vous n'avez pas le droit de supprimer ce document." });
    }

    // ✅ FIX CRITIQUE : Suppression réelle du fichier sur Cloudinary
    // Sans ça, les fichiers s'accumulent sur le cloud et génèrent des coûts
    if (resource.cloudinaryId) {
      try {
        await cloudinary.uploader.destroy(resource.cloudinaryId, { resource_type: 'raw' });
      } catch (cloudinaryError) {
        // On log l'erreur mais on ne bloque pas la suppression en base
        console.error("⚠️ Erreur suppression Cloudinary:", cloudinaryError.message);
      }
    }

    await resource.deleteOne();

    res.status(200).json({ message: "Document supprimé avec succès (base + cloud)." });
  } catch (error) {
    res.status(500).json({ message: "Erreur suppression.", error: error.message });
  }
};