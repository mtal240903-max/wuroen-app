const mongoose = require('mongoose');
const Article  = require('../models/Article');
const User     = require('../models/User');
const { destroyFile } = require('../config/cloudinary'); // ✅ Nettoyage Cloudinary centralisé

// =====================================================
// 📊 1. STATISTIQUES
// =====================================================
exports.getAdminStats = async (req, res) => {
  try {
    const [totalUsers, publishedArticles, pendingArticles, experts, bannedUsers] = await Promise.all([
      User.countDocuments(),
      Article.countDocuments({ status: 'published' }),
      Article.countDocuments({ status: 'pending' }),
      User.countDocuments({ isVerified: true }),
      User.countDocuments({ isBanned: true })
    ]);

    res.json({ totalUsers, totalArticles: publishedArticles, pendingArticles, experts, bannedUsers });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors du calcul des statistiques" });
  }
};

// =====================================================
// 👥 2. GESTION UTILISATEURS
// =====================================================
exports.getAllUsers = async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip  = (page - 1) * limit;

    // ✅ Recherche optionnelle par nom ou email
    const search = req.query.search?.trim();
    const filter = search
      ? { $or: [
          { name:  { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]}
      : {};

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password -actionLogs')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter)
    ]);

    res.json({ users, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: "Erreur récupération utilisateurs" });
  }
};

// =====================================================
// 🔐 3. CHANGEMENT DE RÔLE
// =====================================================
exports.updateUserRole = async (req, res) => {
  try {
    const { role, adminType } = req.body;
    const validRoles      = ['user', 'moderator', 'admin', 'superadmin'];
    const validAdminTypes = ['content', 'library', 'workspace'];

    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Rôle invalide." });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "ID utilisateur invalide." });
    }

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }

    if (targetUser.role === 'superadmin') {
      return res.status(403).json({ message: "Impossible de modifier le rôle d'un SuperAdmin." });
    }

    if (role === 'superadmin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ message: "Seul un SuperAdmin peut nommer un autre SuperAdmin." });
    }

    if (role === 'admin' && adminType && !validAdminTypes.includes(adminType)) {
      return res.status(400).json({ message: `adminType invalide. Valeurs acceptées : ${validAdminTypes.join(', ')}` });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        role,
        adminType: role === 'admin' ? (adminType || null) : null,
        $push: {
          actionLogs: {
            action:      'ROLE_CHANGE',
            performedBy: req.user._id,
            details:     `Rôle changé en [${role}]${adminType ? ` (type: ${adminType})` : ''}`
          }
        }
      },
      { new: true }
    ).select('-password');

    res.json({ message: "Privilèges mis à jour.", user });
  } catch (error) {
    res.status(500).json({ message: "Erreur mise à jour rôle." });
  }
};

// =====================================================
// 🚫 4. BAN / SUSPENSION
// =====================================================
exports.updateUserStatus = async (req, res) => {
  try {
    const { isBanned, isSuspended, suspensionReason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "ID utilisateur invalide." });
    }

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ message: "Utilisateur introuvable." });

    if (targetUser.role === 'superadmin') {
      return res.status(403).json({ message: "Impossible de modifier le statut d'un SuperAdmin." });
    }

    if (targetUser._id.equals(req.user._id)) {
      return res.status(403).json({ message: "Action impossible sur votre propre compte." });
    }

    const updateData = {
      isBanned:         !!isBanned,
      isSuspended:      isBanned ? false : !!isSuspended,
      suspensionReason: isSuspended && !isBanned ? (suspensionReason || "") : "",
      $push: {
        actionLogs: {
          action:      isBanned ? 'BAN' : isSuspended ? 'SUSPENSION' : 'REACTIVATION',
          performedBy: req.user._id,
          details:     suspensionReason || "Aucun motif fourni"
        }
      }
    };

    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select('-password');
    res.json({ message: "Statut du compte mis à jour.", user });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la modification du statut." });
  }
};

// =====================================================
// 🗑️ 5. SUPPRESSION UTILISATEUR (cascade complète)
// =====================================================
exports.deleteUser = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "ID utilisateur invalide." });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable." });

    if (user._id.equals(req.user._id)) {
      return res.status(400).json({ message: "Action impossible : auto-suppression interdite." });
    }

    if (user.role === 'superadmin') {
      return res.status(403).json({ message: "Impossible de supprimer un compte SuperAdmin." });
    }

    // ✅ Récupérer les articles AVANT suppression pour nettoyer leurs images Cloudinary
    const userArticles = await Article.find(
      { author: req.params.id },
      { cloudinaryId: 1 }
    );

    // ✅ Suppression parallèle des images — Promise.allSettled ne bloque pas sur échec partiel
    const cloudinaryResults = await Promise.allSettled(
      userArticles
        .filter(a => a.cloudinaryId)
        .map(a => destroyFile(a.cloudinaryId, 'image'))
    );

    cloudinaryResults.forEach((result, i) => {
      if (result.status === 'rejected') {
        console.error(`⚠️ Échec image Cloudinary [${userArticles[i]?.cloudinaryId}]:`, result.reason);
      }
    });

    const deletedArticles = await Article.deleteMany({ author: req.params.id });
    await User.findByIdAndDelete(req.params.id);

    res.json({
      message: "Utilisateur supprimé définitivement.",
      cascadeDeleted: {
        articles:      deletedArticles.deletedCount,
        imagesDeleted: cloudinaryResults.filter(r => r.status === 'fulfilled').length,
        imagesFailed:  cloudinaryResults.filter(r => r.status === 'rejected').length,
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la suppression." });
  }
};

// =====================================================
// 📋 6. WORKFLOW DE VALIDATION ARTICLES
// =====================================================
exports.getPendingArticles = async (req, res) => {
  try {
    const pending = await Article.find({ status: 'pending' })
      .populate('author', 'name email specialty')
      .sort({ createdAt: 1 })
      .select('-comments -likes -__v');

    res.json(pending);
  } catch (error) {
    res.status(500).json({ message: "Erreur récupération articles." });
  }
};

exports.assignModerator = async (req, res) => {
  try {
    const { moderatorId } = req.body;

    if (!moderatorId || !mongoose.Types.ObjectId.isValid(moderatorId)) {
      return res.status(400).json({ message: "moderatorId invalide ou manquant." });
    }

    const moderator = await User.findById(moderatorId).select('role name');
    if (!moderator) {
      return res.status(404).json({ message: "Modérateur introuvable." });
    }
    if (!['moderator', 'admin', 'superadmin'].includes(moderator.role)) {
      return res.status(400).json({ message: "Cet utilisateur n'est pas un modérateur." });
    }

    const article = await Article.findByIdAndUpdate(
      req.params.id,
      { assignedModerator: moderatorId, status: 'assigned' },
      { new: true }
    ).populate('assignedModerator', 'name');

    if (!article) return res.status(404).json({ message: "Article introuvable." });
    res.json({ message: "Article assigné.", article });
  } catch (error) {
    res.status(500).json({ message: "Erreur assignation." });
  }
};

exports.approveArticle = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "ID d'article invalide." });
    }

    const article = await Article.findByIdAndUpdate(
      req.params.id,
      {
        status:      'published',
        isPublic:    true,
        publishedAt: new Date(),
        reviewedBy:  req.user._id,
        reviewedAt:  new Date()
      },
      { new: true }
    );

    if (!article) return res.status(404).json({ message: "Article introuvable." });
    res.json({ message: "Article publié avec succès.", article });
  } catch (error) {
    res.status(500).json({ message: "Erreur approbation." });
  }
};

exports.rejectArticle = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "ID d'article invalide." });
    }

    const { reviewComment } = req.body;
    if (!reviewComment?.trim()) {
      return res.status(400).json({ message: "Un motif de rejet est obligatoire." });
    }

    const article = await Article.findByIdAndUpdate(
      req.params.id,
      {
        status:        'rejected',
        isPublic:      false,
        publishedAt:   null,
        reviewComment: reviewComment.trim(),
        reviewedBy:    req.user._id,
        reviewedAt:    new Date()
      },
      { new: true }
    );

    if (!article) return res.status(404).json({ message: "Article introuvable." });
    res.json({ message: "Article rejeté.", article });
  } catch (error) {
    res.status(500).json({ message: "Erreur rejet." });
  }
};

// =====================================================
// 🏅 7. CERTIFICATION EXPERT
// =====================================================
exports.verifyUserExpert = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "ID utilisateur invalide." });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        isVerified: true,
        $push: {
          actionLogs: {
            action:      'EXPERT_CERTIFIED',
            performedBy: req.user._id,
            details:     "Badge Expert activé par un administrateur"
          }
        }
      },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ message: "Utilisateur introuvable." });
    res.json({ message: "Badge expert activé.", user });
  } catch (error) {
    res.status(500).json({ message: "Erreur certification." });
  }
};

// =====================================================
// 🛠️ ALIAS DE COMPATIBILITÉ (routes Moderator)
// =====================================================
exports.getPendingResources = exports.getPendingArticles;
exports.approveResource     = exports.approveArticle;
exports.rejectResource      = exports.rejectArticle;