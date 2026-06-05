const express    = require('express');
const router     = express.Router();
const mongoose   = require('mongoose');
const { protect } = require('../../middleware/authMiddleware');

const countPending         = require('../../controllers/collaborationController/countPending');
const getPending           = require('../../controllers/collaborationController/getPending');
const sendRequest          = require('../../controllers/collaborationController/sendRequest');
const respondRequest       = require('../../controllers/collaborationController/respondRequest');
const terminateCollaboration = require('../../controllers/collaborationController/terminateCollaboration');
const getStatus            = require('../../controllers/collaborationController/getStatus');

// ✅ SÉCURITÉ : toutes les routes collaboration exigent d'être connecté
router.use(protect);

// ✅ Validation ObjectId — middleware réutilisable
const validateId = (paramName) => (req, res, next) => {
  const id = req.params[paramName];
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: `ID invalide : ${paramName}` });
  }
  next();
};

// ─── ROUTES ─────────────────────────────────────────────────
router.get('/count',                              countPending);
router.get('/pending',                            getPending);
router.post('/request',                           sendRequest);
router.put('/respond/:collabId', validateId('collabId'), respondRequest);
router.delete('/terminate/:partnerId', validateId('partnerId'), terminateCollaboration);
router.get('/status/:otherUserId',  validateId('otherUserId'),  getStatus);

module.exports = router;