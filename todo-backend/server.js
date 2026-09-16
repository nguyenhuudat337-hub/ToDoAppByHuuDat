require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const todoRoutes = require('./routes/todos');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Phục vụ file tĩnh (HTML, CSS, JS của Bai3)
app.use(express.static(path.join(__dirname, '..')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);

// Chuyển hướng trang gốc về login
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../html/login.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
  console.log(`Người khác trong mạng LAN có thể truy cập: http://<IP-máy-bạn>:${PORT}`);
});