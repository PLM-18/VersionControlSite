import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import Sidebar from '../components/Sidebar.js';
import {
  ArrowLeft,
  Download,
  Users,
  Calendar,
  GitBranch,
  Upload,
  Lock,
  Unlock,
  File,
  Hash
} from 'lucide-react';
import { projectAPI } from '../services/api.js';

const ProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [checkins, setCheckins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showCheckinModal, setShowCheckinModal] = useState(false);
  const [checkinData, setCheckinData] = useState({
    message: '',
    changesDescription: '',
    files: [],
    hashtags: ''
  });

  useEffect(() => {
    if (id) {
      fetchProjectDetails();
      fetchProjectCheckins();
    }
  }, [id]);

  const fetchProjectDetails = async () => {
    try {
      const data = await projectAPI.getProjectById(id);
      setProject(data);
    } catch (err) {
      console.error('Error fetching project:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectCheckins = async () => {
    try {
      const data = await projectAPI.getProjectCheckins(id);
      setCheckins(data);
    } catch (err) {
      console.error('Error fetching checkins:', err);
    }
  };

  const handleCheckout = async () => {
    try {
      await projectAPI.checkoutProject(id);
      await fetchProjectDetails();
      alert('Project checked out successfully!');
    } catch (err) {
      alert(err.message || 'Failed to checkout project');
    }
  };

  const handleCheckin = async (e) => {
    e.preventDefault();
    try {
      const formData = {
        message: checkinData.message,
        changesDescription: checkinData.changesDescription,
        hashtags: checkinData.hashtags.split(',').map(tag => tag.trim()).filter(Boolean),
        files: checkinData.files
      };

      await projectAPI.checkinProject(id, formData);
      setShowCheckinModal(false);
      setCheckinData({ message: '', changesDescription: '', files: [], hashtags: '' });
      await fetchProjectDetails();
      await fetchProjectCheckins();
      alert('Changes checked in successfully!');
    } catch (err) {
      alert(err.message || 'Failed to checkin changes');
    }
  };

  const handleFileChange = (e) => {
    setCheckinData({ ...checkinData, files: Array.from(e.target.files) });
  };

  const handleDownloadFile = (file) => {
    window.open(file.path, '_blank');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOwner = project && user && project.owner._id === user._id;
  const isCheckedOutByUser = project && user && project.checkedOutBy?._id === user._id;
  const isCheckedOut = project && project.checkedOutBy;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading project...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Project not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700 p-6">
          <div className="max-w-6xl mx-auto">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-400 hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back
            </button>

            <div className="flex items-start justify-between">
              <div className="flex-1">
                {project.projectImage && (
                  <img
                    src={project.projectImage}
                    alt={project.title}
                    className="w-24 h-24 rounded-lg object-cover mb-4"
                  />
                )}
                <h1 className="text-3xl font-bold mb-2">{project.title}</h1>
                <p className="text-gray-400 mb-4">{project.description}</p>

                <div className="flex items-center space-x-6 text-sm">
                  <div className="flex items-center text-gray-400">
                    <Users size={16} className="mr-2" />
                    <span>{project.members?.length || 0} members</span>
                  </div>
                  <div className="flex items-center text-gray-400">
                    <Calendar size={16} className="mr-2" />
                    <span>Created {formatDate(project.createdAt)}</span>
                  </div>
                  {project.projectType && (
                    <div className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs">
                      {project.projectType}
                    </div>
                  )}
                </div>

                {project.hashtags && project.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {project.hashtags.map((tag, index) => (
                      <span key={index} className="flex items-center text-green-400 text-sm">
                        <Hash size={14} className="mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col space-y-3">
                {/* Checkout Status */}
                {isCheckedOut ? (
                  <div className="bg-orange-500/20 border border-orange-500/50 rounded-lg p-4">
                    <div className="flex items-center text-orange-400 mb-2">
                      <Lock size={16} className="mr-2" />
                      <span className="font-semibold">Checked Out</span>
                    </div>
                    <p className="text-sm text-gray-400">
                      by {project.checkedOutBy.username}
                    </p>
                    {isCheckedOutByUser && (
                      <button
                        onClick={() => setShowCheckinModal(true)}
                        className="mt-3 w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center"
                      >
                        <Upload size={16} className="mr-2" />
                        Check In Changes
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={handleCheckout}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center justify-center"
                  >
                    <Unlock size={20} className="mr-2" />
                    Check Out Project
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-gray-800 border-b border-gray-700">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 border-b-2 transition-colors ${
                  activeTab === 'overview'
                    ? 'border-green-500 text-white'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('files')}
                className={`py-4 border-b-2 transition-colors ${
                  activeTab === 'files'
                    ? 'border-green-500 text-white'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                Files ({project.files?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`py-4 border-b-2 transition-colors ${
                  activeTab === 'activity'
                    ? 'border-green-500 text-white'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                Activity ({checkins.length})
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-6 py-8">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">Project Members</h2>
                <div className="space-y-3">
                  {project.members?.map((member) => (
                    <div key={member.user._id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {member.user.profileImage ? (
                          <img
                            src={member.user.profileImage}
                            alt={member.user.username}
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-black font-bold">
                              {member.user.username[0].toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{member.user.username}</p>
                          <p className="text-sm text-gray-400">{member.role}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'files' && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Project Files</h2>
              {project.files && project.files.length > 0 ? (
                <div className="space-y-2">
                  {project.files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                      <div className="flex items-center space-x-3">
                        <File size={20} className="text-blue-400" />
                        <div>
                          <p className="font-medium">{file.originalName}</p>
                          <p className="text-sm text-gray-400">
                            {(file.size / 1024).toFixed(2)} KB • {formatDate(file.uploadedAt)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDownloadFile(file)}
                        className="p-2 text-green-400 hover:bg-gray-800 rounded-lg transition-colors"
                      >
                        <Download size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">No files uploaded yet</p>
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold mb-4">Check-in History</h2>
              {checkins.length > 0 ? (
                checkins.map((checkin) => (
                  <div key={checkin._id} className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-start space-x-4">
                      <GitBranch size={20} className="text-green-400 mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <span className="font-medium">{checkin.user.username}</span>
                            <span className="text-sm text-gray-400">
                              {formatDate(checkin.createdAt)}
                            </span>
                          </div>
                        </div>
                        <p className="text-white mb-2">{checkin.message}</p>
                        {checkin.changesDescription && (
                          <p className="text-gray-400 text-sm mb-3">{checkin.changesDescription}</p>
                        )}
                        {checkin.hashtags && checkin.hashtags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {checkin.hashtags.map((tag, index) => (
                              <span key={index} className="flex items-center text-green-400 text-xs">
                                <Hash size={12} className="mr-1" />
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        {checkin.files && checkin.files.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {checkin.files.map((file, index) => (
                              <div key={index} className="flex items-center space-x-2 text-sm text-gray-400">
                                <File size={14} />
                                <span>{file.originalName}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center py-8">No check-ins yet</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Check-in Modal */}
      {showCheckinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Check In Changes</h2>
            <form onSubmit={handleCheckin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Commit Message *</label>
                <input
                  type="text"
                  value={checkinData.message}
                  onChange={(e) => setCheckinData({ ...checkinData, message: e.target.value })}
                  placeholder="Brief description of changes"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Changes Description</label>
                <textarea
                  value={checkinData.changesDescription}
                  onChange={(e) => setCheckinData({ ...checkinData, changesDescription: e.target.value })}
                  placeholder="Detailed description of what changed"
                  rows="4"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Hashtags</label>
                <input
                  type="text"
                  value={checkinData.hashtags}
                  onChange={(e) => setCheckinData({ ...checkinData, hashtags: e.target.value })}
                  placeholder="bug-fix, feature, refactor (comma separated)"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Upload Files</label>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent outline-none"
                />
                {checkinData.files.length > 0 && (
                  <p className="text-sm text-gray-400 mt-2">
                    {checkinData.files.length} file(s) selected
                  </p>
                )}
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCheckinModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                >
                  Check In Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetailPage;
