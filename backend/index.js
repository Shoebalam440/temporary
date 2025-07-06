const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors({
  origin: [
    'https://fiveminor.netlify.app',
    'https://temporary-sbhe.onrender.com',
    'http://localhost:5173' // <-- Added for local development
  ],
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json());

// In-memory message store, now organized by room
let messagesByRoom = {};

// Create HTTP server and Socket.IO server
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      'https://fiveminor.netlify.app',
      'https://temporary-sbhe.onrender.com',
      'http://localhost:5173' // <-- Added for local development
    ],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
    socket.emit('allMessages', messagesByRoom[roomId] || []);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// POST /upload - Accepts a fileUrl in the request body
app.post('/upload', (req, res) => {
  const { username, text, roomId, fileUrl } = req.body;

  if (!username || !roomId || (typeof text === 'string' && !text.trim() && !fileUrl)) {
    return res.status(400).json({
      error: 'Validation failed on server.',
      details: 'The server requires a username, a roomId, and either a non-empty text message or a fileUrl.',
      received: {
        username: username || 'MISSING',
        roomId: roomId || 'MISSING',
        text: text === undefined ? 'MISSING' : text,
        fileUrl: fileUrl || 'MISSING'
      }
    });
  }

  let fileData = null;
  if (fileUrl) {
    fileData = {
      url: fileUrl
    };
  }

  const message = {
    id: Date.now().toString(),
    username,
    text: text || '',
    file: fileData,
    roomId,
    timestamp: new Date().toISOString(),
  };

  if (!messagesByRoom[roomId]) {
    messagesByRoom[roomId] = [];
  }
  messagesByRoom[roomId].push(message);

  io.to(roomId).emit('newMessage', message);

  res.status(201).json({ message: 'Message sent successfully', data: message });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});