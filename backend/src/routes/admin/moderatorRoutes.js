const express  = require('express');
const router   = express.Router();
const mongoose = require('mongoose');
const { protect, authorize } = require('../../middleware/authMiddleware');
const adminCtrl = require('../../controllers/adminController');
const Article   = require('../../models/Article');

router.use(protect);
router.use(authorize('moderator', 'admin', 'superadmin'));

// =====================================================
// 📋 ARTICLES ASSIGNÉS AU MODÉRATEUR CONNECTÉ
// ✅ SÉCURITÉ : Un modérateur ne voit QUE ses propres assignations
// =====================================================
router.get('/my-assignments', async (req, res) => {
  try {
    const articles = await Article.find({
      assignedModerator: req.user._id,
      status: 'assigned'
    })
    .populate('author', 'name email specialty')
    .sort({ createdAt: 1 })
    .select('-comments -likes -__v');

    res.json(articles);
  } catch (err) {
    res.status(500).json({ message: "Erreur récupération assignations." });
  }
});

// =====================================================
// ✅ VALIDER UN ARTICLE (uniquement si assigné à soi)
// =====================================================
router.patch('/approve/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "ID invalide." });
    }

    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: "Article introuvable." });

    // ✅ SÉCURITÉ STRICTE : le modérateur ne peut approuver
    // que l'article qui lui est assigné — pas n'importe lequel
    const isSuperAdmin = req.user.role === 'superadmin';
    const isAssigned   = article.assignedModerator?.equals(req.user._id);

    if (!isSuperAdmin && !isAssigned) {
      return res.status(403).json({
        message: "Accès refusé : cet article ne vous est pas assigné."
      });
    }

    const updated = await Article.findByIdAndUpdate(
      req.params.id,
      {
        status:      'published',
        isPublic:    true,
        publishedAt: new Date(),
        reviewedBy:  req.user._id,
        reviewedAt:  new Date(),
        reviewComment: req.body.comment?.trim() || ""
      },
      { new: true }
    );

    res.json({ message: "Article publié avec succès.", article: updated });
  } catch (err) {
    res.status(500).json({ message: "Erreur approbation." });
  }
});

// =====================================================
// ❌ REJETER UN ARTICLE (uniquement si assigné à soi)
// =====================================================
router.patch('/reject/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "ID invalide." });
    }

    const { comment } = req.body;
    if (!comment?.trim()) {
      return res.status(400).json({ message: "Un motif de rejet est obligatoire." });
    }

    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: "Article introuvable." });

    const isSuperAdmin = req.user.role === 'superadmin';
    const isAssigned   = article.assignedModerator?.equals(req.user._id);

    if (!isSuperAdmin && !isAssigned) {
      return res.status(403).json({
        message: "Accès refusé : cet article ne vous est pas assigné."
      });
    }

    const updated = await Article.findByIdAndUpdate(
      req.params.id,
      {
        status:        'rejected',
        isPublic:      false,
        publishedAt:   null,
        reviewComment: comment.trim(),
        reviewedBy:    req.user._id,
        reviewedAt:    new Date()
      },
      { new: true }
    );

    res.json({ message: "Article rejeté.", article: updated });
  } catch (err) {
    res.status(500).json({ message: "Erreur rejet." });
  }
});

module.exports = router;