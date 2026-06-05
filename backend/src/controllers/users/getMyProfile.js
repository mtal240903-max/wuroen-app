const Article = require('../../models/Article');
const User    = require('../../models/User');

const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('collaborationRequests.from', 'name specialty avatar')
      .select('-password');
      
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    const articles = await Article.find({ author: req.user._id });
    
    res.json({
      ...user._doc,
      isPrivate: user.isPrivate || false,
      stats: {
        articlesCount:        articles.length,
        totalLikes:           articles.reduce((acc, art) => acc + (art.likes?.length || 0), 0),
        totalViews:           articles.reduce((acc, art) => acc + (art.views || 0), 0),
        followersCount:       user.followers?.length || 0,
        followingCount:       user.following?.length || 0,
        pendingRequestsCount: user.collaborationRequests?.filter(r => r.status === 'pending').length || 0
      }
    });
  } catch (error) {
    console.error("🔥 Erreur getMyProfile :", error.message);
    res.status(500).json({ message: "Erreur récupération profil." });
  }
};

module.exports = getMyProfile;