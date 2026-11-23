const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/authMiddleware');

// Import avec déstructuration {}
const { createCommunity } = require('../../controllers/communityController/createCommunity');
const { getCommunityDetails } = require('../../controllers/communityController/getCommunityDetails');
const { joinCommunity } = require('../../controllers/communityController/joinCommunity');
const { addCommunityGroup } = require('../../controllers/communityController/addCommunityGroup');

router.use(protect);

router.post('/', createCommunity);
router.get('/:id', getCommunityDetails);
router.post('/:id/join', joinCommunity);
router.post('/:id/groups', addCommunityGroup);

module.exports = router;