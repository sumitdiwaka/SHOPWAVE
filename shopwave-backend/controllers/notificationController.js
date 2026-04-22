import Notification from '../models/Notification.js';
import { asyncHandler } from '../middleware/errorMiddleware.js';

// Helper to create a notification (used internally by other controllers)
export const createNotification = async ({ recipient, type, title, message, link = '', meta = {} }) => {
  try {
    await Notification.create({ recipient, type, title, message, link, meta });
  } catch (err) {
    console.error('Notification create error:', err.message);
  }
};

// @desc   Get notifications for logged-in user
export const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50);

  const unreadCount = await Notification.countDocuments({ recipient: req.user._id, isRead: false });

  res.json({ success: true, notifications, unreadCount });
});

// @desc   Mark single notification as read
export const markRead = asyncHandler(async (req, res) => {
  await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user._id },
    { isRead: true }
  );
  res.json({ success: true });
});

// @desc   Mark all notifications as read
export const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
  res.json({ success: true, message: 'All notifications marked as read' });
});

// @desc   Delete a notification
export const deleteNotification = asyncHandler(async (req, res) => {
  await Notification.findOneAndDelete({ _id: req.params.id, recipient: req.user._id });
  res.json({ success: true });
});