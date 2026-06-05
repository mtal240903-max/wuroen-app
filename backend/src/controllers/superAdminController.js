const User = require('../models/User');
const Article = require('../models/Article');

// =====================================================
// 📊 1. STATISTIQUES GLOBALES
// =====================================================
exports.getGlobalStats = async (req, res) => {
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
// 🔐 2. CHANGEMENT DE RÔLE (Sécurisé)
// =====================================================
exports.updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role, adminType } = req.body;

  // ✅ Validation des rôles autorisés
  const validRoles = ['user', 'moderator', 'admin', 'superadmin'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ message: `Rôle invalide. Valeurs acceptées : ${validRoles.join(', ')}` });
  }

  try {
    const targetUser = await User.findById(id);
    if (!targetUser) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }

    // ✅ SÉCURITÉ : Empêcher la modification d'un autre SuperAdmin
    if (targetUser.role === 'superadmin' && req.user._id.toString() !== id) {
      return res.status(403).json({ message: "Impossible de modifier le rôle d'un autre SuperAdmin." });
    }

    // ✅ SÉCURITÉ : Empêcher l'auto-rétrogradation du SuperAdmin
    if (req.user._id.toString() === id && role !== 'superadmin') {
      return res.status(403).json({ message: "Vous ne pouvez pas rétrograder votre propre compte SuperAdmin." });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        role,
        // adminType n'est valide que pour les admins
        adminType: role === 'admin' ? (adminType || null) : null
      },
      { new: true, runValidators: true }
    ).select('-password');

    // 📝 Audit log
    await User.findByIdAndUpdate(id, {
      $push: {
        actionLogs: {
          action: 'ROLE_CHANGE',
          performedBy: req.user._id,
          details: `Rôle changé en [${role}]${adminType ? ` (type: ${adminType})` : ''}`,
        }
      }
    });

    res.json({ message: "Rôle mis à jour avec succès.", user: updatedUser });
  } catch (error) {
    res.status(400).json({ message: "Erreur lors du changement de rôle", error: error.message });
  }
};

// =====================================================
// 🚫 3. BAN / SUSPENSION (Sécurisé)
// =====================================================
exports.toggleUserStatus = async (req, res) => {
  const { id } = req.params;
  const { type, reason } = req.body; // 'ban' ou 'suspend' + motif obligatoire

  // ✅ Validation du type d'action
  if (!['ban', 'suspend'].includes(type)) {
    return res.status(400).json({ message: "Type invalide. Utilisez 'ban' ou 'suspend'." });
  }

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }

    // ✅ SÉCURITÉ : Impossible de bannir un SuperAdmin
    if (user.role === 'superadmin') {
      return res.status(403).json({ message: "Impossible de bannir ou suspendre un SuperAdmin." });
    }

    // ✅ SÉCURITÉ : Auto-bannissement interdit
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(403).json({ message: "Action impossible sur votre propre compte." });
    }

    let actionLabel = '';

    if (type === 'ban') {
      user.isBanned = !user.isBanned;
      // Si on bannit, on force aussi la levée de suspension
      if (user.isBanned) {
        user.isSuspended = false;
        user.suspensionReason = "";
      }
      actionLabel = user.isBanned ? 'BAN' : 'UNBAN';
    } else {
      user.isSuspended = !user.isSuspended;
      user.suspensionReason = user.isSuspended ? (reason || "Non spécifié") : "";
      actionLabel = user.isSuspended ? 'SUSPENSION' : 'UNSUSPENSION';
    }

    // 📝 Audit log
    user.actionLogs.push({
      action: actionLabel,
      performedBy: req.user._id,
      details: reason || "Aucun motif fourni",
    });

    await user.save();

    res.json({
      message: `Statut mis à jour : ${actionLabel}`,
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