import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar.js';
import SearchBar from '../components/SearchBar.js';
import { 
  Bell, 
  X, 
  Check, 
  GitPullRequest, 
  UserPlus, 
  AlertTriangle,
  CheckCircle,
  MessageCircle,
  Star,
  GitBranch,
  Code,
  Clock,
  Archive
} from 'lucide-react';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all'); // all, unread, read

  // Mock notifications data
  const mockNotifications = [
    {
      id: 1,
      type: 'pull_request',
      title: 'Pull Request Merged',
      message: 'Your pull request for feature/user-auth has been merged into main branch.',
      project: 'E-commerce Platform',
      timestamp: '2 hours ago',
      read: false,
      icon: GitPullRequest,
      iconColor: 'text-green-400',
      bgColor: 'bg-green-900/20'
    },
    {
      id: 2,
      type: 'collaborator',
      title: 'New Collaborator Added',
      message: 'Sarah Johnson (@sarahjohnson) has been added as a collaborator to Mobile Banking App.',
      project: 'Mobile Banking App',
      timestamp: '4 hours ago',
      read: false,
      icon: UserPlus,
      iconColor: 'text-blue-400',
      bgColor: 'bg-blue-900/20'
    },
    {
      id: 3,
      type: 'deployment',
      title: 'Deploy Successful',
      message: 'Your latest changes have been successfully deployed to production.',
      project: 'AI Analytics Dashboard',
      timestamp: '1 day ago',
      read: true,
      icon: CheckCircle,
      iconColor: 'text-green-400',
      bgColor: 'bg-green-900/20'
    },
    {
      id: 4,
      type: 'build_failed',
      title: 'Build Failed',
      message: 'Build #247 failed due to test failures. Please check the logs for more details.',
      project: 'E-commerce Platform',
      timestamp: '1 day ago',
      read: true,
      icon: AlertTriangle,
      iconColor: 'text-yellow-400',
      bgColor: 'bg-yellow-900/20'
    },
    {
      id: 5,
      type: 'comment',
      title: 'New Comment on Your Project',
      message: 'Alex Chen commented: "Great implementation! The authentication flow works perfectly."',
      project: 'Social Media Dashboard',
      timestamp: '2 days ago',
      read: false,
      icon: MessageCircle,
      iconColor: 'text-purple-400',
      bgColor: 'bg-purple-900/20'
    },
    {
      id: 6,
      type: 'starred',
      title: 'Project Starred',
      message: 'Your project "Weather Prediction ML Model" received 5 new stars.',
      project: 'Weather Prediction ML Model',
      timestamp: '3 days ago',
      read: false,
      icon: Star,
      iconColor: 'text-yellow-400',
      bgColor: 'bg-yellow-900/20'
    },
    {
      id: 7,
      type: 'branch_created',
      title: 'New Branch Created',
      message: 'Branch "feature/payment-integration" has been created in E-commerce Platform.',
      project: 'E-commerce Platform',
      timestamp: '3 days ago',
      read: true,
      icon: GitBranch,
      iconColor: 'text-indigo-400',
      bgColor: 'bg-indigo-900/20'
    },
    {
      id: 8,
      type: 'code_review',
      title: 'Code Review Requested',
      message: 'Maria Garcia requested your review on PR #156: "Add user profile settings"',
      project: 'Mobile Banking App',
      timestamp: '4 days ago',
      read: false,
      icon: Code,
      iconColor: 'text-cyan-400',
      bgColor: 'bg-cyan-900/20'
    }
  ];

  useEffect(() => {
    // Mock user data
    const mockUser = {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      username: 'johndoe',
      email: 'johndoe@gmail.com',
      profileImage: null
    };

    setUser(mockUser);
    setNotifications(mockNotifications);
    setLoading(false);
  }, []);

  const handleDismiss = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const handleMarkAsRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all notifications?')) {
      setNotifications([]);
    }
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
      <Sidebar user={user} currentPage="notifications" />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
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

        {/* Notifications Section */}
        <main className="flex-1 px-6 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
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

            {/* Filter Tabs */}
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

            {/* Notifications List */}
            {filteredNotifications.length > 0 ? (
              <div className="space-y-3">
                {filteredNotifications.map((notification) => {
                  const IconComponent = notification.icon;
                  
                  return (
                    <div
                      key={notification.id}
                      className={`bg-gray-800 rounded-lg p-4 transition-all hover:bg-gray-750 ${
                        !notification.read ? 'border-l-4 border-green-500' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-4">
                        {/* Icon */}
                        <div className={`p-2 rounded-lg ${notification.bgColor}`}>
                          <IconComponent size={20} className={notification.iconColor} />
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <h3 className="font-semibold text-white">
                                  {notification.title}
                                </h3>
                                {!notification.read && (
                                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                )}
                              </div>
                              <p className="text-gray-400 text-sm mt-1">
                                {notification.message}
                              </p>
                              <div className="flex items-center space-x-4 mt-2">
                                <span className="text-xs text-gray-500">
                                  {notification.project}
                                </span>
                                <span className="text-xs text-gray-500 flex items-center">
                                  <Clock size={12} className="mr-1" />
                                  {notification.timestamp}
                                </span>
                              </div>
                            </div>
                            
                            {/* Actions */}
                            <div className="flex items-center space-x-2 ml-4">
                              {!notification.read && (
                                <button
                                  onClick={() => handleMarkAsRead(notification.id)}
                                  className="p-1 text-gray-400 hover:text-green-400 transition-colors"
                                  title="Mark as read"
                                >
                                  <Check size={16} />
                                </button>
                              )}
                              <button
                                onClick={() => handleDismiss(notification.id)}
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