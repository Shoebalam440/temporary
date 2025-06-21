const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// In-memory message store, now organized by room
let messagesByRoom = {};

// Create HTTP server and Socket.IO server
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
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

// POST /upload - This is the single endpoint for sending messages
app.post('/upload', upload.single('file'), (req, res) => {
  const { username, text, roomId } = req.body;

  // Enhanced validation to pinpoint the issue
  if (!username || !roomId || (typeof text === 'string' && !text.trim() && !req.file)) {
    return res.status(400).json({ 
        error: 'Validation failed on server.',
        details: 'The server requires a username, a roomId, and either a non-empty text message or a file.',
        received: {
            username: username || 'MISSING',
            roomId: roomId || 'MISSING',
            text: text === undefined ? 'MISSING' : text,
            file: req.file ? req.file.originalname : 'MISSING'
        }
    });
  }

  const backendUrl = process.env.RENDER_URL || `http://localhost:${PORT}`;

  let fileData = null;
  if (req.file) {
    fileData = {
      name: req.file.originalname,
      url: `${backendUrl}/uploads/${req.file.filename}`,
      type: req.file.mimetype,
      size: req.file.size,
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

// Serve uploaded files
app.use('/uploads', express.static(uploadDir));

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 