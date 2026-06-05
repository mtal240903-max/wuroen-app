const jwt     = require('jsonwebtoken');
const Article = require('../../models/Article');
const User    = require('../../models/User');

const getPublicProfile = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const user = await User.findById(targetUserId).select('-password -collaborationRequests');
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable." });

    let visitor = null;
    if (req.headers.authorization?.startsWith('Bearer')) {
      const token = req.headers.authorization.split(' ')[1];
      if (token && process.env.JWT_SECRET) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          const visitorId = decoded.id || decoded._id;
          visitor = await User.findById(visitorId);
        } catch (jwtError) {
          return res.status(401).json({ message: "Session expirée. Veuillez vous reconnecter." });
        }
      }
    }

    if (user.isPrivate) {
      if (!visitor) {
        return res.status(200).json({
          isPrivate: true,
          isAccessible: false,
          _id: user._id,
          name: user.name,
          avatar: user.avatar,
          specialty: user.specialty,
          institution: user.institution
        });
      }

      const isOwnProfile = visitor._id.toString() === user._id.toString();
      const isAdmin      = ['admin', 'superadmin'].includes(visitor.role);
      const isFollowing  = user.followers?.some(fId => fId.toString() === visitor._id.toString()) || false;

      if (!isOwnProfile && !isAdmin && !isFollowing) {
        return res.status(200).json({
          isPrivate: true,
          isAccessible: false,
          _id: user._id,
          name: user.name,
          avatar: user.avatar,
          specialty: user.specialty,
          institution: user.institution,
          followersCount: user.followers?.length || 0,
          followingCount: user.following?.length || 0
        });
      }
    }

    const articles = await Article.find({ author: targetUserId, status: 'published' });
    
    res.json({
      ...user._doc,
      isPrivate: user.isPrivate || false,
      isAccessible: true,
      articlesCount: articles.length,
      totalLikes:    articles.reduce((acc, art) => acc + (art.likes?.length || 0), 0),
      totalViews:    articles.reduce((acc, art) => acc + (art.views || 0), 0),
    });

  } catch (error) {
    console.error("🔥 Erreur getPublicProfile :", error.message);
    res.status(500).json({ message: "Erreur récupération profil utilisateur." });
  }
};

module.exports = getPublicProfile;