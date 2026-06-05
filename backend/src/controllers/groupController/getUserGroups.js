const Group = require('../../models/messages_models/Group');
const Message = require('../../models/messages_models/Message');

module.exports = async (req, res) => {
    try {
        const userId = req.user._id;

        const userGroups = await Group.find({ members: userId })
            .populate('members', 'name specialty')
            .sort({ updatedAt: -1 });

        const formattedGroups = await Promise.all(userGroups.map(async (group) => {
            const lastMsg = await Message.findOne({ 
                groupId: group._id, 
                hiddenFor: { $ne: userId } 
            })
            .sort({ createdAt: -1 })
            .populate('sender', 'name');

            const isMuted = group.mutedBy ? group.mutedBy.includes(userId.toString()) : false;

            return {
                _id: group._id,
                name: group.name,
                description: group.description,
                isGroup: true,
                isMuted: isMuted,
                unreadCount: 0, 
                date: lastMsg ? lastMsg.createdAt : group.updatedAt,
                lastMessage: lastMsg ? `${lastMsg.sender?.name || 'Membre'}: ${lastMsg.content}` : "Discussion de groupe...", 
            };
        }));

        return res.json(formattedGroups);
    } catch (err) {
        console.error("❌ Erreur getUserGroups :", err);
        return res.status(500).json({ msg: "Erreur lors de la récupération des groupes." });
    }
};