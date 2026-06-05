const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { protect } = require('../../middleware/authMiddleware');

// ─────────────────────────────────────────────
// 📦 CONFIGURATION UPLOADS
// ─────────────────────────────────────────────
const uploadDir = path.join(__dirname, '../../../uploads/voices');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${uniqueName}.m4a`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 15 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = [
            'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 
            'audio/mp4', 'audio/m4a', 'audio/aac', 'audio/webm', 'video/webm'
        ];
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Format audio non supporté.'));
        }
    }
});

// ─────────────────────────────────────────────
// 📥 IMPORTATION DES CONTROLLERS (Un par un pour éviter les erreurs)
// ─────────────────────────────────────────────
const getInbox = require('../../controllers/messageController/getInbox');
const getGroups = require('../../controllers/messageController/getGroups');
const sendMessage = require('../../controllers/messageController/sendMessage');
const sendVoiceMessage = require('../../controllers/messageController/sendVoiceMessage');
const getPrivateHistory = require('../../controllers/messageController/getPrivateHistory');
const getGroupHistory = require('../../controllers/messageController/getGroupHistory');
const deleteMessage = require('../../controllers/messageController/deleteMessage');
const clearConversation = require('../../controllers/messageController/clearConversation');

// ─────────────────────────────────────────────
// 💬 ROUTES DE MESSAGERIE
// ─────────────────────────────────────────────
router.get('/inbox', protect, getInbox);
router.get('/groups', protect, getGroups);
router.get('/history/:partnerId', protect, getPrivateHistory);
router.get('/group/:groupId', protect, getGroupHistory);

router.post('/send', protect, sendMessage);
router.post('/send-voice', protect, upload.single('voice'), sendVoiceMessage);

router.delete('/delete/:messageId', protect, deleteMessage);
router.delete('/clear-conversation', protect, clearConversation);

// ─────────────────────────────────────────────
// 🚨 GESTION ERREURS MULTER
// ─────────────────────────────────────────────
router.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({
            msg: 'Erreur upload fichier.',
            error: err.message
        });
    }
    if (err.message === 'Format audio non supporté.') {
        return res.status(400).json({ msg: err.message });
    }
    next(err);
});

module.exports = router;