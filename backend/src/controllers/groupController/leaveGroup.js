const Group = require('../../models/messages_models/Group');
const Message = require('../../models/messages_models/Message');
const mongoose = require('mongoose');

module.exports = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ msg: "ID groupe invalide." });
    }

    const group = await Group.findOne({ _id: groupId, members: userId });
    if (!group) return res.status(404).json({ msg: "Groupe introuvable." });

    await Group.findByIdAndUpdate(groupId, { $pull: { members: userId, admins: userId } });

    req.app.get('io').to(groupId).emit('member_left', { groupId, userId, message: `${req.user.name} a quitté le groupe` });

    const updated = await Group.findById(groupId);
    if (updated && updated.members.length === 0) {
      await Group.findByIdAndDelete(groupId);
      await Message.deleteMany({ groupId });
    }

    res.json({ msg: "Vous avez quitté le groupe." });
  } catch (err) {
    res.status(500).json({ msg: "Erreur lors de la sortie du groupe." });
  }
};