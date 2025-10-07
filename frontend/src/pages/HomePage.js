import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import Sidebar from '../components/Sidebar.js';
import SearchBar from '../components/SearchBar.js';
import ActivityFeed from '../components/ActivityFeed.js';
import { Bell, Users, Globe } from 'lucide-react';
import { notificationAPI } from '../services/api.js';

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('local');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUnreadCount();
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const data = await notificationAPI.getUnreadCount();
      setUnreadCount(data.count);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };


  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      <Sidebar user={user} />
      
      <div className="flex-1 flex flex-col">
        <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <SearchBar />
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/notifications')}
                className="relative p-2 text-gray-400 hover:text-white transition-colors"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => navigate('/profile')}
                className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
              >
                {user?.profileImage ? (
                  <img src={user.profileImage} alt={user.username} className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-black font-bold text-sm">
                      {user?.username?.[0]?.toUpperCase()}
                    </span>
                  </div>
                )}
                <span className="text-sm font-medium">{user?.firstName} {user?.lastName}</span>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 px-6 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold gradient-text mb-2">Activity Feed</h1>
              <p className="text-gray-400">Stay updated with your network's latest projects and activities</p>
            </div>

            <div className="flex items-center justify-center mb-8">
              <div className="bg-gray-800 rounded-lg p-1 flex space-x-1">
                <button
                  onClick={() => setActiveTab('local')}
                  className={`flex items-center space-x-2 px-6 py-2 rounded-md text-sm font-medium transition-all ${
                    activeTab === 'local'
                      ? 'bg-green-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <Users size={16} />
                  <span>Friends</span>
                </button>

                <button
                  onClick={() => setActiveTab('global')}
                  className={`flex items-center space-x-2 px-6 py-2 rounded-md text-sm font-medium transition-all ${
                    activeTab === 'global'
                      ? 'bg-green-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <Globe size={16} />
                  <span>Global</span>
                </button>
              </div>
            </div>

            <ActivityFeed activeTab={activeTab} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default HomePage;