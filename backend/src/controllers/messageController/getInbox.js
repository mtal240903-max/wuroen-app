const mongoose      = require('mongoose');
const Message       = require('../../models/messages_models/Message');
const Collaboration = require('../../models/Collaboration');
const User          = require('../../models/User');

module.exports = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);

    // 1. Collaborateurs actifs
    const collabs = await Collaboration.find({
      status: 'accepted',
      $or: [{ sender: userId }, { receiver: userId }]
    });

    if (collabs.length === 0) return res.json([]);

    const partnerIds = collabs.map(c =>
      c.sender.toString() === userId.toString()
        ? new mongoose.Types.ObjectId(c.receiver)
        : new mongoose.Types.ObjectId(c.sender)
    );

    // 2. Dernier message par paire (agrégation — évite N+1)
    const lastMsgs = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: userId,   receiver: { $in: partnerIds } },
            { receiver: userId, sender:   { $in: partnerIds } }
          ],
          $and: [
            { $or: [{ groupId: null }, { groupId: { $exists: false } }] },
            { hiddenFor: { $not: { $elemMatch: { $eq: userId } } } }
          ]
        }
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            $cond: [
              { $lt: ['$sender', '$receiver'] },
              { a: '$sender', b: '$receiver' },
              { a: '$receiver', b: '$sender' }
            ]
          },
          lastContent: { $first: '$content' },
          lastDate:    { $first: '$createdAt' },
          lastSender:  { $first: '$sender' }
        }
      }
    ]);

    // 3. Non-lus par partenaire (agrégation)
    const unreadAgg = await Message.aggregate([
      {
        $match: {
          receiver: userId,
          isRead:   false,
          sender:   { $in: partnerIds },
          $or: [{ groupId: null }, { groupId: { $exists: false } }]
        }
      },
      { $group: { _id: '$sender', count: { $sum: 1 } } }
    ]);
    const unreadMap = {};
    unreadAgg.forEach(u => { unreadMap[u._id.toString()] = u.count; });

    // 4. Profils partenaires
    const partners = await User.find({ _id: { $in: partnerIds } })
      .select('name specialty avatar role isVerified');
    const partnerMap = {};
    partners.forEach(p => { partnerMap[p._id.toString()] = p; });

    // 5. Map lastMsg par partnerId
    const lastMsgMap = {};
    lastMsgs.forEach(lm => {
      const a = lm._id.a.toString();
      const b = lm._id.b.toString();
      const partnerId = a === userId.toString() ? b : a;
      lastMsgMap[partnerId] = { content: lm.lastContent, date: lm.lastDate };
    });

    // 6. Construire les conversations
    const conversations = collabs
      .map(collab => {
        const partnerId = collab.sender.toString() === userId.toString()
          ? collab.receiver.toString()
          : collab.sender.toString();
        const contact  = partnerMap[partnerId];
        const lastMsg  = lastMsgMap[partnerId];
        return {
          contact,
          lastMessage: lastMsg?.content || null,
          date:        lastMsg?.date    || collab.createdAt,
          unreadCount: unreadMap[partnerId] || 0,
          isGroup:     false,
          isMuted:     collab.isMuted || false,
        };
      })
      .filter(c => c.contact)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    return res.json(conversations);
  } catch (err) {
    console.error("❌ getInbox:", err.message);
    return res.status(500).json({ msg: "Erreur lors de la récupération de l'inbox." });
  }
};