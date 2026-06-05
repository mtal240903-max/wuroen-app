const User = require('../../models/User');

module.exports = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, specialty, birthDate, location, phone, bio } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ message: "Le nom complet est requis (2 caractères minimum)." });
    }

    // ✅ Limite bio à 200 chars (cohérent avec User.js)
    const trimmedBio = bio ? bio.trim().slice(0, 200) : '';

    // ✅ FIX : findByIdAndUpdate sans runValidators (évite le bug adminType null)
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { name: name.trim(), specialty: specialty?.trim(), birthDate, location: location?.trim(), phone: phone?.trim(), bio: trimmedBio } },
      { new: true }
    ).select('-password -actionLogs');

    if (!updatedUser) return res.status(404).json({ message: "Utilisateur introuvable." });

    res.status(200).json({ status: "success", message: "Profil mis à jour.", user: updatedUser });
  } catch (err) {
    console.error("updateProfile:", err.message);
    res.status(500).json({ message: "Erreur lors de la mise à jour du profil." });
  }
};