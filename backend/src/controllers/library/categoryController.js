const Category = require('../../models/library/Category'); 
const Resource = require('../../models/library/Resource'); 
const mongoose = require('mongoose');

// =====================================================
// 🟢 1. CRÉER UNE CATÉGORIE (HIÉRARCHIE N1 À N5)
// =====================================================
exports.createCategory = async (req, res) => {
  try {
    let { name, parent, level } = req.body;

    // Nettoyage strict de l'ID parent
    let parentId = (parent === 'null' || parent === '' || !parent || parent === 'undefined' || parent === 'root') ? null : parent;

    // Validation du format ObjectId
    if (parentId && !mongoose.Types.ObjectId.isValid(parentId)) {
      return res.status(400).json({ message: "Format de l'ID parent invalide." });
    }

    const currentLevel = parseInt(level);

    // Validation hiérarchique
    if (currentLevel === 1) {
      if (parentId) return res.status(400).json({ message: "Le niveau 1 ne peut pas avoir de parent." });
    } else {
      if (!parentId) return res.status(400).json({ message: `Le niveau ${currentLevel} requiert un parent.` });

      const parentCategory = await Category.findById(parentId);
      if (!parentCategory) return res.status(404).json({ message: "Parent introuvable." });

      if (parentCategory.level !== currentLevel - 1) {
        return res.status(400).json({ message: `Le parent (Niv. ${parentCategory.level}) est incompatible avec le niveau ${currentLevel}.` });
      }
    }

    const newCategory = new Category({
      name: name.trim(),
      parent: parentId, 
      level: currentLevel,
      createdBy: req.user._id || req.user.id
    });

    await newCategory.save();
    res.status(201).json(newCategory);

  } catch (error) {
    res.status(500).json({ message: "Erreur serveur : " + error.message });
  }
};

// =====================================================
// 🟢 2. RÉCUPÉRER LES ENFANTS PAR PARENT (Navigation)
// =====================================================
exports.getCategoriesByParent = async (req, res) => {
  try {
    const { parentId } = req.params;

    const filter = (parentId === 'null' || parentId === 'root' || !parentId || parentId === 'undefined') 
      ? { level: 1 } 
      : { parent: parentId };

    const categories = await Category.find(filter)
      .sort({ name: 1 })
      .populate('parent', 'name');

    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =====================================================
// 🟢 3. RÉCUPÉRER TOUTES LES CATÉGORIES (Dashboard)
// =====================================================
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find()
      .populate('parent', 'name')
      .sort({ level: 1, name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =====================================================
// 🟢 4. SUPPRIMER UNE CATÉGORIE (Version sécurisée)
// =====================================================
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Vérifier les sous-catégories
    const hasChildren = await Category.findOne({ parent: id });
    if (hasChildren) {
      return res.status(400).json({ 
        message: "Impossible : ce dossier contient des sous-catégories." 
      });
    }

    // 2. Vérifier les fichiers (Ressources)
    const hasFiles = await Resource.findOne({ category: id });
    if (hasFiles) {
      return res.status(400).json({ 
        message: "Impossible : ce dossier contient encore des documents." 
      });
    }

    const deleted = await Category.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Catégorie introuvable." });

    res.json({ message: "Catégorie supprimée avec succès" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};