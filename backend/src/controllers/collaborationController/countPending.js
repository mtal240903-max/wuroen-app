const Collaboration = require('../../models/Collaboration');

module.exports = async (req, res, next) => {
    try {
        const count = await Collaboration.countDocuments({ 
            receiver: req.user._id, 
            status: 'pending' 
        });
        return res.json({ count });
    } catch (err) {
        console.error("🔥 Erreur countPending :", err.message);
        return next(err);
    }
};