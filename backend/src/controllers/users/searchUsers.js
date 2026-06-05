const User = require('../../models/User');

const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ message: "Requête trop courte (min 2 caractères)." });
    }
    const users = await User.find({
      name: { $regex: q.trim(), $options: 'i' },
      _id:  { $ne: req.user._id }
    })
    .select('name specialty avatar _id')
    .limit(10);
    
    res.json(users);
  } catch (error) {
    console.error("🔥 Erreur searchUsers :", error.message);
    res.status(500).json({ message: "Erreur recherche." });
  }
};

module.exports = searchUsers;