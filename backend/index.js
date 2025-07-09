const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const multer = require('multer');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors({
  origin: [
    'https://fiveminor.netlify.app',
    'https://temporary-sbhe.onrender.com',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5176'
  ],
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json());

// In-memory message store, now organized by room
let messagesByRoom = {};

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// ChatMessage schema
const ChatMessageSchema = new mongoose.Schema({
  username: { type: String, required: true },
  text: { type: String },
  file: {
    url: String,
    originalname: String,
    mimetype: String,
    size: Number,
  },
  roomId: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});
const ChatMessage = mongoose.model('ChatMessage', ChatMessageSchema);

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Create HTTP server and Socket.IO server
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      'https://fiveminor.netlify.app',
      'https://temporary-sbhe.onrender.com',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:5176'
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
    // Fetch messages from MongoDB for the room
    ChatMessage.find({ roomId: roomId }).sort({ timestamp: 1 }).then(messages => {
      socket.emit('allMessages', messages);
    }).catch(err => {
      console.error('Error fetching messages for room:', roomId, err);
      socket.emit('allMessages', []); // Emit empty array on error
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// POST /upload - Accepts file upload or fileUrl
app.post('/upload', upload.single('file'), async (req, res) => {
  const { username, text, roomId, fileUrl } = req.body;

  if (!username || !roomId || (typeof text === 'string' && !text.trim() && !fileUrl && !req.file)) {
    return res.status(400).json({
      error: 'Validation failed on server.',
      details: 'The server requires a username, a roomId, and either a non-empty text message, a fileUrl, or a file upload.',
      received: {
        username: username || 'MISSING',
        roomId: roomId || 'MISSING',
        text: text === undefined ? 'MISSING' : text,
        fileUrl: fileUrl || 'MISSING',
        file: req.file ? req.file.originalname : 'MISSING',
      }
    });
  }

  let fileData = null;
  if (req.file) {
    fileData = {
      url: `/uploads/${req.file.filename}`,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
    };
  } else if (fileUrl) {
    fileData = { url: fileUrl };
  }

  const message = new ChatMessage({
    username,
    text: text || '',
    file: fileData,
    roomId,
    timestamp: new Date(),
  });
  await message.save();

  io.to(roomId).emit('newMessage', message);

  res.status(201).json({ message: 'Message sent successfully', data: message });
});

// GET /messages/:roomId - Get all messages for a room
app.get('/messages/:roomId', async (req, res) => {
  const { roomId } = req.params;
  const messages = await ChatMessage.find({ roomId }).sort({ timestamp: 1 });
  res.json(messages);
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});