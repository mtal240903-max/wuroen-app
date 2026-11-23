const connectedUsers = new Map();

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Connexion établie : ${socket.id}`);

    // --- ENREGISTREMENT ---
    socket.on('register_user', (userId) => {
      if (userId) {
        connectedUsers.set(userId.toString(), socket.id);
        console.log(`👤 Utilisateur ${userId} enregistré.`);
      }
    });

    // --- GESTION DES GROUPES (Nouveau) ---
    socket.on('join_group', (groupId) => {
      socket.join(groupId);
      console.log(`👤 Socket ${socket.id} a rejoint le groupe ${groupId}`);
    });

    socket.on('send_group_message', (data) => {
      const { groupId, message } = data;
      socket.to(groupId).emit('new_group_message', message);
    });

    // --- APPELS (Privés ET Groupes) ---
    socket.on('emit_call', (data) => {
      const { roomId, isVideo, targetId, callerName, isGroup } = data;
      socket.join(roomId);

      if (isGroup) {
        // Pour les groupes, on notifie tout le groupe via le channel du groupe
        socket.to(targetId).emit('receive_call', { roomId, isVideo, callerName, isGroup: true });
        console.log(`📞 Appel GROUPE de ${callerName} vers groupe ${targetId} via ${roomId}`);
      } else {
        // Appel privé classique
        const recipientSocketId = connectedUsers.get(targetId?.toString());
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('receive_call', { roomId, isVideo, callerName, isGroup: false });
          console.log(`📞 Appel PRIVÉ de ${callerName} vers ${targetId}`);
        }
      }
    });

    socket.on('accept_call', (data) => {
      const { roomId } = data;
      socket.join(roomId);
      io.to(roomId).emit('call_accepted', { roomId });
      console.log(`🟢 Appel accepté dans la room : ${roomId}`);
    });

    socket.on('terminate_call', (data) => {
      const { roomId } = data;
      console.log(`🔴 Fin de l'appel room : ${roomId}`);
      io.to(roomId).emit('call_terminated', { roomId });
      
      // Nettoyage : On quitte la room
      io.in(roomId).socketsLeave(roomId);
    });

    // --- DÉCONNEXION ---
    socket.on('disconnect', () => {
      for (let [userId, socketId] of connectedUsers.entries()) {
        if (socketId === socket.id) {
          connectedUsers.delete(userId);
          console.log(`❌ Utilisateur ${userId} déconnecté.`);
          break;
        }
      }
    });
  });
};