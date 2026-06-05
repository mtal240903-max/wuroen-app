const toggleLikeArticle = require('../../controllers/articles/toggleLikeArticle');

// 🟣 INTERACTIONS
router.post('/:id/like', protect, toggleLikeArticle);