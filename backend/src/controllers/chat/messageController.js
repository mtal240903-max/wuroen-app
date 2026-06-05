const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Message = require('../../models/Message');
const Collaboration = require('../../models/Collaboration');
const { protect } = require('../../middleware/authMiddleware');

// ─────────────────────────────────────────────────────────────
// 1. RÉCUPÉRER L'INBOX (Optimisée avec agrégation pour les non-lus)
// ─────────────────────────────────────────────────────────────
router.get('/inbox', protect, async (req, res) => {
    try {
        const userId = req.user._id;

        // Récupération des collaborations avec leur état mute
        const collabs = await Collaboration.find({
            $or: [{ sender: userId }, { receiver: userId }],
            status: 'accepted',
            isArchived: { $ne: true }
        });

        // Mapping des mute/archive
        const collabMap = {};
        collabs.forEach(c => {
            const partnerId = c.sender.toString() === userId.toString() ? c.receiver.toString() : c.sender.toString();
            collabMap[partnerId] = { isMuted: c.isMuted || false };
        });

        const partnerIds = Object.keys(collabMap);

        // Récupération des derniers messages
        const messages = await Message.find({
            $or: [
                { sender: userId, receiver: { $in: partnerIds } },
                { receiver: userId, sender: { $in: partnerIds } }
            ],
            hiddenFor: { $ne: userId }
        })
        .sort({ createdAt: -1 })
        .populate('sender receiver', 'name specialty');

        const conversations = [];
        const viewedUsers = new Set();

        for (const msg of messages) {
            const contact = msg.sender._id.toString() === userId.toString() ? msg.receiver : msg.sender;
            if (!contact || viewedUsers.has(contact._id.toString())) continue;

            viewedUsers.add(contact._id.toString());

            // Compteur dynamique
            const unreadCount = await Message.countDocuments({
                sender: contact._id,
                receiver: userId,
                isRead: false
            });

            conversations.push({
                contact,
                lastMessage: msg.content,
                date: msg.createdAt,
                unreadCount, // <--- C'est cette valeur qui sera utilisée par votre FlatList
                isMuted: collabMap[contact._id.toString()]?.isMuted || false
            });
        }
        res.json(conversations);
    } catch (err) {
        res.status(500).json({ msg: "Erreur Inbox." });
    }
});

// ─────────────────────────────────────────────────────────────
// 2. RÉCUPÉRER LES ARCHIVES
// ─────────────────────────────────────────────────────────────
router.get('/conversations/archived', protect, async (req, res) => {
    try {
        const userId = req.user._id;

        const archivedCollabs = await Collaboration.find({
            $or: [
                { sender: userId, status: 'accepted', isArchived: true },
                { receiver: userId, status: 'accepted', isArchived: true }
            ]
        }).populate('sender receiver', 'name specialty');

        const formattedArchives = await Promise.all(archivedCollabs.map(async (collab) => {
            if (!collab.sender || !collab.receiver) return null;

            const contact = collab.sender._id.toString() === userId.toString() ? collab.receiver : collab.sender;
            
            const lastMsg = await Message.findOne({
                $or: [
                    { sender: userId, receiver: contact._id },
                    { receiver: userId, sender: contact._id }
                ]
            }).sort({ createdAt: -1 });

            return {
                contact,
                lastMessage: lastMsg ? lastMsg.content : "Discussion archivée",
                date: lastMsg ? lastMsg.createdAt : collab.updatedAt,
                isMuted: collab.isMuted || false
            };
        }));

        res.json(formattedArchives.filter(Boolean));
    } catch (err) {
        res.status(500).json({ msg: "Erreur lors de la récupération des archives." });
    }
});

// ─────────────────────────────────────────────────────────────
// 3. ACTIONS (Archive / Unarchive / Mute)
// ─────────────────────────────────────────────────────────────
router.put('/conversations/:contactId/archive', protect, async (req, res) => {
    try {
        await Collaboration.findOneAndUpdate(
            { $or: [{ sender: req.user._id, receiver: req.params.contactId }, { sender: req.params.contactId, receiver: req.user._id }] },
            { $set: { isArchived: true } }
        );
        res.json({ msg: "Discussion archivée avec succès." });
    } catch (err) { res.status(500).json({ msg: "Erreur lors de l'archivage." }); }
});

router.put('/conversations/:contactId/unarchive', protect, async (req, res) => {
    try {
        await Collaboration.findOneAndUpdate(
            { $or: [{ sender: req.user._id, receiver: req.params.contactId }, { sender: req.params.contactId, receiver: req.user._id }] },
            { $set: { isArchived: false } }
        );
        res.json({ msg: "Discussion restaurée." });
    } catch (err) { res.status(500).json({ msg: "Erreur lors du désarchivage." }); }
});

router.put('/conversations/:contactId/mute', protect, async (req, res) => {
    try {
        const { mute } = req.body;
        const updated = await Collaboration.findOneAndUpdate(
            { $or: [{ sender: req.user._id, receiver: req.params.contactId }, { sender: req.params.contactId, receiver: req.user._id }] },
            { $set: { isMuted: mute } },
            { new: true }
        );
        res.json({ isMuted: updated.isMuted });
    } catch (err) { res.status(500).json({ msg: "Erreur paramètre silencieux." }); }
});

// ─────────────────────────────────────────────────────────────
// 4. HISTORIQUE & ENVOI (Mise à jour avec émission Socket améliorée)
// ─────────────────────────────────────────────────────────────
router.post('/send', protect, async (req, res) => {
    try {
        const { receiverId, content } = req.body;
        const userId = req.user._id;

        const newMessage = new Message({ 
            sender: userId, 
            receiver: receiverId, 
            content: content.trim(), 
            isRead: false 
        });
        
        await newMessage.save();

        const populatedMsg = await Message.findById(newMessage._id).populate('sender', 'name specialty');

        // Notification temps réel
        const io = req.app.get('io');
        if (io) {
            // On envoie le message ET une instruction pour incrémenter le badge
            io.to(receiverId.toString()).emit('new_private_message', {
                message: populatedMsg,
                shouldIncrementBadge: true // Indique au client de faire +1
            });
        }

        res.status(201).json(populatedMsg);
    } catch (err) { 
        res.status(500).json({ msg: "Erreur envoi." }); 
    }
});

// Route d'historique (Placée à la fin pour éviter les conflits d'URL)
router.get('/:otherUserId', protect, async (req, res) => {
    try {
        const userId = req.user._id;
        const { otherUserId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(otherUserId)) {
            return res.status(400).json({ msg: "ID partenaire invalide." });
        }

        // ✅ BONUS UX : Marquer automatiquement les messages reçus de ce partenaire comme lus
        await Message.updateMany(
            { sender: otherUserId, receiver: userId, isRead: false },
            { $set: { isRead: true } }
        );

        const chatHistory = await Message.find({
            $or: [{ sender: userId, receiver: otherUserId }, { sender: otherUserId, receiver: userId }],
            hiddenFor: { $ne: userId }
        })
        .sort({ createdAt: 1 })
        .populate('sender', 'name specialty'); // ✅ Cohérence de peuplement avec la route /send

        res.json(chatHistory);
    } catch (err) { 
        res.status(500).json({ msg: "Erreur lors du chargement de l'historique." }); 
    }
});

module.exports = router;