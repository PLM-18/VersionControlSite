import Notification from '../models/Notification.js';

class NotificationService {
  async getUserNotifications(userId) {
    const notifications = await Notification.find({ recipient: userId })
      .populate('sender', 'username firstName lastName profileImage')
      .populate('relatedProject', 'title')
      .sort({ createdAt: -1 })
      .limit(50);

    return notifications;
  }

  async markAsRead(notificationId, userId) {
    const notification = await Notification.findById(notificationId);

    if (!notification) {
      throw new Error('Notification not found');
    }

    if (notification.recipient.toString() !== userId.toString()) {
      throw new Error('Unauthorized');
    }

    notification.read = true;
    await notification.save();

    return notification;
  }

  async markAllAsRead(userId) {
    await Notification.updateMany(
      { recipient: userId, read: false },
      { $set: { read: true } }
    );

    return { message: 'All notifications marked as read' };
  }

  async deleteNotification(notificationId, userId) {
    const notification = await Notification.findById(notificationId);

    if (!notification) {
      throw new Error('Notification not found');
    }

    if (notification.recipient.toString() !== userId.toString()) {
      throw new Error('Unauthorized');
    }

    await Notification.findByIdAndDelete(notificationId);

    return { message: 'Notification deleted' };
  }

  async getUnreadCount(userId) {
    const count = await Notification.countDocuments({
      recipient: userId,
      read: false
    });

    return { count };
  }
}

export default new NotificationService();
