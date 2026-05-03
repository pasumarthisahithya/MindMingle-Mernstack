const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./config/database');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Initialize express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make io accessible to routes
app.set('io', io);

// Routes
app.use('/api/v1/auth', require('./routes/authRoutes'));
app.use('/api/v1/mindfulness-exercises', require('./routes/mindfulnessRoutes'));
app.use('/api/v1/mood-tracking', require('./routes/moodRoutes'));
app.use('/api/v1/mood-history', require('./routes/moodRoutes'));
app.use('/api/v1/peer-support', require('./routes/peerSupportRoutes'));
app.use('/api/v1/reminders', require('./routes/reminderRoutes'));
app.use('/api/v1/goals', require('./routes/goalRoutes'));
app.use('/api/v1/professional-help', require('./routes/professionalHelpRoutes'));

// Welcome route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Mindmingle API' });
});
app.get('/test', (req, res) => {
  res.send('Test working ✅');
});

// Socket.io connection for peer support chat
const activeUsers = new Map(); // Store active users with their socket IDs
const userAnonymousNames = new Map(); // Store persistent anonymous names for user sessions

// Creative name generator
const generateAnonymousName = () => {
  const adjectives = [
    'Peaceful', 'Brave', 'Calm', 'Gentle', 'Serene', 'Wise', 'Kind',
    'Bright', 'Radiant', 'Hopeful', 'Joyful', 'Tranquil', 'Mindful',
    'Resilient', 'Compassionate', 'Balanced', 'Harmonious', 'Zen',
    'Enlightened', 'Graceful', 'Patient', 'Strong', 'Courageous'
  ];
  
  const nouns = [
    'Phoenix', 'Lotus', 'Butterfly', 'Dolphin', 'Eagle', 'Mountain',
    'Ocean', 'Star', 'Moon', 'Sunrise', 'Willow', 'Breeze', 'River',
    'Cloud', 'Rainbow', 'Aurora', 'Meadow', 'Garden', 'Blossom',
    'Fountain', 'Lantern', 'Compass', 'Anchor', 'Haven'
  ];
  
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  
  return `${adjective} ${noun}`;
};

// Get or create anonymous name for user
const getAnonymousName = (userId) => {
  if (!userAnonymousNames.has(userId)) {
    userAnonymousNames.set(userId, generateAnonymousName());
  }
  return userAnonymousNames.get(userId);
};

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('join-support', (data) => {
    socket.join('support-room');
    socket.userId = data.userId;
    socket.supportType = data.supportType;
    
    // Generate or retrieve anonymous name for this user
    const anonymousName = getAnonymousName(data.userId);
    
    // Add user to active users with anonymous name
    activeUsers.set(socket.userId, {
      socketId: socket.id,
      userId: data.userId,
      experience: data.supportType,
      anonymousName: anonymousName
    });
    
    console.log(`User ${data.userId} (${anonymousName}) joined support room`);
    
    // Broadcast updated active users list
    io.to('support-room').emit('active-users', Array.from(activeUsers.values()));
  });

  socket.on('support-message', (data) => {
    io.to('support-room').emit('new-message', {
      message: data.message,
      timestamp: new Date(),
      anonymous: true
    });
  });

  // Handle private messages
  socket.on('private-message', (data) => {
    const { to, message, senderExperience } = data;
    const recipientUser = activeUsers.get(to);
    
    if (recipientUser) {
      // Send to specific user
      io.to(recipientUser.socketId).emit('private-message', {
        from: socket.userId,
        message,
        timestamp: new Date(),
        senderExperience
      });
    }
  });
``
  socket.on('disconnect', () => {
    console.log('Client disconnected');
    
    // Remove user from active users but keep their anonymous name for re-connection
    if (socket.userId) {
      activeUsers.delete(socket.userId);
      
      // Broadcast updated active users list
      io.to('support-room').emit('active-users', Array.from(activeUsers.values()));
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});