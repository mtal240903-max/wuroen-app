const mongoose = require('mongoose');
const Group = require('../../models/messages_models/Group');

module.exports = async (req, res) => {
    try {
        const { groupId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(groupId)) {
            return res.status(404).json({ msg: "Groupe introuvable." });
        }

        const group = await Group.findOne({ _id: groupId, members: req.user._id })
            .populate('members admins creator', 'name specialty email');
            
        if (!group) {
            return res.status(404).json({ msg: "Groupe introuvable." });
        }

        return res.json(group);
    } catch (err) { 
        console.error("❌ Erreur getGroupDetails :", err);
        return res.status(500).json({ msg: "Erreur lors du chargement des détails." }); 
    }
};