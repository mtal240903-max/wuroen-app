const Collaboration = require('../../models/Collaboration');

module.exports = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { partnerId } = req.params;

        const deleted = await Collaboration.findOneAndDelete({
            $or: [
                { sender: userId, receiver: partnerId },
                { sender: partnerId, receiver: userId }
            ]
        });

        if (!deleted) {
            return res.status(404).json({ msg: "Collaboration non trouvée" });
        }

        return res.json({ msg: "Collaboration terminée" });
    } catch (err) {
        console.error("🔥 Erreur terminateCollaboration :", err.message);
        return next(err);
    }
};
