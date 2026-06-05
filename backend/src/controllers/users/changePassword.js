const bcrypt = require('bcryptjs');
const User   = require('../../models/User');

module.exports = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "Tous les champs sont obligatoires." });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Les nouveaux mots de passe ne correspondent pas." });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ message: "Le nouveau mot de passe doit contenir au moins 8 caractères." });
    }
    if (newPassword === currentPassword) {
      return res.status(400).json({ message: "Le nouveau mot de passe doit être différent de l'ancien." });
    }

    // ✅ Récupérer avec password (select: false dans le schéma)
    const user = await User.findById(req.user._id).select('+password');
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé." });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Mot de passe actuel incorrect." });

    // ✅ FIX : mise à jour directe sans save() pour éviter le hook pre-save
    const salt = await bcrypt.genSalt(12);
    const hashed = await bcrypt.hash(newPassword, salt);
    await User.findByIdAndUpdate(req.user._id, { $set: { password: hashed } });

    res.json({ message: "Mot de passe modifié avec succès." });
  } catch (err) {
    console.error("changePassword:", err.message);
    res.status(500).json({ message: "Erreur lors de la modification du mot de passe." });
  }
};