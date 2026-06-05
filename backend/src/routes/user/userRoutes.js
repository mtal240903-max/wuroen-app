const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { protect } = require('../../middleware/authMiddleware');
const User = require('../../models/User');

// ✅ FIX : Cloudinary au lieu du disque local
const { upload } = require('../../config/cloudinary'); 

// =====================================================
// 📦 IMPORTATION DES CONTRÔLEURS INDIVIDUELS (USERS)
// =====================================================
const getMyProfile         = require('../../controllers/users/getMyProfile');
const updateProfile        = require('../../controllers/users/updateProfile'); 
const uploadAvatar         = require('../../controllers/users/uploadAvatar');  
const togglePrivacy        = require('../../controllers/users/togglePrivacy');
const changePassword       = require('../../controllers/users/changePassword');
const deleteAccount        = require('../../controllers/users/deleteAccount');
const searchUsers          = require('../../controllers/users/searchUsers');
const getPublicProfile     = require('../../controllers/users/getPublicProfile');
const requestCollaboration = require('../../controllers/users/requestCollaboration');
const respondCollaboration = require('../../controllers/users/respondCollaboration');

// =====================================================
// 📦 IMPORTATION DES CONTRÔLEURS INDIVIDUELS (NOTIFICATIONS)
// =====================================================
const getNotifications     = require('../../controllers/notifications/getNotifications');
const markAsRead           = require('../../controllers/notifications/markAsRead');

// =====================================================
// 🛡️ MIDDLEWARE DE SÉCURITÉ INFRASTRUCTURALE
// =====================================================
// Évite les injections et les crashs serveur si l'ID passé dans l'URL est invalide
const validateObjectId = (req, res, next) => {
  if (req.params.id && !mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Format de l'identifiant invalide." });
  }
  next();
};

// =====================================================
// 🔒 1. PARAMÈTRES & COMPTE PERSONNEL (PROTÉGÉS)
// =====================================================
router.get('/me/profile', protect, getMyProfile);
router.put('/me/profile', protect, updateProfile); 
router.post('/upload-avatar', protect, upload.single('avatar'), uploadAvatar); 
router.patch('/privacy', protect, togglePrivacy);
router.post('/change-password', protect, changePassword);
router.delete('/delete-account', protect, deleteAccount);

// =====================================================
// 🔍 2. RECHERCHE GLOBALE (Placé en haut pour éviter les conflits d'URLs)
// =====================================================
router.get('/search', protect, searchUsers);

// =====================================================
// 🔔 3. FLUX DE NOTIFICATIONS (PROTÉGÉS)
// =====================================================
router.get('/notifications', protect, getNotifications);
router.put('/notifications/:id/read', protect, validateObjectId, markAsRead);

// =====================================================
// 🤝 4. RÉSEAU & COLLABORATIONS (PROTÉGÉS)
// =====================================================
router.post('/follow/:id', protect, validateObjectId, requestCollaboration);
router.post('/respond-request', protect, respondCollaboration);

// =====================================================
// 🌐 5. LISTE PUBLIQUE MEMBRES (pour ExpertList dans HomeScreen)
// =====================================================
router.get('/', protect, async (req, res) => {
  try {
    // Exclusion stricte des membres bannis ou suspendus pour préserver la sécurité de la plateforme
    const queryFilter = {
      isBanned: { $ne: true },
      isSuspended: { $ne: true }
    };

    const total = await User.countDocuments(queryFilter);
    const users = await User.find(queryFilter)
      .select('name email role avatar specialty')
      .lean(); // .lean() améliore grandement les performances en lecture seule

    res.json({
      users,
      total
    });

  } catch (err) {
    console.error('❌ Error fetching members:', err.message);
    res.status(500).json({
      message: "Erreur lors de la récupération des membres."
    });
  }
});

// =====================================================
// 🔓 6. PROFIL PUBLIC HYBRIDE (TOUJOURS EN DERNIÈRE POSITION)
// =====================================================
// Soumis au validateur pour intercepter immédiatement les requêtes malveillantes ou erronées
router.get('/:id', validateObjectId, getPublicProfile);

module.exports = router;