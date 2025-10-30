import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext.js';
import { adminAPI } from '../../services/api.js';
import { Trash2, Edit, Search, ChevronLeft, ChevronRight, Shield, CheckCircle } from 'lucide-react';
import ConfirmModal from '../ConfirmModal.js';
import VerifiedBadge from '../VerifiedBadge.js';

const AdminUsers = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [deleteModal, setDeleteModal] = useState({ show: false, user: null });
  const [editModal, setEditModal] = useState({ show: false, user: null });

  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getAllUsers(currentPage, 20);
      setUsers(data.users);
      setTotalPages(data.totalPages);
      setTotalUsers(data.totalUsers);
    } catch (err) {
      console.error('Error fetching users:', err);
      toast.error(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    try {
      await adminAPI.deleteUser(userId);
      toast.success('User deleted successfully');
      fetchUsers();
      setDeleteModal({ show: false, user: null });
    } catch (err) {
      console.error('Error deleting user:', err);
      toast.error(err.message || 'Failed to delete user');
    }
  };

  const handleUpdate = async (userId, updates) => {
    try {
      await adminAPI.updateUser(userId, updates);
      toast.success('User updated successfully');
      fetchUsers();
      setEditModal({ show: false, user: null });
    } catch (err) {
      console.error('Error updating user:', err);
      toast.error(err.message || 'Failed to update user');
    }
  };

  const filteredUsers = users.filter(user =>
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
          <h2 className="text-2xl font-bold mb-1">Users Management</h2>
          <p className="text-gray-400">Total: {totalUsers} users</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search users..."
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
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Projects
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-700/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {user.profileImage ? (
                        <img
                          src={user.profileImage}
                          alt={user.username}
                          className="w-10 h-10 rounded-full mr-3"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mr-3">
                          <span className="text-black font-bold">
                            {user.username?.[0]?.toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-white">{user.username}</span>
                          {user.isVerified && <VerifiedBadge size={14} />}
                          {user.isAdmin && (
                            <Shield className="text-yellow-400" size={14} title="Admin" />
                          )}
                        </div>
                        <div className="text-sm text-gray-400">
                          {user.firstName} {user.lastName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 text-sm text-white">
                    {user.projects?.length || 0}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col space-y-1">
                      {user.isAdmin && (
                        <span className="px-2 py-1 text-xs font-medium bg-yellow-500/20 text-yellow-400 rounded w-fit">
                          Admin
                        </span>
                      )}
                      {user.isVerified && (
                        <span className="px-2 py-1 text-xs font-medium bg-blue-500/20 text-blue-400 rounded w-fit">
                          Verified
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => navigate(`/profile/${user._id}`)}
                        className="text-blue-400 hover:text-blue-300 text-sm"
                        title="View Profile"
                      >
                        View
                      </button>
                      <button
                        onClick={() => setEditModal({ show: true, user })}
                        className="text-green-400 hover:text-green-300 p-1"
                        title="Edit User"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => setDeleteModal({ show: true, user })}
                        className="text-red-400 hover:text-red-300 p-1"
                        title="Delete User"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            No users found
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
          title="Delete User"
          message={`Are you sure you want to delete user "${deleteModal.user?.username}"? This action cannot be undone and will delete all their projects and data.`}
          onConfirm={() => handleDelete(deleteModal.user._id)}
          onCancel={() => setDeleteModal({ show: false, user: null })}
          confirmText="Delete"
          confirmStyle="danger"
        />
      )}

      {editModal.show && (
        <EditUserModal
          user={editModal.user}
          onSave={(updates) => handleUpdate(editModal.user._id, updates)}
          onClose={() => setEditModal({ show: false, user: null })}
        />
      )}
    </div>
  );
};

const EditUserModal = ({ user, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    username: user.username || '',
    email: user.email || '',
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    bio: user.bio || '',
    isAdmin: user.isAdmin || false,
    isVerified: user.isVerified || false,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-700">
          <h3 className="text-xl font-bold">Edit User</h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">First Name</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Last Name</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
              rows="3"
            />
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isAdmin"
                checked={formData.isAdmin}
                onChange={(e) => setFormData({ ...formData, isAdmin: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="isAdmin" className="text-sm flex items-center space-x-1">
                <Shield size={14} className="text-yellow-400" />
                <span>Admin</span>
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isVerified"
                checked={formData.isVerified}
                onChange={(e) => setFormData({ ...formData, isVerified: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="isVerified" className="text-sm flex items-center space-x-1">
                <CheckCircle size={14} className="text-blue-400" />
                <span>Verified</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminUsers;
