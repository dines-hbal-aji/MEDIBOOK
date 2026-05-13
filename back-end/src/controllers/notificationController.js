const db = require('../config/db');

const getMyNotifications = (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const total = db.prepare("SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND sent_at IS NOT NULL").get(req.user.id).count;
    const notifications = db.prepare(`
      SELECT * FROM notifications 
      WHERE user_id = ? AND sent_at IS NOT NULL
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).all(req.user.id, limit, offset);

    res.json({
      success: true,
      data: notifications,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    next(err);
  }
};

const markAllRead = (req, res, next) => {
  try {
    db.prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ?").run(req.user.id);
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
};

const markOneRead = (req, res, next) => {
  try {
    const { id } = req.params;
    db.prepare("UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?").run(id, req.user.id);
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (err) {
    next(err);
  }
};

const getUnreadCount = (req, res, next) => {
  try {
    const count = db.prepare("SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0 AND sent_at IS NOT NULL").get(req.user.id).count;
    res.json({ success: true, data: { count } });
  } catch (err) {
    next(err);
  }
};

module.exports = { getMyNotifications, markAllRead, markOneRead, getUnreadCount };
