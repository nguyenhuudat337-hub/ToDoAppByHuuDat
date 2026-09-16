const express = require('express');
const db = require('../db');
const authenticateToken = require('../middleware/auth');
const router = express.Router();

// Tất cả route dưới đây đều cần token
router.use(authenticateToken);

// Lấy tất cả todo của user hiện tại
router.get('/', (req, res) => {
  const todos = db.prepare(
    'SELECT id, task_name, completed FROM todos WHERE user_id = ? ORDER BY id DESC'
  ).all(req.user.id);

  res.json(todos.map(t => ({
    taskId: t.id,
    taskName: t.task_name,
    completed: !!t.completed
  })));
});

// Thêm todo
router.post('/', (req, res) => {
  const { taskName } = req.body;
  if (!taskName || !taskName.trim()) {
    return res.status(400).json({ message: 'Tên task không được để trống' });
  }

  const result = db.prepare(
    'INSERT INTO todos (user_id, task_name) VALUES (?, ?)'
  ).run(req.user.id, taskName.trim());

  res.status(201).json({
    taskId: result.lastInsertRowid,
    taskName: taskName.trim(),
    completed: false
  });
});

// Cập nhật trạng thái hoàn thành
router.patch('/:id/toggle', (req, res) => {
  const todo = db.prepare(
    'SELECT * FROM todos WHERE id = ? AND user_id = ?'
  ).get(req.params.id, req.user.id);

  if (!todo) return res.status(404).json({ message: 'Không tìm thấy task' });

  const newStatus = todo.completed ? 0 : 1;
  db.prepare('UPDATE todos SET completed = ? WHERE id = ?').run(newStatus, req.params.id);

  res.json({ message: 'Cập nhật thành công', completed: !!newStatus });
});

// Sửa tên task
router.put('/:id', (req, res) => {
  const { taskName } = req.body;
  if (!taskName || !taskName.trim()) {
    return res.status(400).json({ message: 'Tên task không được để trống' });
  }

  const result = db.prepare(
    'UPDATE todos SET task_name = ? WHERE id = ? AND user_id = ?'
  ).run(taskName.trim(), req.params.id, req.user.id);

  if (result.changes === 0) {
    return res.status(404).json({ message: 'Không tìm thấy task' });
  }

  res.json({ message: 'Sửa thành công' });
});

// Xóa 1 task
router.delete('/:id', (req, res) => {
  const result = db.prepare(
    'DELETE FROM todos WHERE id = ? AND user_id = ?'
  ).run(req.params.id, req.user.id);

  if (result.changes === 0) {
    return res.status(404).json({ message: 'Không tìm thấy task' });
  }

  res.json({ message: 'Xóa thành công' });
});

// Xóa tất cả task đã hoàn thành
router.delete('/completed/all', (req, res) => {
  db.prepare(
    'DELETE FROM todos WHERE user_id = ? AND completed = 1'
  ).run(req.user.id);

  res.json({ message: 'Đã xóa các task hoàn thành' });
});

module.exports = router;