// src/modules/workspace/routes/company.routes.js
const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');

// Configuration Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../../../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'company-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // Limite à 5Mo
});

const { protect } = require('../../../middleware/authMiddleware');
const companyController = require('../controllers/company');

// Toutes les routes nécessitent d'être authentifié
router.use(protect);

// Routes de liste et création (⚠️ Remise de upload.single('bgImage') pour capturer l'image si elle existe, tout en gérant le JSON)
router.get('/', companyController.getCompanies);
router.post('/', upload.single('bgImage'), companyController.createCompany); 
router.get('/:id', companyController.getCompanyById);

// Routes de gestion
router.patch('/:id', upload.single('bgImage'), companyController.updateCompany);

// Routes Staff
router.route('/:id/staff')
  .post(companyController.addCompanyStaff);

router.delete('/:id/staff/:staffId', companyController.removeCompanyStaff);

// Audit
router.get('/:id/audit', companyController.getCompanyAuditLogs);

module.exports = router;