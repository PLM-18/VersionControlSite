import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, User, Calendar, MessageSquare, GitCommit, Star } from 'lucide-react';
import { activityAPI } from '../services/api.js';

const ActivityFeed = ({ activeTab }) => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, [activeTab]);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      let data;
      if (activeTab === 'local') {
        data = await activityAPI.getLocalActivity();
      } else {
        data = await activityAPI.getGlobalActivity();
      }
      setActivities(data);
    } catch (error) {
      console.error('Error fetching activities:', error);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'project_created':
        return <Star className="text-yellow-400" size={16} />;
      case 'project_updated':
        return <GitCommit className="text-blue-400" size={16} />;
      case 'check_in':
        return <GitCommit className="text-green-400" size={16} />;
      case 'check_out':
        return <GitCommit className="text-orange-400" size={16} />;
      default:
        return <MessageSquare className="text-purple-400" size={16} />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'project_created':
        return 'border-yellow-400';
      case 'project_updated':
        return 'border-blue-400';
      case 'check_in':
        return 'border-green-400';
      case 'check_out':
        return 'border-orange-400';
      default:
        return 'border-purple-400';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-800 rounded-lg p-6 animate-pulse">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-700 rounded w-32"></div>
                <div className="h-3 bg-gray-700 rounded w-24"></div>
              </div>
            </div>
            <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-20 bg-gray-700 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare size={64} className="mx-auto text-gray-600 mb-4" />
        <h3 className="text-xl font-semibold text-gray-400 mb-2">No activity yet</h3>
        <p className="text-gray-500">
          {activeTab === 'friends' ? 
            'Follow some friends to see their activity here' : 
            'Be the first to share something with the community'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {activities.map((activity) => (
        <div key={activity.id} className="bg-gray-800 rounded-lg p-6 card-hover border-l-4 border-transparent hover:border-green-500">
          {/* Activity Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <img 
                src={activity.user?.profileImage || '/api/placeholder/32/32'} 
                alt={activity.user?.firstName}
                className="w-8 h-8 rounded-full"
              />
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-green-400">
                    {activity.user?.firstName} {activity.user?.lastName}
                  </span>
                  <span className="text-gray-400">•</span>
                  <span className="text-sm text-gray-400">{activity.action || 'shared a project'}</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <Calendar size={12} />
                  <span>{formatTimeAgo(activity.createdAt)}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {getActivityIcon(activity.type)}
            </div>
          </div>

          {/* Activity Content */}
          <div className="mb-4">
            <p className="text-gray-300 mb-3">{activity.message || activity.description}</p>
            
            {/* Project Card */}
            {activity.project && (
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-semibold text-white">{activity.project.name}</h4>
                      {activity.project.status === 'checked_out' && (
                        <span className="px-2 py-1 bg-orange-600 text-orange-100 text-xs rounded-full">
                          Checked Out
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm mb-3">
                      {activity.project.description}
                    </p>
                    
                    {/* Project Tags */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {activity.project.hashtags?.map((tag, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-gray-600 text-gray-300 text-xs rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                      {activity.project.type && (
                        <span className="px-2 py-1 bg-blue-600 text-blue-100 text-xs rounded">
                          {activity.project.type}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-4 text-xs text-gray-400">
                      <span>Version {activity.project.version}</span>
                      <span>•</span>
                      <span>{activity.project.files?.length || 0} files</span>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 ml-4">
                    <button className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 px-3 py-2 rounded text-sm transition-colors">
                      <Download size={14} />
                      <span>{activity.downloads || '24'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Activity Actions */}
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <button className="hover:text-green-400 transition-colors">
              <MessageSquare size={16} className="inline mr-1" />
              Comment
            </button>
            <button className="hover:text-red-400 transition-colors">
              <Star size={16} className="inline mr-1" />
              Star
            </button>
          </div>
        </div>
      ))}
      
      {/* Load More Button */}
      {activities.length > 0 && (
        <div className="text-center pt-6">
          <button className="bg-gray-800 hover:bg-gray-700 px-6 py-3 rounded-lg transition-colors">
            Load More Activity
          </button>
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;