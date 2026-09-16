const jwt = require('jsonwebtoken');
const db = require('../db');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Token không tồn tại' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
    }

    // Kiểm tra token có còn là token hiện tại của user không
    const user = db.prepare('SELECT current_token FROM users WHERE id = ?').get(decoded.id);

    if (!user || user.current_token !== token) {
      return res.status(401).json({ message: 'Tài khoản đã được đăng nhập ở nơi khác' });
    }

    req.user = decoded; // { id, username }
    next();
  });
}

module.exports = authenticateToken;