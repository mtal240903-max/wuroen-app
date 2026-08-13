const express = require('express');
const router = express.Router();

// Importation du contrôleur de projets, dossiers et fichiers
const {
  createProject,
  getUserProjects,
  getCompanyProjects,
  createFolder,
  getFolderContent,
  createFile
} = require('../controllers/project.controller');

// Importation du middleware d'authentification
const { protect } = require('../../../middleware/roleAuth');

// ─── ROUTES DES PROJETS ───────────────────────────────────────────────────

/**
 * @route   POST /api/projects
 * @desc    Créer un nouveau projet (lié à l'utilisateur ou à une entreprise via { companyId })
 * @access  Private
 */
router.post('/', protect, createProject);

/**
 * @route   GET /api/projects
 * @desc    Lister tous les projets de l'utilisateur connecté (personnels et de ses entreprises)
 * @access  Private
 */
router.get('/', protect, getUserProjects);

/**
 * @route   GET /api/projects/company/:companyId
 * @desc    Lister tous les projets spécifiques à une entreprise donnée
 * @access  Private
 */
router.get('/company/:companyId', protect, getCompanyProjects);


// ─── ROUTES DES DOSSIERS & FICHIERS ───────────────────────────────────────

/**
 * @route   POST /api/projects/:projectId/folders
 * @desc    Créer un dossier (ou sous-dossier) à l'intérieur d'un projet
 * @access  Private
 */
router.post('/:projectId/folders', protect, createFolder);

/**
 * @route   GET /api/projects/:projectId/folders
 * @desc    Lister le contenu d'un projet ou d'un sous-dossier (via query ?parentFolder=ID)
 * @access  Private
 */
router.get('/:projectId/folders', protect, getFolderContent);

/**
 * @route   POST /api/projects/:projectId/files
 * @desc    Enregistrer un fichier dans un projet ou sous-dossier
 * @access  Private
 */
router.post('/:projectId/files', protect, createFile);

module.exports = router;