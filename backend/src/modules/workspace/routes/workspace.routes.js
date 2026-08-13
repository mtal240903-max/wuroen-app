const express = require('express');
const router = express.Router();
const { 
    createWorkspace, 
    getMyWorkspaces 
} = require('../controllers/workspace.controller');
const { protect } = require('../../../middleware/roleAuth');

// Routes principales des workspaces (GET pour lister, POST pour créer)
router.route('/')
    .get(protect, getMyWorkspaces)
    .post(protect, createWorkspace);

// Route alternative si vous préférez garder un chemin spécifique pour la liste
router.get('/my-spaces', protect, getMyWorkspaces);

module.exports = router;