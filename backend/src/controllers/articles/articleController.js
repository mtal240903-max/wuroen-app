const mongoose = require('mongoose');
const Article = require('../../models/Article');
const { destroyFile } = require('../../config/cloudinary'); // ✅ Helper centralisé

// =====================================================
// 🟢 1. CRÉER UN ARTICLE
// =====================================================
const createArticle = async (req, res) => {
  try {
    const { title, intro, methodo, results, category, references, coAuthors } = req.body;

    // ✅ Validation des champs obligatoires
    if (!title?.trim() || !intro?.trim() || !category) {
      return res.status(400).json({ message: "Champs obligatoires manquants : title, intro, category." });
    }

    // Parsing sécurisé des références
    let parsedReferences = [];
    if (references) {
      try {
        parsedReferences = typeof references === "string" ? JSON.parse(references) : references;
        if (!Array.isArray(parsedReferences)) parsedReferences = [];
      } catch {
        parsedReferences = references.split("\n").map(r => r.trim()).filter(Boolean);
      }
    }

    // Parsing sécurisé des co-auteurs
    let parsedCoAuthors = [];
    if (coAuthors) {
      try {
        parsedCoAuthors = typeof coAuthors === "string" ? JSON.parse(coAuthors) : coAuthors;
        if (!Array.isArray(parsedCoAuthors)) parsedCoAuthors = [];
      } catch {
        parsedCoAuthors = [];
      }
    }

    const newArticle = new Article({
      title:      title.trim(),
      intro:      intro.trim(),
      methodo:    methodo?.trim() || "",
      results:    results?.trim() || "",
      category,
      references: parsedReferences,
      coAuthors:  parsedCoAuthors,
      status:     'pending',                          // ✅ FIX : 'En attente' → 'pending'
      author:     req.user._id,
      image:      req.file ? req.file.path : "",
      cloudinaryId: req.file ? req.file.filename : "", // ✅ Stocke l'ID pour suppression future
    });

    await newArticle.save();
    res.status(201).json({ message: "Article soumis aux modérateurs.", article: newArticle });
  } catch (error) {
    // ✅ Si save() échoue après l'upload de l'image, on nettoie Cloudinary
    if (req.file?.filename) {
      await destroyFile(req.file.filename, 'image');
    }
    res.status(500).json({ message: error.message });
  }
};

// =====================================================
// 🟢 2. FIL PUBLIC — Articles publiés + pagination
// =====================================================
const getAllArticles = async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 10);
    const skip  = (page - 1) * limit;

    // ✅ Filtre optionnel par catégorie
    const filter = { status: 'published' }; // ✅ FIX : 'Publié' → 'published'
    if (req.query.category && mongoose.Types.ObjectId.isValid(req.query.category)) {
      filter.category = req.query.category;
    }

    const [articles, total] = await Promise.all([
      Article.find(filter)
        .populate("author", "name specialty")        // ✅ FIX : 'firstName lastName' → 'name'
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-comments -__v'),                   // ✅ Les commentaires sont lourds, chargés à la demande
      Article.countDocuments(filter)
    ]);

    res.json({ articles, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("getAllArticles:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// =====================================================
// 🟢 3. DÉTAIL D'UN ARTICLE + INCRÉMENT VUE
// =====================================================
const getArticleById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "ID d'article invalide." });
    }

    const article = await Article.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    )
    .populate("author", "name specialty")            // ✅ FIX : 'firstName lastName' → 'name'
    .populate({ path: "comments.user", select: "name" }); // ✅ FIX : idem

    if (!article) return res.status(404).json({ message: "Article introuvable." });

    // Seuls les articles publiés sont visibles au public
    // Les modérateurs/admins peuvent voir tous les statuts
    const role = req.user?.role;
    const isPrivileged = ['moderator', 'admin', 'superadmin'].includes(role);
    if (article.status !== 'published' && !isPrivileged) {
      return res.status(403).json({ message: "Cet article n'est pas encore publié." });
    }

    res.json(article);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =====================================================
// 🔵 4. MODÉRATEUR — FILE D'ATTENTE
// =====================================================
const getPendingArticles = async (req, res) => {
  try {
    const pending = await Article.find({ status: 'pending' }) // ✅ FIX : 'En attente' → 'pending'
      .populate("author", "name email specialty")             // ✅ FIX : 'firstName lastName' → 'name'
      .sort({ createdAt: 1 })                                 // ✅ FIFO : les plus anciens d'abord
      .select('-comments -likes -__v');                       // ✅ Inutile pour la modération

    res.json(pending);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur." });
  }
};

// =====================================================
// 🔵 5. MODÉRATEUR — VALIDATION / REJET
// =====================================================
const reviewArticle = async (req, res) => {
  try {
    const { action, comment } = req.body;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: "Action invalide. Utilisez 'approve' ou 'reject'." });
    }

    // ✅ Un motif est obligatoire pour le rejet
    if (action === 'reject' && (!comment || !comment.trim())) {
      return res.status(400).json({ message: "Un motif de rejet est obligatoire." });
    }

    const isApproved = action === 'approve';

    // ✅ FIX : 'Publié'/'Rejeté' → 'published'/'rejected'
    const updateFields = {
      status:        isApproved ? 'published' : 'rejected',
      isPublic:      isApproved,
      reviewComment: comment?.trim() || "",
      reviewedBy:    req.user._id,
      reviewedAt:    new Date(),
    };

    const updateQuery = isApproved
      ? { $set: { ...updateFields, publishedAt: new Date() } }
      : { $set: { ...updateFields, publishedAt: null } }; // ✅ null plutôt que $unset (plus propre)

    const article = await Article.findByIdAndUpdate(req.params.id, updateQuery, { new: true });

    if (!article) return res.status(404).json({ message: "Article introuvable." });

    res.json({
      message: `Article ${isApproved ? 'publié' : 'rejeté'} avec succès.`,
      article
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =====================================================
// 🟣 6. INTERACTIONS
// =====================================================

const likeArticle = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "ID d'article invalide." });
    }

    const userId  = req.user._id;
    const article = await Article.findById(req.params.id).select('likes status');

    if (!article) return res.status(404).json({ message: "Article introuvable." });

    // ✅ On ne like que les articles publiés
    if (article.status !== 'published') {
      return res.status(403).json({ message: "Impossible de liker un article non publié." });
    }

    const hasLiked = article.likes.some(id => id.equals(userId)); // ✅ .equals() plus fiable qu'includes()

    const updatedArticle = await Article.findByIdAndUpdate(
      req.params.id,
      hasLiked ? { $pull: { likes: userId } } : { $addToSet: { likes: userId } },
      { new: true, select: 'likes' }
    );

    res.json({ liked: !hasLiked, likesCount: updatedArticle.likes.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const commentArticle = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text?.trim()) {
      return res.status(400).json({ message: "Le commentaire ne peut pas être vide." });
    }

    // ✅ Limite la longueur côté controller aussi (double sécurité avec le schéma)
    if (text.trim().length > 2000) {
      return res.status(400).json({ message: "Le commentaire ne peut pas dépasser 2000 caractères." });
    }

    // ✅ FIX : req.user.name au lieu de firstName + lastName (cohérent avec User.js)
    const newComment = {
      user:      req.user._id,
      userName:  req.user.name || 'Utilisateur',
      text:      text.trim(),
    };

    const updatedArticle = await Article.findByIdAndUpdate(
      req.params.id,
      { $push: { comments: newComment } },
      { new: true }
    ).populate({ path: "comments.user", select: "name" }); // ✅ FIX : 'firstName lastName' → 'name'

    if (!updatedArticle) return res.status(404).json({ message: "Article introuvable." });

    // ✅ Renvoie seulement les commentaires (pas tout l'article)
    res.status(201).json(updatedArticle.comments);
  } catch (error) {
    console.error("🔥 Erreur Commentaire:", error);
    res.status(500).json({ message: "Erreur lors de l'ajout du commentaire." });
  }
};

const incrementShare = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "ID d'article invalide." });
    }

    const article = await Article.findByIdAndUpdate(
      req.params.id,
      { $inc: { shareCount: 1 } },
      { new: true, select: 'shareCount' }
    );

    if (!article) return res.status(404).json({ message: "Article introuvable." });
    res.json({ shareCount: article.shareCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =====================================================
// 🔴 7. SUPPRESSION (Auteur ou Admin)
// =====================================================
const deleteArticle = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "ID d'article invalide." });
    }

    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: "Article introuvable." });

    const isAdmin  = ['admin', 'superadmin'].includes(req.user.role);
    const isAuthor = article.author.equals(req.user._id); // ✅ .equals() au lieu de .toString() ===

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ message: "Accès refusé." });
    }

    // ✅ FIX : Suppression de l'image Cloudinary avant de supprimer l'article
    if (article.cloudinaryId) {
      await destroyFile(article.cloudinaryId, 'image');
    }

    await article.deleteOne();
    res.json({ message: "Article supprimé avec succès." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =====================================================
// 🔍 8. MES ARTICLES (Tableau de bord auteur)
// =====================================================
const getMyArticles = async (req, res) => {
  try {
    // Récupère uniquement les articles dont l'auteur est l'utilisateur connecté
    const articles = await Article.find({ author: req.user._id })
      .sort({ createdAt: -1 })
      .select('-comments -__v'); // Exclut les commentaires pour optimiser le transfert

    res.json(articles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// =====================================================
// 🔍 RECHERCHE ARTICLES
// =====================================================
const searchArticles = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ message: "Requête trop courte (min 2 caractères)." });
    }

    const articles = await Article.find({
      status: 'published',
      $or: [
        { title:    { $regex: q.trim(), $options: 'i' } },
        { intro:    { $regex: q.trim(), $options: 'i' } },
        { category: { $regex: q.trim(), $options: 'i' } },
      ]
    })
    .populate('author', 'name specialty')
    .select('title intro category image imageUrl author createdAt likes views')
    .sort({ createdAt: -1 })
    .limit(20);

    res.json(articles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createArticle,
  getAllArticles,
  getArticleById,
  getPendingArticles,
  reviewArticle,
  likeArticle,
  commentArticle,
  incrementShare,
  deleteArticle,
  getMyArticles,
  searchArticles,
};