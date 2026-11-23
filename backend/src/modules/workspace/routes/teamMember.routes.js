const express = require('express');
const router = express.Router();
const { 
  inviteMember, 
  respondToInvitation, 
  getPendingInvitations 
} = require('../controllers/teamMember.controller');

const { protect } = require('../../../middleware/roleAuth');
const checkRole = require('../../../middleware/checkRole');

router.get('/invitations/pending', protect, getPendingInvitations);
router.post('/:workspaceId/invite', protect, checkRole(['Owner', 'Admin']), inviteMember);
router.put('/:workspaceId/invitations/respond', protect, respondToInvitation);

module.exports = router;