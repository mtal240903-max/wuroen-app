const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/authMiddleware');

// Import des contrôleurs
const getUserGroups = require('../../controllers/groupController/getUserGroups');
const createGroup = require('../../controllers/groupController/createGroup');
const toggleMuteGroup = require('../../controllers/groupController/toggleMuteGroup');
const getGroupHistory = require('../../controllers/groupController/getGroupHistory');
const getGroupDetails = require('../../controllers/groupController/getGroupDetails');
const leaveGroup = require('../../controllers/groupController/leaveGroup');
const addMembers = require('../../controllers/groupController/addMembers');

// Import du service pour le comptage
const { getUnreadCountForUser } = require('../../services/messageService');
// Ajoutez cette ligne dans groupRoutes.js
const getCollaborators = require('../../controllers/users/getCollaborators');

router.use(protect);

// Route pour récupérer le total des messages non lus (utilisée par AuthContext)
router.get('/unread-count', async (req, res) => {
    try {
        const count = await getUnreadCountForUser(req.user._id);
        res.json({ count });
    } catch (error) {
        res.status(500).json({ count: 0 });
    }
});

router.get('/', getUserGroups);
router.post('/create', createGroup);
router.put('/:groupId/mute', toggleMuteGroup);
router.get('/:groupId/messages', getGroupHistory);
router.get('/:groupId', getGroupDetails);
router.delete('/:groupId/leave', leaveGroup);
router.post('/:groupId/members', addMembers);
// Mettez cette route avant les routes dynamiques pour éviter le conflit
router.get('/collaborators', getCollaborators);


module.exports = router;