const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { getMyNotifications, markAllRead, markOneRead, getUnreadCount } = require('../controllers/notificationController');

router.use(authenticate);

router.get('/my', getMyNotifications);
router.get('/unread-count', getUnreadCount);
router.patch('/read-all', markAllRead);
router.patch('/:id/read', markOneRead);

module.exports = router;
