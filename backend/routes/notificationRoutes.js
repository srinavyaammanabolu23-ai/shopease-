const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, markAllAsRead, deleteNotification, broadcast } = require('../controllers/notificationController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect);
router.get('/', getNotifications);
router.put('/read-all', markAllAsRead);
router.put('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);
router.post('/broadcast', adminOnly, broadcast);

module.exports = router;
