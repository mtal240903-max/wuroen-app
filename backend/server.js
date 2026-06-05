const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') }); 

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose'); 
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const connectDB = require('./src/config/db');
const Article = require('./src/models/Article');
const socketHandler = require('./src/socket/socketHandler');

// --- Import des routes ---
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/user/userRoutes');
const messageRoutes = require('./src/routes/chat/messageRoutes');
const groupRoutes = require('./src/routes/chat/groupRoutes'); 
const collaborationRoutes = require('./src/routes/relations/collaborationRoutes');
const articleRoutes = require('./src/routes/articles/articleRoutes');
const libraryRoutes = require('./src/routes/library/libraryRoutes');
const categoryRoutes = require('./src/routes/library/categoryRoutes');
const superAdminRoutes = require('./src/routes/admin/superAdminRoutes');
const adminRoutes = require('./src/routes/admin/adminRoutes');
const moderatorRoutes = require('./src/routes/admin/moderatorRoutes');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Middleware de sécurité
if (!process.env.JWT_SECRET) {
    console.error("FATAL ERROR: JWT_SECRET is not defined.");
    process.exit(1);
}

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, max: 500 }));
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
    setHeaders: (res) => {
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    }
}));

// Initialisation Socket.io
const io = new Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });
app.set('io', io);
socketHandler(io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/collaborations', collaborationRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/library/categories', categoryRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/superadmin', superAdminRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/moderator', moderatorRoutes);

app.get('/', (req, res) => res.json({ status: "online", message: "Wuro'en API 🚀" }));

// Gestion des erreurs
// --- Gestion des erreurs ---
app.use((err, req, res, next) => {
    // 1. Logue l'erreur complète dans la console serveur pour toi (le développeur)
    console.error("DEBUG ERROR:", err); 

    // 2. Renvoie une réponse générique et sécurisée au client
    const statusCode = err.status || 500;
    const message = process.env.NODE_ENV === 'production' 
        ? "Une erreur interne est survenue. Veuillez réessayer plus tard." 
        : err.message; // Affiche le message réel seulement si tu es en développement

    res.status(statusCode).json({
        success: false,
        message: message
    });
});

// Démarrage
const start = async () => {
    try {
        await connectDB();
        await Article.updateMany({ status: 'En attente' }, { $set: { status: 'pending' } });
        
        server.listen(PORT, '0.0.0.0', () => {
            console.log('--------------------------------------------------');
            console.log(`🚀 Wuro'en API est opérationnelle sur le port ${PORT}`);
            console.log('--------------------------------------------------');
        });
    } catch (err) {
        console.error("Erreur au démarrage du serveur :", err);
        process.exit(1);
    }
};
start();