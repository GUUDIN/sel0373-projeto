const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/sel0373-projeto');

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'sel0373-secret-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost/sel0373-projeto'
  }),
  cookie: {
    secure: false,
    maxAge: 1000 * 60 * 60 * 24 // 24 hours
  }
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// View engine setup
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('Cliente conectado via Socket.IO:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

// Routes
app.use('/', require('./routes/users'));
app.use('/projeto1', require('./routes/projeto1'));
app.use('/projeto2', require('./routes/projeto2')(io)); // Passa io para projeto2
app.use('/send-files', require('./routes/send-files'));

const PORT = process.env.PORT || 6005;
server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 Acesse: http://localhost:${PORT}`);
});

module.exports = { app, server, io };
