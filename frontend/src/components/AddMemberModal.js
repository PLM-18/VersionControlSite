import React, { useState } from 'react';
import { X, Search, UserPlus } from 'lucide-react';
import { userAPI } from '../services/api.js';

const AddMemberModal = ({ onClose, onAdd, currentMembers = [] }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const results = await userAPI.searchUsers(searchQuery);
      // Filter out users who are already members
      const currentMemberIds = currentMembers.map(m => m.user._id || m.user);
      const filteredResults = results.filter(user => !currentMemberIds.includes(user._id));
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Error searching users:', error);
      alert(error.message || 'Failed to search users');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!selectedUser) return;
    await onAdd(selectedUser._id);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Add Project Member</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSearch} className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Search for users
            </label>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:border-green-500 focus:ring-1 focus:ring-green-500"
                  placeholder="Search by username or email..."
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg transition-colors disabled:bg-gray-600"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>

          {searchResults.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-300 mb-3">Search Results</h3>
              {searchResults.map((user) => (
                <div
                  key={user._id}
                  onClick={() => setSelectedUser(user)}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedUser?._id === user._id
                      ? 'bg-green-600/20 border border-green-500'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {user.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt={user.username}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-black font-bold">
                          {user.username[0].toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-white">{user.username}</p>
                      <p className="text-sm text-gray-400">{user.email}</p>
                    </div>
                  </div>
                  {selectedUser?._id === user._id && (
                    <div className="text-green-400">
                      <UserPlus size={20} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {searchResults.length === 0 && searchQuery && !loading && (
            <div className="text-center py-8 text-gray-400">
              No users found matching "{searchQuery}"
            </div>
          )}
        </div>

        <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAddMember}
            disabled={!selectedUser}
            className={`px-6 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
              !selectedUser
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            <UserPlus size={18} />
            <span>Add Member</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddMemberModal;
