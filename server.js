const app = require('./src/app');
const http = require('http');
const socketio = require('socket.io');
const { sequelize } = require('./src/config/database');
const timeSync = require('./src/config/timeSync');
const timeService = require('./src/services/timeService');

const server = http.createServer(app);

const io = socketio(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

global.io = io;

// Initialize time synchronization
(async () => {
  try {
    await timeSync.init();
    console.log('✅ Time synchronization initialized');
    console.log(`📅 Current synchronized time: ${timeService.formatDate(timeService.now(), 'full')}`);
    console.log(`🎓 Academic term: ${timeService.getCurrentTerm().term} ${timeService.getCurrentTerm().year}`);
    console.log(`🌍 Timezone: ${timeService.getTimezoneInfo().timezone} (UTC${timeService.getTimezoneInfo().offset >= 0 ? '+' : ''}${timeService.getTimezoneInfo().offset})`);
  } catch (error) {
    console.error('❌ Time sync initialization failed:', error);
  }
})();

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log('🔌 New client connected:', socket.id, 'at', timeService.formatDate(new Date(), 'full'));

  // Send initial time sync
  socket.emit('time-sync', {
    serverTime: timeService.now(),
    serverDate: timeService.today(),
    timezone: timeService.getTimezoneInfo(),
    academicTerm: timeService.getCurrentTerm()
  });

  // Join user to their private room
  socket.on('join', (userId) => {
    if (userId) {
      socket.join(`user-${userId}`);
      console.log(`User ${userId} joined room user-${userId} at ${timeService.formatDate(new Date(), 'time')}`);
    }
  });

  // Join school room
  socket.on('join-school', (schoolCode) => {
    if (schoolCode) {
      socket.join(`school-${schoolCode}`);
      console.log(`Socket joined school room: ${schoolCode}`);
    }
  });

  // Handle private messages
  socket.on('private-message', async (data) => {
    const { to, message } = data;
    const timestamp = timeService.now();
    
    io.to(`user-${to}`).emit('private-message', {
      from: socket.userId,
      message,
      timestamp,
      formattedTime: timeService.formatDate(timestamp, 'time'),
      id: Date.now()
    });
  });

  // Handle group messages
  socket.on('group-message', (data) => {
    const { group, message } = data;
    const timestamp = timeService.now();
    
    io.to(`group-${group}`).emit('group-message', {
      from: socket.userId,
      message,
      timestamp,
      formattedTime: timeService.formatDate(timestamp, 'time'),
      id: Date.now()
    });
  });

  // Handle typing indicators
  socket.on('typing', (data) => {
    const { to, isTyping } = data;
    socket.to(`user-${to}`).emit('typing', {
      from: socket.userId,
      isTyping,
      timestamp: timeService.now()
    });
  });

  // Handle read receipts
  socket.on('message-read', (data) => {
    const { messageId, from } = data;
    io.to(`user-${from}`).emit('message-read', { 
      messageId, 
      readBy: socket.userId,
      readAt: timeService.now()
    });
  });

  // Handle duty check-in notifications
  socket.on('duty-checkin', (data) => {
    const { schoolCode, teacherId } = data;
    const timestamp = timeService.now();
    
    io.to(`school-${schoolCode}`).emit('duty-update', {
      type: 'checkin',
      teacherId,
      timestamp,
      formattedTime: timeService.formatDate(timestamp, 'time')
    });
  });

  // Handle alert broadcast
  socket.on('send-alert', (data) => {
    const { schoolCode, alert } = data;
    io.to(`school-${schoolCode}`).emit('new-alert', alert);
  });

  // Client requesting time sync
  socket.on('request-time-sync', () => {
    socket.emit('time-sync', {
      serverTime: timeService.now(),
      serverDate: timeService.today(),
      timezone: timeService.getTimezoneInfo(),
      academicTerm: timeService.getCurrentTerm()
    });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id, 'at', timeService.formatDate(new Date(), 'time'));
  });
});

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`\n📥 Received ${signal}, starting graceful shutdown at ${timeService.formatDate(new Date(), 'full')}...`);
  
  server.close(async () => {
    console.log('✅ HTTP server closed');
    
    if (global.io) {
      await global.io.close();
      console.log('✅ Socket.io closed');
    }
    
    try {
      await sequelize.close();
      console.log('✅ Database connection closed');
      process.exit(0);
    } catch (err) {
      console.error('❌ Error during shutdown:', err);
      process.exit(1);
    }
  });

  // Force close after 30 seconds
  setTimeout(() => {
    console.error('⚠️ Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 30000);
};

// Listen for shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, async () => {
  console.log('\n=================================');
  console.log(`🚀 ShuleAI Server v2.1.0`);
  console.log(`📡 Running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
  console.log(`💓 Health check: http://localhost:${PORT}/health`);
  console.log(`📊 WebSocket: active`);
  console.log(`⏰ Time sync: ${timeSync.getSyncStatus().timeSource} (accuracy: ${timeSync.getSyncStatus().accuracy})`);
  console.log(`📅 Server time: ${timeService.formatDate(timeService.now(), 'full')}`);
  console.log('=================================\n');
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception at', timeService.formatDate(new Date(), 'full'), ':', err);
  gracefulShutdown('uncaughtException');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection at', timeService.formatDate(new Date(), 'full'), ':', err);
  gracefulShutdown('unhandledRejection');
});