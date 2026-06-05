const Collaboration = require('../../models/Collaboration');

module.exports = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const collab = await Collaboration.findOne({
            $or: [
                { sender: userId, receiver: req.params.otherUserId },
                { sender: req.params.otherUserId, receiver: userId }
            ]
        });

        if (!collab) {
            return res.json({ status: 'none' });
        }

        return res.json({ 
            status: collab.status, 
            collabId: collab._id,
            isSender: collab.sender.toString() === userId.toString() 
        });
    } catch (err) {
        console.error("🔥 Erreur getStatus :", err.message);
        return next(err);
    }
};