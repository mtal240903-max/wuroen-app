const socketHandler = (io) => {
  const connectedUsers = new Map();

  io.on('connection', (socket) => {
    console.log(`🔌 Connexion établie : ${socket.id}`);

    socket.on('register_user', (userId) => {
      if (userId) {
        connectedUsers.set(userId.toString(), socket.id);
        socket.join(userId.toString()); // Room privée pour les appels
      }
    });

    // --- LOGIQUE DE GROUPE ---
    socket.on('join_group', (groupId) => {
      socket.join(groupId);
    });

    socket.on('send_group_message', (data) => {
      const { groupId, message } = data;
      socket.to(groupId).emit('new_group_message', message);
    });

    // --- LOGIQUE D'APPEL ---
    socket.on('call_user', (data) => {
      const { targetUserId, roomId, isVideo, senderName } = data;
      socket.to(targetUserId.toString()).emit('incoming_call', { roomId, isVideo, senderName });
    });

    socket.on('accept_call', (data) => {
      const { roomId } = data;
      socket.join(roomId);
      socket.to(roomId).emit('call_accepted', { roomId });
    });

    socket.on('terminate_call', (data) => {
      const { roomId } = data;
      io.to(roomId).emit('call_terminated', { roomId });
      io.in(roomId).socketsLeave(roomId);
    });

    socket.on('disconnect', () => {
      console.log('🔴 Utilisateur déconnecté :', socket.id);
    });
  });
};

module.exports = socketHandler;