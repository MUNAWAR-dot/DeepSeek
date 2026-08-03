// server/index.js - NEON VERSION
require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, { cors: { origin: '*' } });

// Middleware
app.use(cors());
app.use(express.json());

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Neon PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Test connection
pool.connect()
  .then(() => console.log('✅ Neon database connected!'))
  .catch(err => console.error('❌ Database error:', err));

// Create tables automatically
async function createTables() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(100),
        phone VARCHAR(20),
        photo TEXT,
        status VARCHAR(200) DEFAULT 'Hey there! I am using ChatsApp',
        online BOOLEAN DEFAULT false,
        last_seen TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS chats (
        id SERIAL PRIMARY KEY,
        is_group BOOLEAN DEFAULT false,
        group_name VARCHAR(100),
        group_icon TEXT,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS chat_participants (
        chat_id INTEGER REFERENCES chats(id),
        user_id INTEGER REFERENCES users(id),
        joined_at TIMESTAMP DEFAULT NOW(),
        PRIMARY KEY (chat_id, user_id)
      );

      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        chat_id INTEGER REFERENCES chats(id),
        sender_id INTEGER REFERENCES users(id),
        type VARCHAR(20) DEFAULT 'text',
        content TEXT,
        file_url TEXT,
        file_name VARCHAR(255),
        file_size INTEGER,
        timestamp TIMESTAMP DEFAULT NOW(),
        status VARCHAR(20) DEFAULT 'sent'
      );

      CREATE TABLE IF NOT EXISTS statuses (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        type VARCHAR(20),
        media_url TEXT,
        caption VARCHAR(500),
        created_at TIMESTAMP DEFAULT NOW(),
        expires_at TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS calls (
        id SERIAL PRIMARY KEY,
        caller_id INTEGER REFERENCES users(id),
        receiver_id INTEGER REFERENCES users(id),
        type VARCHAR(10),
        status VARCHAR(20),
        duration INTEGER DEFAULT 0,
        started_at TIMESTAMP DEFAULT NOW(),
        ended_at TIMESTAMP
      );
    `);
    console.log('✅ Database tables created!');
  } catch (error) {
    console.error('❌ Table creation error:', error);
  }
}

createTables();

// ==================== AUTH ROUTES ====================

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Check if user exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const result = await pool.query(
      'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id, email, name, photo, status',
      [email, hashedPassword, name]
    );
    
    const user = result.rows[0];
    
    // Create token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'secret123',
      { expiresIn: '30d' }
    );
    
    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'User not found' });
    }
    
    const user = result.rows[0];
    
    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid password' });
    }
    
    // Update online status
    await pool.query(
      'UPDATE users SET online = true, last_seen = NOW() WHERE id = $1',
      [user.id]
    );
    
    // Create token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'secret123',
      { expiresIn: '30d' }
    );
    
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        photo: user.photo,
        status: user.status,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== USER ROUTES ====================

// Get user profile
app.get('/api/users/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, name, phone, photo, status, online, last_seen FROM users WHERE id = $1',
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update profile
app.put('/api/users/profile', async (req, res) => {
  try {
    const { userId, name, status, phone } = req.body;
    
    await pool.query(
      'UPDATE users SET name = COALESCE($1, name), status = COALESCE($2, status), phone = COALESCE($3, phone) WHERE id = $4',
      [name, status, phone, userId]
    );
    
    res.json({ message: 'Profile updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search users
app.get('/api/users/search/:query', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, photo, status FROM users WHERE name ILIKE $1 OR email ILIKE $1 LIMIT 20',
      [`%${req.params.query}%`]
    );
    
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== CHAT ROUTES ====================

// Get user's chats
app.get('/api/chats/:userId', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.*, 
        (SELECT content FROM messages WHERE chat_id = c.id ORDER BY timestamp DESC LIMIT 1) as last_message,
        (SELECT timestamp FROM messages WHERE chat_id = c.id ORDER BY timestamp DESC LIMIT 1) as last_message_time
      FROM chats c
      JOIN chat_participants cp ON c.id = cp.chat_id
      WHERE cp.user_id = $1
      ORDER BY last_message_time DESC NULLS LAST
    `, [req.params.userId]);
    
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create chat
app.post('/api/chats', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { userId1, userId2, isGroup, groupName } = req.body;
    
    // Create chat
    const chatResult = await client.query(
      'INSERT INTO chats (is_group, group_name) VALUES ($1, $2) RETURNING id',
      [isGroup || false, groupName || null]
    );
    
    const chatId = chatResult.rows[0].id;
    
    // Add participants
    if (isGroup && req.body.participants) {
      for (const participantId of req.body.participants) {
        await client.query(
          'INSERT INTO chat_participants (chat_id, user_id) VALUES ($1, $2)',
          [chatId, participantId]
        );
      }
    } else {
      await client.query(
        'INSERT INTO chat_participants (chat_id, user_id) VALUES ($1, $2), ($1, $3)',
        [chatId, userId1, userId2]
      );
    }
    
    await client.query('COMMIT');
    
    res.json({ chatId, message: 'Chat created' });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// ==================== MESSAGE ROUTES ====================

// Get messages
app.get('/api/messages/:chatId', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT m.*, u.name as sender_name, u.photo as sender_photo
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.chat_id = $1
      ORDER BY m.timestamp DESC
      LIMIT 50
    `, [req.params.chatId]);
    
    res.json(result.rows.reverse());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send message
app.post('/api/messages', async (req, res) => {
  try {
    const { chatId, senderId, type, content, fileUrl, fileName } = req.body;
    
    const result = await pool.query(
      'INSERT INTO messages (chat_id, sender_id, type, content, file_url, file_name) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [chatId, senderId, type, content, fileUrl, fileName]
    );
    
    const message = result.rows[0];
    
    // Emit via socket
    io.emit('newMessage', message);
    
    res.json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== UPLOAD ROUTE ====================

app.post('/api/upload', async (req, res) => {
  try {
    const upload = multer({ dest: 'uploads/' }).single('file');
    
    upload(req, res, async (err) => {
      if (err) return res.status(400).json({ error: err.message });
      
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'chatsapp',
        resource_type: 'auto',
      });
      
      res.json({ url: result.secure_url });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== SOCKET.IO ====================

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join', (userId) => {
    socket.join(`user:${userId}`);
  });
  
  socket.on('sendMessage', async (data) => {
    try {
      const result = await pool.query(
        'INSERT INTO messages (chat_id, sender_id, type, content) VALUES ($1, $2, $3, $4) RETURNING *',
        [data.chatId, data.senderId, data.type, data.content]
      );
      
      const message = result.rows[0];
      io.emit('newMessage', message);
    } catch (error) {
      console.error('Message error:', error);
    }
  });
  
  socket.on('typing', (data) => {
    socket.broadcast.emit('userTyping', data);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Health check
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.json({ status: 'error', database: 'disconnected' });
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
