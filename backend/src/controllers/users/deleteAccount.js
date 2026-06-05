const bcrypt        = require('bcryptjs');
const Article       = require('../../models/Article');
const User          = require('../../models/User');
const Collaboration = require('../../models/Collaboration');

module.exports = async (req, res) => {
  try {
    const { password } = req.body;

    // ✅ SÉCURITÉ : vérification du mot de passe avant suppression
    if (!password) {
      return res.status(400).json({ message: "Votre mot de passe est requis pour confirmer la suppression." });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Mot de passe incorrect. Suppression annulée." });

    // ✅ Suppression en cascade
    await Promise.all([
      Article.deleteMany({ author: req.user._id }),
      Collaboration.deleteMany({ $or: [{ sender: req.user._id }, { receiver: req.user._id }] }),
      User.findByIdAndDelete(req.user._id),
    ]);

    res.json({ message: "Votre compte et toutes vos données ont été définitivement supprimés." });
  } catch (err) {
    console.error("deleteAccount:", err.message);
    res.status(500).json({ message: "Erreur lors de la suppression du compte." });
  }
};