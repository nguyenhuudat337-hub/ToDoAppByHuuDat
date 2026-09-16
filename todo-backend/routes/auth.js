const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const router = express.Router();

const authenticateToken = require('../middleware/auth');

// Logout
router.post('/logout', authenticateToken, (req, res) => {
  db.prepare('UPDATE users SET current_token = NULL WHERE id = ?')
    .run(req.user.id);

  res.json({ message: 'Đăng xuất thành công' });
});

// Đăng ký
router.post('/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Thiếu username hoặc password' });
  }

  // Kiểm tra username đã tồn tại chưa
  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (existing) {
    return res.status(400).json({ message: 'Username đã tồn tại' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  const result = db.prepare(
    'INSERT INTO users (username, password) VALUES (?, ?)'
  ).run(username, hashedPassword);

  res.status(201).json({ 
    message: 'Đăng ký thành công',
    userId: result.lastInsertRowid 
  });
});

// Đăng nhập
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user) {
    return res.status(401).json({ message: 'Sai tài khoản hoặc mật khẩu' });
  }

  const isMatch = bcrypt.compareSync(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Sai tài khoản hoặc mật khẩu' });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  db.prepare('UPDATE users SET current_token = ? WHERE id = ?')
    .run(token, user.id);

  res.json({
    message: 'Đăng nhập thành công',
    token,
    user: { id: user.id, username: user.username }
  });
});

module.exports = router;