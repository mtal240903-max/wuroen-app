const Group = require('../../models/messages_models/Group');

module.exports = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { memberIds } = req.body;
    const userId = req.user._id;

    const group = await Group.findOne({ _id: groupId, admins: userId });
    if (!group) return res.status(403).json({ msg: "Seul un admin peut ajouter des membres." });

    await Group.findByIdAndUpdate(groupId, { $addToSet: { members: { $each: memberIds } } });

    req.app.get('io').to(groupId).emit('members_added', { groupId, memberIds, message: "De nouveaux membres ont rejoint le groupe" });

    res.json({ msg: "Membres ajoutés." });
  } catch (err) {
    res.status(500).json({ msg: "Erreur lors de l'ajout des membres." });
  }
};