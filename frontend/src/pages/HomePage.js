import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar.js';
import SearchBar from '../components/SearchBar.js';
import ActivityFeed from '../components/ActivityFeed.js';
import { Bell, Users, Globe, Clock, TrendingUp } from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('friends');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/signin');
      return;
    }

    // Fetch user profile
    fetchUserProfile();
  }, [navigate]);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        throw new Error('Failed to fetch user profile');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // If token is invalid, redirect to signin
      localStorage.removeItem('token');
      navigate('/signin');
    } finally {
      setLoading(false);
    }
  };

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
      <Sidebar user={user} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <SearchBar />
            
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"></span>
              </button>
              
              <div className="flex items-center space-x-3">
                <img 
                  src={user?.profileImage || '/api/placeholder/32/32'} 
                  alt={user?.firstName} 
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-sm font-medium">{user?.firstName} {user?.lastName}</span>
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              </div>
            </div>
          </div>
        </header>

        {/* Activity Feed Section */}
        <main className="flex-1 px-6 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Activity Feed Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold gradient-text mb-2">Activity Feed</h1>
              <p className="text-gray-400">Stay updated with your network's latest projects and activities</p>
            </div>

            {/* Feed Tabs */}
            <div className="flex items-center justify-center mb-8">
              <div className="bg-gray-800 rounded-lg p-1 flex space-x-1">
                <button
                  onClick={() => setActiveTab('friends')}
                  className={`flex items-center space-x-2 px-6 py-2 rounded-md text-sm font-medium transition-all ${
                    activeTab === 'friends'
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
                
                <button
                  onClick={() => setActiveTab('recent')}
                  className={`flex items-center space-x-2 px-6 py-2 rounded-md text-sm font-medium transition-all ${
                    activeTab === 'recent'
                      ? 'bg-green-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <Clock size={16} />
                  <span>Recent</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('popular')}
                  className={`flex items-center space-x-2 px-6 py-2 rounded-md text-sm font-medium transition-all ${
                    activeTab === 'popular'
                      ? 'bg-green-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <TrendingUp size={16} />
                  <span>Popular</span>
                </button>
              </div>
            </div>

            {/* Activity Feed Component */}
            <ActivityFeed activeTab={activeTab} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default HomePage;