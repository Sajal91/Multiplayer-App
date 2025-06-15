const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*', // Set this to your frontend origin in production
  },
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Create a room
  socket.on('create-room', ({roomId, username}) => {
    socket.join(roomId);
    io.to(roomId).emit('system-message', `Room created. Share this code: ${roomId}`);
    console.log(`Room created: ${roomId} by ${username}`);
  });

  // Join a room
  socket.on('join-room', (roomId, username, callback) => {
    const room = io.sockets.adapter.rooms.get(roomId);
    if (room) {
      socket.join(roomId);
      callback({ success: true });
      io.to(roomId).emit('system-message', `${username} joined the room.`);
      console.log(`${username} joined room ${roomId}`);
    } else {
      callback({ success: false, error: 'Room not found' });
    }
  });

  // Chat message
  socket.on('send-message', ({ roomId, message, sender }) => {
    io.to(roomId).emit('receive-message', { message, sender, timestamp: Date.now() });
  });

  socket.on('send-audio', ({ roomId, audioBlob, sender }) => {
    io.to(roomId).emit('receive-audio', { audioBlob, sender: sender, timestamp: Date.now() });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(5000, () => console.log('Server running on port 5000'));
