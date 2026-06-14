const Notification = require('../models/Notification');
const { paginate, paginationResult } = require('../utils/helpers');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, unreadOnly } = req.query;
    const { skip, limit: lim, page: pageNum } = paginate(page, limit);

    const query = { $or: [{ user: req.user._id }, { user: null }] };
    if (unreadOnly === 'true') query.isRead = false;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query).sort({ createdAt: -1 }).skip(skip).limit(lim).lean(),
      Notification.countDocuments(query),
      Notification.countDocuments({ ...query, isRead: false }),
    ]);

    res.json({ success: true, ...paginationResult(total, pageNum, lim), notifications, unreadCount });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res, next) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res, next) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Send broadcast notification (Admin)
// @route   POST /api/notifications/broadcast
// @access  Admin
exports.broadcast = async (req, res, next) => {
  try {
    const { title, message, type = 'system', link } = req.body;
    const notification = await Notification.create({ type, title, message, link, user: null });
    res.status(201).json({ success: true, message: 'Broadcast notification sent', notification });
  } catch (error) {
    next(error);
  }
};
