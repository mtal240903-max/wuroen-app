const express = require('express');
const router  = express.Router();
const categoryController = require('../../controllers/library/categoryController');
const libraryController  = require('../../controllers/library/libraryController');
const { protect, authorize, authorizeAdminType } = require('../../middleware/authMiddleware');
const { uploadLibrary } = require('../../config/cloudinary');
const multer = require('multer');

// =====================================================
// 🔍 CONSULTATION — Accès authentifié
// =====================================================

// Sous-catégories d'un parent
router.get('/categories/:parentId', protect, libraryController.getCategoriesByParent);

// Documents d'une catégorie
router.get('/resources/:categoryId', protect, libraryController.getResourcesByCategory);

// Détail d'un document
router.get('/resource/:id', protect, libraryController.getResourceById);

// =====================================================
// 🗂️ GESTION CATÉGORIES — SuperAdmin uniquement
// =====================================================

// Toutes les catégories (dashboard)
router.get('/categories', protect, authorize('admin', 'superadmin'), categoryController.getCategories);

// Créer une catégorie
router.post('/categories', protect, authorize('admin', 'superadmin'), categoryController.createCategory);

// Supprimer une catégorie
router.delete('/categories/:id', protect, authorize('admin', 'superadmin'), categoryController.deleteCategory);

// =====================================================
// 📄 GESTION RESSOURCES — Admin bibliothèque ou SuperAdmin
// =====================================================

// ✅ FIX : authorize() au lieu de authorizeAdminType() mal configuré
// SuperAdmin + admin peuvent ajouter des documents
router.post(
  '/resources',
  protect,
  authorize('admin', 'superadmin'),
  (req, res, next) => {
    uploadLibrary.single('file')(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: "Erreur upload : " + err.message });
      } else if (err) {
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  },
  libraryController.addResource
);

// Supprimer un document
router.delete(
  '/resources/:id',
  protect,
  authorize('admin', 'superadmin'),
  libraryController.deleteResource
);

module.exports = router;