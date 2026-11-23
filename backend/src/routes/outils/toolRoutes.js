const express = require('express');
const router = express.Router();
const { getTools, createTool, updateTool, deleteTool } = require('../../controllers/outils/toolController');
const { protect, superAdmin } = require('../../middleware/authMiddleware');

router.route('/')
  .get(protect, getTools)
  .post(protect, superAdmin, createTool);

router.route('/:id')
  .put(protect, superAdmin, updateTool)
  .delete(protect, superAdmin, deleteTool);

module.exports = router;