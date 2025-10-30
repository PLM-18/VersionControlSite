import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext.js';
import { adminAPI } from '../../services/api.js';
import { CheckCircle, XCircle, Search, Calendar, FolderGit2, GitBranch } from 'lucide-react';
import ConfirmModal from '../ConfirmModal.js';

const AdminVerifications = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [responseModal, setResponseModal] = useState({ show: false, request: null, action: null });

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getVerificationRequests(statusFilter);
      setRequests(data.requests || []);
    } catch (err) {
      console.error('Error fetching verification requests:', err);
      toast.error(err.message || 'Failed to fetch verification requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId, adminResponse) => {
    try {
      await adminAPI.approveVerificationRequest(requestId, adminResponse);
      toast.success('Verification request approved');
      fetchRequests();
      setResponseModal({ show: false, request: null, action: null });
    } catch (err) {
      console.error('Error approving verification:', err);
      toast.error(err.message || 'Failed to approve verification request');
    }
  };

  const handleReject = async (requestId, adminResponse) => {
    try {
      await adminAPI.rejectVerificationRequest(requestId, adminResponse);
      toast.success('Verification request rejected');
      fetchRequests();
      setResponseModal({ show: false, request: null, action: null });
    } catch (err) {
      console.error('Error rejecting verification:', err);
      toast.error(err.message || 'Failed to reject verification request');
    }
  };

  const filteredRequests = requests.filter(request =>
    request.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getAccountAge = (createdAt) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffInDays = Math.floor((now - created) / (1000 * 60 * 60 * 24));
    if (diffInDays < 30) return `${diffInDays} days`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months`;
    return `${Math.floor(diffInDays / 365)} years`;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-500/20 text-yellow-400',
      approved: 'bg-green-500/20 text-green-400',
      rejected: 'bg-red-500/20 text-red-400',
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400';
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
          <h2 className="text-2xl font-bold mb-1">Verification Requests</h2>
          <p className="text-gray-400">Total: {requests.length} requests</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500"
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:border-green-500 focus:ring-1 focus:ring-green-500"
            />
          </div>
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
                  Account Age
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Projects
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Checkouts
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Requested
                </th>
                {statusFilter === 'pending' && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredRequests.map((request) => (
                <tr key={request._id} className="hover:bg-gray-700/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {request.user?.profileImage ? (
                        <img
                          src={request.user.profileImage}
                          alt={request.user.username}
                          className="w-10 h-10 rounded-full mr-3"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mr-3">
                          <span className="text-black font-bold">
                            {request.user?.username?.[0]?.toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-white">{request.user?.username}</div>
                        <div className="text-xs text-gray-400">{request.user?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <Calendar size={14} className="text-gray-400" />
                      <span className="text-sm text-white">
                        {getAccountAge(request.user?.createdAt)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <FolderGit2 size={14} className="text-gray-400" />
                      <span className="text-sm text-white">{request.projectCount || 0}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <GitBranch size={14} className="text-gray-400" />
                      <span className="text-sm text-white">{request.checkoutCount || 0}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {formatDate(request.createdAt)}
                  </td>
                  {statusFilter === 'pending' && (
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setResponseModal({ show: true, request, action: 'approve' })}
                          className="text-green-400 hover:text-green-300 p-1"
                          title="Approve Request"
                        >
                          <CheckCircle size={18} />
                        </button>
                        <button
                          onClick={() => setResponseModal({ show: true, request, action: 'reject' })}
                          className="text-red-400 hover:text-red-300 p-1"
                          title="Reject Request"
                        >
                          <XCircle size={18} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRequests.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            No verification requests found
          </div>
        )}
      </div>

      {responseModal.show && (
        <ResponseModal
          request={responseModal.request}
          action={responseModal.action}
          onConfirm={(adminResponse) => {
            if (responseModal.action === 'approve') {
              handleApprove(responseModal.request._id, adminResponse);
            } else {
              handleReject(responseModal.request._id, adminResponse);
            }
          }}
          onClose={() => setResponseModal({ show: false, request: null, action: null })}
        />
      )}
    </div>
  );
};

const ResponseModal = ({ request, action, onConfirm, onClose }) => {
  const [adminResponse, setAdminResponse] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(adminResponse);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-700">
          <h3 className="text-xl font-bold">
            {action === 'approve' ? 'Approve' : 'Reject'} Verification Request
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            User: {request.user?.username}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {request.requestMessage && (
            <div>
              <label className="block text-sm font-medium mb-2">User's Message</label>
              <div className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-gray-300">
                {request.requestMessage}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">
              Admin Response (optional)
            </label>
            <textarea
              value={adminResponse}
              onChange={(e) => setAdminResponse(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
              rows="4"
              placeholder="Add a message to the user..."
            />
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
              className={`px-4 py-2 rounded-lg transition-colors ${
                action === 'approve'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {action === 'approve' ? 'Approve' : 'Reject'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminVerifications;
