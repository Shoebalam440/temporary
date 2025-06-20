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

// In-memory message store
let messages = [];

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
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// POST /messages - receive a message
app.post('/messages', (req, res) => {
  const { username, text, file } = req.body;
  if (!username || (!text && !file)) {
    return res.status(400).json({ error: 'username and either text or file are required' });
  }
  const message = { id: Date.now(), username, text, file, timestamp: new Date() };
  messages.push(message);
  io.emit('new_message', message); // Emit to all clients
  res.status(201).json({ message: 'Message received', data: message });
});

// GET /messages - get all messages
app.get('/messages', (req, res) => {
  res.json(messages);
});

// POST /upload - receive a file
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  res.status(201).json({ message: 'File uploaded', file: req.file.filename });
});

// Serve uploaded files
app.use('/uploads', express.static(uploadDir));

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 