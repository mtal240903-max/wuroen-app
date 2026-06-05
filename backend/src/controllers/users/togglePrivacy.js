const User = require('../../models/User');

module.exports = async (req, res) => {
  try {
    const { isPrivate } = req.body;

    // ✅ FIX : valeur explicite depuis le body (plus fiable que toggle)
    const newValue = typeof isPrivate === 'boolean' ? isPrivate : undefined;

    let updateQuery;
    if (newValue !== undefined) {
      updateQuery = { $set: { isPrivate: newValue } };
    } else {
      // Toggle si pas de valeur fournie
      const user = await User.findById(req.user._id).select('isPrivate');
      updateQuery = { $set: { isPrivate: !user.isPrivate } };
    }

    const updated = await User.findByIdAndUpdate(req.user._id, updateQuery, { new: true }).select('isPrivate name');
    res.json({ message: `Profil passé en mode ${updated.isPrivate ? 'privé' : 'public'}.`, isPrivate: updated.isPrivate });
  } catch (err) {
    console.error("togglePrivacy:", err.message);
    res.status(500).json({ message: "Impossible de modifier la confidentialité." });
  }
};