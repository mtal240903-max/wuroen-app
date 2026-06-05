const express = require('express');
const router = express.Router();

// Contrôleurs existants
const libraryController = require('../../controllers/library/libraryController');
const categoryController = require('../../controllers/library/categoryController');

// Middlewares sécurisés
const { protect, authorizeAdminType } = require('../../middleware/authMiddleware');
const handleMulterError = require('../../middleware/libraryMiddleware/multerErrorHandler');

// =====================================================
// 🔍 CONSULTATION
// =====================================================
router.get('/categories/:parentId?', protect, libraryController.getCategoriesByParent);
router.get('/resources/:categoryId', protect, libraryController.getResourcesByCategory);
router.get('/resource/:id',          protect, libraryController.getResourceById);

// =====================================================
// 🗂️ CATÉGORIES — Admins autorisés
// =====================================================
router.get(   '/categories',     protect, authorizeAdminType('library', 'workspace'), categoryController.getCategories);
router.post(  '/categories',     protect, authorizeAdminType('library', 'workspace'), categoryController.createCategory);
router.delete('/categories/:id', protect, authorizeAdminType('library', 'workspace'), categoryController.deleteCategory);

// =====================================================
// 📄 RESSOURCES — Admins autorisés (avec gestionnaire d'upload dédié)
// =====================================================
router.post('/resources', protect, authorizeAdminType('library', 'workspace'), handleMulterError, libraryController.addResource);
router.delete('/resources/:id', protect, authorizeAdminType('library', 'workspace'), libraryController.deleteResource);

module.exports = router;