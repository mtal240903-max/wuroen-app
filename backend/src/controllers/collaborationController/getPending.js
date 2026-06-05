const Collaboration = require('../../models/Collaboration');

module.exports = async (req, res, next) => {
    try {
        const requests = await Collaboration.find({ 
            receiver: req.user._id, 
            status: 'pending' 
        })
        .populate('sender', 'name specialty avatar')
        .sort({ createdAt: -1 });

        return res.json(requests);
    } catch (err) {
        console.error("🔥 Erreur getPending :", err.message);
        return next(err);
    }
};