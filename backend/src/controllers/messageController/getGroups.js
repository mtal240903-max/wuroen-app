const Message = require('../../models/messages_models/Message');
const Group = require('../../models/messages_models/Group'); 

module.exports = async (req, res) => {
    try {
        const groups = await Group.find({ members: req.user._id }).sort({ updatedAt: -1 });
        
        const formattedGroups = await Promise.all(groups.map(async (g) => {
            const lastMsg = await Message.findOne({ groupId: g._id, hiddenFor: { $ne: req.user._id } })
                .sort({ createdAt: -1 })
                .populate('sender', 'name');

            return {
                contact: { _id: g._id, name: g.name, isOnline: false },
                isGroup: true,
                lastMessage: lastMsg ? `${lastMsg.sender?.name || "Ex-membre"}: ${lastMsg.content}` : (g.description || "Nouveau groupe"),
                date: lastMsg ? lastMsg.createdAt : g.updatedAt,
                unreadCount: 0, 
                isMuted: false
            };
        }));
        return res.json(formattedGroups);
    } catch (err) { 
        return res.status(500).json({ msg: "Erreur lors de la récupération des groupes." }); 
    }
};