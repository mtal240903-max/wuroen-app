const User = require('../models/User');
const Article = require('../models/Article');
const Tool = require('../models/outils_models/Tool');

// =====================================================
// 📊 1. STATISTIQUES GLOBALES
// =====================================================
exports.getAdminStats = async (req, res) => {
  try {
    const [userCount, articleCount, moderatorCount, bannedCount] = await Promise.all([
      User.countDocuments(),
      Article.countDocuments(),
      User.countDocuments({ role: 'moderator' }),
      User.countDocuments({ isBanned: true })
    ]);

    res.json({ userCount, articleCount, moderatorCount, bannedCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =====================================================
// 👥 2. LISTER TOUS LES UTILISATEURS
// =====================================================
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des utilisateurs.", error: error.message });
  }
};

// =====================================================
// 🔐 3. CHANGEMENT DE RÔLE (Sécurisé)
// =====================================================
exports.updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role, adminType } = req.body;

  const validRoles = ['user', 'moderator', 'admin', 'superadmin'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ message: `Rôle invalide. Valeurs acceptées : ${validRoles.join(', ')}` });
  }

  try {
    const targetUser = await User.findById(id);
    if (!targetUser) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }

    if (targetUser.role === 'superadmin' && req.user._id.toString() !== id) {
      return res.status(403).json({ message: "Impossible de modifier le rôle d'un autre SuperAdmin." });
    }

    if (req.user._id.toString() === id && role !== 'superadmin') {
      return res.status(403).json({ message: "Vous ne pouvez pas rétrograder votre propre compte SuperAdmin." });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        role,
        adminType: role === 'admin' ? (adminType || null) : null
      },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ message: "Rôle mis à jour avec succès.", user: updatedUser });
  } catch (error) {
    res.status(400).json({ message: "Erreur lors du changement de rôle", error: error.message });
  }
};

// =====================================================
// 🚫 4. STATUT (BAN / SUSPENSION)
// =====================================================
exports.updateUserStatus = async (req, res) => {
  const { id } = req.params;
  const { isBanned, isSuspended, suspensionReason } = req.body;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }

    if (user.role === 'superadmin') {
      return res.status(403).json({ message: "Impossible de modifier le statut d'un SuperAdmin." });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(403).json({ message: "Action impossible sur votre propre compte." });
    }

    if (isBanned !== undefined) user.isBanned = isBanned;
    if (isSuspended !== undefined) {
      user.isSuspended = isSuspended;
      user.suspensionReason = isSuspended ? (suspensionReason || "Non spécifié") : "";
    }

    await user.save();

    res.json({
      message: "Statut mis à jour avec succès",
      user: {
        _id: user._id,
        name: user.name,
        role: user.role,
        isBanned: user.isBanned,
        isSuspended: user.isSuspended,
        suspensionReason: user.suspensionReason,
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Action échouée", error: error.message });
  }
};

// =====================================================
// 🗑️ 5. SUPPRESSION D'UTILISATEUR
// =====================================================
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }

    if (user.role === 'superadmin') {
      return res.status(403).json({ message: "Impossible de supprimer un compte SuperAdmin." });
    }

    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Utilisateur supprimé avec succès." });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la suppression", error: error.message });
  }
};

// =====================================================
// 📝 6. GESTION DES ARTICLES
// =====================================================
exports.getPendingArticles = async (req, res) => {
  try {
    const articles = await Article.find({ status: 'pending' });
    res.status(200).json(articles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.assignModerator = async (req, res) => {
  try {
    res.status(200).json({ message: "Modérateur assigné avec succès." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.verifyUserExpert = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isExpert: true }, { new: true });
    res.status(200).json({ message: "Utilisateur vérifié expert", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =====================================================
// 🛠️ 7. GESTION DES OUTILS & APPLICATIONS
// =====================================================

// @desc    Récupérer tous les outils
// @route   GET /api/tools
// @access  Private
exports.getTools = async (req, res) => {
  try {
    const tools = await Tool.find().sort({ createdAt: -1 });
    res.status(200).json(tools);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Ajouter un nouvel outil
// @route   POST /api/tools
// @access  Private/SuperAdmin
exports.createTool = async (req, res) => {
  try {
    const { name, description, category, status, logo, actionType, actionUrl } = req.body;

    const newTool = await Tool.create({
      name,
      description,
      category,
      status,
      logo,
      actionType,
      actionUrl,
    });

    res.status(201).json(newTool);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Mettre à jour un outil
// @route   PUT /api/tools/:id
// @access  Private/SuperAdmin
exports.updateTool = async (req, res) => {
  try {
    const updatedTool = await Tool.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedTool) {
      return res.status(404).json({ success: false, message: "Outil introuvable." });
    }

    res.status(200).json(updatedTool);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Supprimer un outil
// @route   DELETE /api/tools/:id
// @access  Private/SuperAdmin
exports.deleteTool = async (req, res) => {
  try {
    const tool = await Tool.findByIdAndDelete(req.params.id);

    if (!tool) {
      return res.status(404).json({ success: false, message: "Outil introuvable." });
    }

    res.status(200).json({ success: true, message: "Outil supprimé avec succès." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};