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

  socket.emit("welcome", "hello welcome")

  socket.emit("player-joined", socket.id)

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(5000, () => console.log('Server running on port 5000'));
