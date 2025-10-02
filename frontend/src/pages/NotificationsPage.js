import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import Sidebar from '../components/Sidebar.js';
import SearchBar from '../components/SearchBar.js';
import {
  Bell,
  X,
  Check,
  UserPlus,
  AlertTriangle,
  CheckCircle,
  MessageCircle,
  GitBranch,
  Clock,
  Archive
} from 'lucide-react';
import { notificationAPI } from '../services/api.js';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'friend_request': return UserPlus;
      case 'friend_accepted': return CheckCircle;
      case 'project_update': return MessageCircle;
      case 'checkout': return GitBranch;
      case 'checkin': return GitBranch;
      default: return Bell;
    }
  };

  const getNotificationColors = (type) => {
    switch (type) {
      case 'friend_request': return { icon: 'text-blue-400', bg: 'bg-blue-900/20' };
      case 'friend_accepted': return { icon: 'text-green-400', bg: 'bg-green-900/20' };
      case 'project_update': return { icon: 'text-purple-400', bg: 'bg-purple-900/20' };
      case 'checkout': return { icon: 'text-orange-400', bg: 'bg-orange-900/20' };
      case 'checkin': return { icon: 'text-green-400', bg: 'bg-green-900/20' };
      default: return { icon: 'text-gray-400', bg: 'bg-gray-900/20' };
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationAPI.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = async (id) => {
    try {
      await notificationAPI.deleteNotification(id);
      setNotifications(notifications.filter(n => n._id !== id));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(notifications.map(n =>
        n._id === id ? { ...n, read: true } : n
      ));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear all notifications?')) {
      try {
        // Delete each notification
        await Promise.all(notifications.map(n => notificationAPI.deleteNotification(n._id)));
        setNotifications([]);
      } catch (err) {
        console.error('Error clearing notifications:', err);
      }
    }
  };

  const formatTimestamp = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="loading w-8 h-8"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Sidebar */}
      <Sidebar currentPage="notifications" />
      
      <div className="flex-1 flex flex-col">
        <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <SearchBar />
            
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"></span>
                )}
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm font-medium">{user?.firstName} {user?.lastName}</span>
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-6 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold gradient-text mb-2">Notifications</h1>
                <p className="text-gray-400">
                  {unreadCount > 0 
                    ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                    : 'You\'re all caught up!'
                  }
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Check size={16} />
                    <span className="text-sm">Mark all as read</span>
                  </button>
                )}
                
                {notifications.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Archive size={16} />
                    <span className="text-sm">Clear all</span>
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-1 mb-6 bg-gray-800 rounded-lg p-1 w-fit">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  filter === 'all'
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  filter === 'unread'
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                Unread ({unreadCount})
              </button>
              <button
                onClick={() => setFilter('read')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  filter === 'read'
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                Read ({notifications.filter(n => n.read).length})
              </button>
            </div>

            {filteredNotifications.length > 0 ? (
              <div className="space-y-3">
                {filteredNotifications.map((notification) => {
                  const IconComponent = getNotificationIcon(notification.type);
                  const colors = getNotificationColors(notification.type);

                  return (
                    <div
                      key={notification._id}
                      className={`bg-gray-800 rounded-lg p-4 transition-all hover:bg-gray-750 ${
                        !notification.read ? 'border-l-4 border-green-500' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-4">
                        {/* Icon */}
                        <div className={`p-2 rounded-lg ${colors.bg}`}>
                          <IconComponent size={20} className={colors.icon} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <h3 className="font-semibold text-white">
                                  {notification.type === 'friend_request' && 'Friend Request'}
                                  {notification.type === 'friend_accepted' && 'Friend Request Accepted'}
                                  {notification.type === 'project_update' && 'Project Update'}
                                  {notification.type === 'checkout' && 'Project Checked Out'}
                                  {notification.type === 'checkin' && 'Project Checked In'}
                                </h3>
                                {!notification.read && (
                                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                )}
                              </div>
                              <p className="text-gray-400 text-sm mt-1">
                                {notification.message}
                              </p>
                              <div className="flex items-center space-x-4 mt-2">
                                <span className="text-xs text-gray-500 flex items-center">
                                  <Clock size={12} className="mr-1" />
                                  {formatTimestamp(notification.createdAt)}
                                </span>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center space-x-2 ml-4">
                              {!notification.read && (
                                <button
                                  onClick={() => handleMarkAsRead(notification._id)}
                                  className="p-1 text-gray-400 hover:text-green-400 transition-colors"
                                  title="Mark as read"
                                >
                                  <Check size={16} />
                                </button>
                              )}
                              <button
                                onClick={() => handleDismiss(notification._id)}
                                className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                                title="Dismiss"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Bell size={48} className="mx-auto text-gray-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-400 mb-2">
                  {filter === 'all' 
                    ? 'No notifications yet'
                    : filter === 'unread'
                    ? 'No unread notifications'
                    : 'No read notifications'
                  }
                </h3>
                <p className="text-gray-500 text-sm">
                  {filter === 'all' 
                    ? 'When you get notifications, they\'ll show up here'
                    : filter === 'unread'
                    ? 'All your notifications have been read'
                    : 'Read notifications will appear here'
                  }
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default NotificationsPage;