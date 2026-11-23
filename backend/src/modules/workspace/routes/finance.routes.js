const express = require('express');
const router = express.Router();
const financeController = require('../controllers/finance/financeController'); // Ajustez le chemin

router.post('/:workspaceId/calculer-finance', financeController.calculerFinance);

app.use('/api/workspaces', router);