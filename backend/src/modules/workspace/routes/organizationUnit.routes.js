const express = require('express');
const { 
  createUnitController, 
  getSubTreeController 
} = require('../controllers/organizationUnit/organizationUnit.controller');

// Importation correcte : on récupère 'protect' depuis le fichier d'authentification
const { protect } = require('../../../middleware/authMiddleware');
const checkPermission = require('../middlewares/checkPermission');

const router = express.Router();

// Utilisation de 'protect' comme middleware d'authentification
router.use(protect);

// Routes sécurisées
router.post('/', checkPermission('department.create'), createUnitController);
router.get('/:id/subtree', checkPermission('department.view'), getSubTreeController);

module.exports = router;