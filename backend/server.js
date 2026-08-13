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
const communityRoutes = require('./src/routes/chat/communityRoutes');
const collaborationRoutes = require('./src/routes/relations/collaborationRoutes');
const articleRoutes = require('./src/routes/articles/articleRoutes');
const libraryRoutes = require('./src/routes/library/libraryRoutes');
const categoryRoutes = require('./src/routes/library/categoryRoutes');
const superAdminRoutes = require('./src/routes/admin/superAdminRoutes');
const adminRoutes = require('./src/routes/admin/adminRoutes');
const moderatorRoutes = require('./src/routes/admin/moderatorRoutes');

// --- Import des routes pour la vitrine Outils ---
const toolRoutes = require('./src/routes/outils/toolRoutes');

// --- Import Modules Workspace & TeamMembers séparés ---
const workspaceRoutes = require('./src/modules/workspace/routes/workspace.routes');
const teamMemberRoutes = require('./src/modules/workspace/routes/teamMember.routes');
const projectRoutes = require('./src/modules/workspace/routes/project.routes');
const companyRoutes = require('./src/modules/workspace/routes/company.routes');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Configuration Sécurité & Middlewares
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, max: 500 }));
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Initialisation Socket.io
const io = new Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });
app.set('io', io);
socketHandler(io);

// --- Enregistrement des routes ---
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/communities', communityRoutes);
app.use('/api/collaborations', collaborationRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/library/categories', categoryRoutes);
app.use('/api/superadmin', superAdminRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/moderator', moderatorRoutes);

// --- Enregistrement de la route Outils ---
app.use('/api/tools', toolRoutes);

// --- Routes Workspaces & TeamMembers séparées ---
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/workspaces', teamMemberRoutes);
app.use('/api/projects', projectRoutes);

// --- Enregistrement de la route Companies ---
app.use('/api/companies', companyRoutes);

app.get('/', (req, res) => res.json({ status: "online", message: "Wuro'en & PA API 🚀" }));

// Gestion erreurs
app.use((err, req, res, next) => {
    console.error("DEBUG ERROR:", err); 
    res.status(err.status || 500).json({ success: false, message: err.message });
});

// Démarrage serveur
const start = async () => {
    try {
        await connectDB();
        server.listen(PORT, '0.0.0.0', () => console.log(`🚀 Wuro'en & PA API opérationnelle sur le port ${PORT}`));
    } catch (err) {
        console.error("Erreur au démarrage :", err);
        process.exit(1);
    }
};

start();