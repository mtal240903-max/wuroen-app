const Collaboration = require('../../models/Collaboration');

module.exports = async (req, res, next) => {
    try {
        const { status } = req.body; 
        const { collabId } = req.params;

        if (!['accepted', 'rejected'].includes(status)) {
            return res.status(400).json({ msg: "Statut invalide" });
        }

        const collab = await Collaboration.findById(collabId);

        if (!collab) return res.status(404).json({ msg: "Collaboration introuvable" });

        if (collab.receiver.toString() !== req.user._id.toString()) {
            return res.status(403).json({ msg: "Action non autorisée" });
        }

        collab.status = status;
        await collab.save();

        return res.json({ msg: `Collaboration ${status}`, collab });
    } catch (err) {
        console.error("🔥 Erreur respondRequest :", err.message);
        return next(err);
    }
};