const express = require('express');
const router  = express.Router();

const articleController = require('../../controllers/articles/articleController');
const { protect, authorize } = require('../../middleware/authMiddleware');
const { upload } = require('../../config/cloudinary');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');

// ✅ Middleware optionnel : injecte req.user si token présent, continue sinon
const optionalProtect = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (header?.startsWith('Bearer ')) {
      const token = header.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    }
  } catch (e) { /* Token invalide ou absent — on continue sans user */ }
  next();
};

// =====================================================
// 🔵 MODÉRATION
// =====================================================
router.get('/moderation/pending',
  protect,
  authorize('moderator', 'admin', 'superadmin'),
  articleController.getPendingArticles
);

router.put('/moderation/review/:id',
  protect,
  authorize('moderator', 'admin', 'superadmin'),
  articleController.reviewArticle
);

// =====================================================
// 🟢 FLUX DE PUBLICATION
// =====================================================

// 📥 Mes publications (Placée avant /:id pour éviter les conflits de routage)
router.get('/my', protect, articleController.getMyArticles);

// ✅ Création d'article avec log intégré
router.post('/',
  protect,
  upload.single('image'),
  (req, res, next) => {
    console.log("📥 body reçu:", JSON.stringify(req.body));
    console.log("📎 fichier:", req.file ? req.file.originalname : "aucun");
    next();
  },
  articleController.createArticle
);

// 🔍 RECHERCHE & LECTURE
router.get('/search', articleController.searchArticles);
router.get('/',   articleController.getAllArticles);
router.get('/:id', optionalProtect, articleController.getArticleById);

// =====================================================
// 🟣 INTERACTIONS
// =====================================================
router.post('/:id/like',     protect, articleController.likeArticle);
router.post('/:id/comments', protect, articleController.commentArticle);
router.post('/:id/share',            articleController.incrementShare);

// =====================================================
// 🔴 SUPPRESSION
// =====================================================
router.delete('/:id', protect, articleController.deleteArticle);

module.exports = router;