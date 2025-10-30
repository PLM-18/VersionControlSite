import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext.js';
import { adminAPI } from '../../services/api.js';
import { Trash2, Search, ChevronLeft, ChevronRight, Activity } from 'lucide-react';
import ConfirmModal from '../ConfirmModal.js';

const AdminActivities = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalActivities, setTotalActivities] = useState(0);
  const [deleteModal, setDeleteModal] = useState({ show: false, activity: null });

  useEffect(() => {
    fetchActivities();
  }, [currentPage]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getAllActivities(currentPage, 20);
      setActivities(data.activities);
      setTotalPages(data.totalPages);
      setTotalActivities(data.totalActivities);
    } catch (err) {
      console.error('Error fetching activities:', err);
      toast.error(err.message || 'Failed to fetch activities');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (activityId) => {
    try {
      await adminAPI.deleteActivity(activityId);
      toast.success('Activity deleted successfully');
      fetchActivities();
      setDeleteModal({ show: false, activity: null });
    } catch (err) {
      console.error('Error deleting activity:', err);
      toast.error(err.message || 'Failed to delete activity');
    }
  };

  const filteredActivities = activities.filter(activity =>
    activity.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.project?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActivityIcon = (type) => {
    return <Activity size={16} className="text-blue-400" />;
  };

  const getActivityTypeColor = (type) => {
    const colors = {
      'checkout': 'bg-orange-500/20 text-orange-400',
      'checkin': 'bg-green-500/20 text-green-400',
      'create': 'bg-blue-500/20 text-blue-400',
      'update': 'bg-purple-500/20 text-purple-400',
      'delete': 'bg-red-500/20 text-red-400',
    };
    return colors[type] || 'bg-gray-500/20 text-gray-400';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="loading w-8 h-8"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-1">Activities Management</h2>
          <p className="text-gray-400">Total: {totalActivities} activities</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search activities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:border-green-500 focus:ring-1 focus:ring-green-500"
          />
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Project
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredActivities.map((activity) => (
                <tr key={activity._id} className="hover:bg-gray-700/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {activity.user?.profileImage ? (
                        <img
                          src={activity.user.profileImage}
                          alt={activity.user.username}
                          className="w-8 h-8 rounded-full mr-2"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mr-2">
                          <span className="text-black font-bold text-sm">
                            {activity.user?.username?.[0]?.toUpperCase()}
                          </span>
                        </div>
                      )}
                      <span className="text-sm text-white">{activity.user?.username || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {getActivityIcon(activity.type)}
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getActivityTypeColor(activity.type)}`}>
                        {activity.type}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {activity.project ? (
                      <div>
                        <div className="text-sm font-medium text-white">{activity.project.title}</div>
                        {activity.description && (
                          <div className="text-xs text-gray-400 truncate max-w-xs">
                            {activity.description}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {formatDate(activity.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <button
                      onClick={() => setDeleteModal({ show: true, activity })}
                      className="text-red-400 hover:text-red-300 p-1"
                      title="Delete Activity"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredActivities.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            No activities found
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-gray-400">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {deleteModal.show && (
        <ConfirmModal
          isOpen={deleteModal.show}
          title="Delete Activity"
          message={`Are you sure you want to delete this activity record? This action cannot be undone.`}
          onConfirm={() => handleDelete(deleteModal.activity._id)}
          onClose={() => setDeleteModal({ show: false, activity: null })}
          confirmText="Delete"
          confirmColor="red"
        />
      )}
    </div>
  );
};

export default AdminActivities;
