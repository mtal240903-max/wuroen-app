const User      = require('../../models/User');
const { cloudinary } = require('../../config/cloudinary');

const uploadAvatar = async (req, res) => {
  try {
    // ✅ FIX : req.user._id au lieu de req.user.id
    const userId = req.user._id;

    if (!req.file) {
      return res.status(400).json({ message: "Aucun fichier reçu." });
    }

    // ✅ L'avatar est uploadé sur Cloudinary via Multer (req.file.path = URL Cloudinary)
    const avatarUrl      = req.file.path;      // URL publique Cloudinary
    const cloudinaryId   = req.file.filename;  // public_id pour suppression future

    // ✅ Supprimer l'ancien avatar Cloudinary si il existe
    const oldUser = await User.findById(userId).select('avatarCloudinaryId');
    if (oldUser?.avatarCloudinaryId) {
      try {
        await cloudinary.uploader.destroy(oldUser.avatarCloudinaryId, { resource_type: 'image' });
      } catch (e) {
        console.warn("⚠️ Suppression ancien avatar Cloudinary:", e.message);
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { avatar: avatarUrl, avatarCloudinaryId: cloudinaryId } },
      { new: true }
    ).select('-password -actionLogs');

    if (!updatedUser) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }

    res.status(200).json({
      status:  "success",
      message: "Photo de profil mise à jour.",
      avatar:  avatarUrl,
      user:    updatedUser
    });
  } catch (err) {
    console.error("uploadAvatar:", err.message);
    res.status(500).json({ message: "Erreur lors de l'enregistrement de l'avatar." });
  }
};

module.exports = uploadAvatar;