import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import Sidebar from '../components/Sidebar.js';
import AddMemberModal from '../components/AddMemberModal.js';
import EditProjectModal from '../components/EditProjectModal.js';
import FileViewerModal from '../components/FileViewerModal.js';
import ConfirmModal from '../components/ConfirmModal.js';
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
  Hash,
  UserPlus,
  X,
  Edit,
  Trash2,
  Settings,
  MessageSquare,
  Send,
  ThumbsUp,
  CheckCircle,
  Pin,
  UserCog
} from 'lucide-react';
import { projectAPI, discussionAPI } from '../services/api.js';

const ProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const [project, setProject] = useState(null);
  const [checkins, setCheckins] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showCheckinModal, setShowCheckinModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFileViewer, setShowFileViewer] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [showCreateDiscussion, setShowCreateDiscussion] = useState(false);
  const [showTransferOwnership, setShowTransferOwnership] = useState(false);
  const [selectedNewOwner, setSelectedNewOwner] = useState('');
  const [checkinData, setCheckinData] = useState({
    message: '',
    changesDescription: '',
    files: [],
    hashtags: ''
  });
  const [discussionData, setDiscussionData] = useState({
    title: '',
    content: '',
    tags: ''
  });
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    if (id) {
      fetchProjectDetails();
      fetchProjectCheckins();
      if (activeTab === 'discussions') {
        fetchDiscussions();
      }
    }
  }, [id, activeTab]);

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

  const fetchDiscussions = async () => {
    try {
      const data = await discussionAPI.getProjectDiscussions(id);
      setDiscussions(data.discussions || []);
    } catch (err) {
      console.error('Error fetching discussions:', err);
    }
  };

  const handleCheckout = async () => {
    try {
      await projectAPI.checkoutProject(id);
      await fetchProjectDetails();
      toast.success('Project checked out successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to checkout project');
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
      toast.success('Changes checked in successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to checkin changes');
    }
  };

  const handleFileChange = (e) => {
    setCheckinData({ ...checkinData, files: Array.from(e.target.files) });
  };

  const handleDownloadFile = (file) => {
    fetch(file.path)
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.originalName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      })
      .catch(err => {
        console.error('Error downloading file:', err);
        toast.error('Failed to download file');
      });
  };

  const handleAddMember = async (userId) => {
    try {
      await projectAPI.addProjectMember(id, userId);
      await fetchProjectDetails();
      setShowAddMemberModal(false);
      toast.success('Member added successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to add member');
    }
  };

  const handleRemoveMember = (memberId) => {
    setConfirmAction({
      title: 'Remove Member',
      message: 'Are you sure you want to remove this member from the project?',
      confirmText: 'Remove',
      confirmColor: 'red',
      onConfirm: async () => {
        try {
          await projectAPI.removeProjectMember(id, memberId);
          await fetchProjectDetails();
          toast.success('Member removed successfully!');
        } catch (err) {
          toast.error(err.message || 'Failed to remove member');
        }
      }
    });
  };

  const handleDeleteProject = () => {
    setConfirmAction({
      title: 'Delete Project',
      message: 'Are you sure you want to delete this project? This action cannot be undone.',
      confirmText: 'Delete',
      confirmColor: 'red',
      onConfirm: async () => {
        try {
          await projectAPI.deleteProject(id);
          toast.success('Project deleted successfully!');
          navigate('/projects');
        } catch (err) {
          toast.error(err.message || 'Failed to delete project');
        }
      }
    });
  };

  const handleUpdateProject = async (updateData) => {
    try {
      await projectAPI.updateProject(id, updateData);
      await fetchProjectDetails();
      setShowEditModal(false);
      toast.success('Project updated successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to update project');
    }
  };

  const handleDeleteFile = (fileId) => {
    setConfirmAction({
      title: 'Delete File',
      message: 'Are you sure you want to delete this file?',
      confirmText: 'Delete',
      confirmColor: 'red',
      onConfirm: async () => {
        try {
          await projectAPI.deleteFile(id, fileId);
          await fetchProjectDetails();
          toast.success('File deleted successfully!');
        } catch (err) {
          toast.error(err.message || 'Failed to delete file');
        }
      }
    });
  };

  const handleFileClick = (file) => {
    setSelectedFile(file);
    setShowFileViewer(true);
  };

  const handleFileUpdate = async (projectId, updateData) => {
    try {
      await projectAPI.checkinProject(projectId, updateData);
      await fetchProjectDetails();
      await fetchProjectCheckins();
      setShowFileViewer(false);
      toast.success('File updated successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to update file');
    }
  };

  const handleCreateDiscussion = async (e) => {
    e.preventDefault();
    try {
      await discussionAPI.createDiscussion({
        projectId: id,
        title: discussionData.title,
        content: discussionData.content,
        tags: discussionData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      });
      setShowCreateDiscussion(false);
      setDiscussionData({ title: '', content: '', tags: '' });
      await fetchDiscussions();
      toast.success('Discussion created successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to create discussion');
    }
  };

  const handleAddComment = async (discussionId) => {
    if (!commentText.trim()) return;
    try {
      await discussionAPI.addComment(discussionId, commentText);
      setCommentText('');
      const updatedDiscussion = await discussionAPI.getDiscussionById(discussionId);
      setSelectedDiscussion(updatedDiscussion);
      toast.success('Comment added successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to add comment');
    }
  };

  const handleDeleteDiscussion = (discussionId) => {
    setConfirmAction({
      title: 'Delete Discussion',
      message: 'Are you sure you want to delete this discussion? This action cannot be undone.',
      confirmText: 'Delete',
      confirmColor: 'red',
      onConfirm: async () => {
        try {
          await discussionAPI.deleteDiscussion(discussionId);
          setSelectedDiscussion(null);
          await fetchDiscussions();
          toast.success('Discussion deleted successfully!');
        } catch (err) {
          toast.error(err.message || 'Failed to delete discussion');
        }
      }
    });
  };

  const handleTransferOwnership = async () => {
    if (!selectedNewOwner) {
      toast.error('Please select a new owner');
      return;
    }

    setConfirmAction({
      title: 'Transfer Ownership',
      message: 'Are you sure you want to transfer ownership of this project? You will become a regular member.',
      confirmText: 'Transfer',
      confirmColor: 'yellow',
      onConfirm: async () => {
        try {
          await projectAPI.transferOwnership(id, selectedNewOwner);
          await fetchProjectDetails();
          setShowTransferOwnership(false);
          setSelectedNewOwner('');
          toast.success('Ownership transferred successfully!');
        } catch (err) {
          toast.error(err.message || 'Failed to transfer ownership');
        }
      }
    });
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
                {isOwner && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowEditModal(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                      title="Edit Project"
                    >
                      <Edit size={18} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={handleDeleteProject}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                      title="Delete Project"
                    >
                      <Trash2 size={18} />
                      <span>Delete</span>
                    </button>
                  </div>
                )}

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
                onClick={() => setActiveTab('discussions')}
                className={`py-4 border-b-2 transition-colors flex items-center space-x-2 ${
                  activeTab === 'discussions'
                    ? 'border-green-500 text-white'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <MessageSquare size={18} />
                <span>Discussions ({discussions.length})</span>
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

        <div className="max-w-6xl mx-auto px-6 py-8">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Project Members</h2>
                  {isOwner && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setShowAddMemberModal(true)}
                        className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                      >
                        <UserPlus size={18} />
                        <span>Add Member</span>
                      </button>
                      <button
                        onClick={() => setShowTransferOwnership(true)}
                        className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                        title="Transfer Ownership"
                      >
                        <UserCog size={18} />
                        <span>Transfer Ownership</span>
                      </button>
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  {project.members && project.members.length > 0 ? (
                    project.members.map((member) => (
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
                        {isOwner && member.role !== 'owner' && (
                          <button
                            onClick={() => handleRemoveMember(member.user._id)}
                            className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                            title="Remove member"
                          >
                            <X size={18} />
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-center py-4">No members yet</p>
                  )}
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
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer group">
                      <div className="flex items-center space-x-3 flex-1" onClick={() => handleFileClick(file)}>
                        <File size={20} className="text-blue-400" />
                        <div>
                          <p className="font-medium">{file.originalName}</p>
                          <p className="text-sm text-gray-400">
                            {(file.size / 1024).toFixed(2)} KB • {formatDate(file.uploadedAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadFile(file);
                          }}
                          className="p-2 text-green-400 hover:bg-gray-800 rounded-lg transition-colors"
                          title="Download"
                        >
                          <Download size={20} />
                        </button>
                        {isOwner && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteFile(file._id);
                            }}
                            className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            title="Delete"
                          >
                            <Trash2 size={20} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">No files uploaded yet</p>
              )}
            </div>
          )}

          {activeTab === 'discussions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Discussions</h2>
                <button
                  onClick={() => setShowCreateDiscussion(true)}
                  className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <MessageSquare size={18} />
                  <span>New Discussion</span>
                </button>
              </div>

              {!selectedDiscussion ? (
                <div className="space-y-3">
                  {discussions.length > 0 ? (
                    discussions.map((discussion) => (
                      <div
                        key={discussion._id}
                        onClick={() => setSelectedDiscussion(discussion)}
                        className="bg-gray-800 rounded-lg p-6 cursor-pointer hover:bg-gray-750 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              {discussion.isPinned && (
                                <Pin size={16} className="text-yellow-400" />
                              )}
                              {discussion.isResolved && (
                                <CheckCircle size={16} className="text-green-400" />
                              )}
                              <h3 className="text-lg font-semibold text-white">{discussion.title}</h3>
                            </div>
                            <p className="text-gray-400 text-sm mb-3 line-clamp-2">{discussion.content}</p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span>{discussion.author?.username || 'Unknown'}</span>
                              <span>{formatDate(discussion.createdAt)}</span>
                              <span>{discussion.commentCount || discussion.comments?.length || 0} comments</span>
                              {discussion.views > 0 && <span>{discussion.views} views</span>}
                            </div>
                            {discussion.tags && discussion.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-3">
                                {discussion.tags.map((tag, index) => (
                                  <span key={index} className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-center py-8">No discussions yet. Start one!</p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <button
                    onClick={() => setSelectedDiscussion(null)}
                    className="flex items-center text-gray-400 hover:text-white mb-4 transition-colors"
                  >
                    <ArrowLeft size={20} className="mr-2" />
                    Back to discussions
                  </button>

                  <div className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {selectedDiscussion.isPinned && (
                            <Pin size={18} className="text-yellow-400" />
                          )}
                          {selectedDiscussion.isResolved && (
                            <CheckCircle size={18} className="text-green-400" />
                          )}
                          <h2 className="text-2xl font-bold">{selectedDiscussion.title}</h2>
                        </div>
                        <p className="text-gray-300 mb-4">{selectedDiscussion.content}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{selectedDiscussion.author?.username || 'Unknown'}</span>
                          <span>{formatDate(selectedDiscussion.createdAt)}</span>
                        </div>
                      </div>
                      {(selectedDiscussion.author?._id === user?._id || isOwner) && (
                        <button
                          onClick={() => handleDeleteDiscussion(selectedDiscussion._id)}
                          className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={20} />
                        </button>
                      )}
                    </div>

                    <div className="border-t border-gray-700 pt-6 mt-6">
                      <h3 className="text-lg font-semibold mb-4">
                        Comments ({selectedDiscussion.comments?.length || 0})
                      </h3>

                      <div className="space-y-4 mb-6">
                        {selectedDiscussion.comments && selectedDiscussion.comments.length > 0 ? (
                          selectedDiscussion.comments.map((comment) => (
                            <div
                              key={comment._id}
                              className={`p-4 rounded-lg ${
                                comment.isSolution ? 'bg-green-500/10 border border-green-500/30' : 'bg-gray-700'
                              }`}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium text-white">
                                    {comment.author?.username || 'Unknown'}
                                  </span>
                                  {comment.isSolution && (
                                    <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs flex items-center space-x-1">
                                      <CheckCircle size={12} />
                                      <span>Solution</span>
                                    </span>
                                  )}
                                  <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
                                </div>
                              </div>
                              <p className="text-gray-300">{comment.content}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 text-center py-4">No comments yet</p>
                        )}
                      </div>

                      {!selectedDiscussion.isLocked && (
                        <div className="flex items-start space-x-3">
                          <textarea
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Add a comment..."
                            rows="3"
                            className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-green-500 focus:ring-1 focus:ring-green-500 resize-none"
                          />
                          <button
                            onClick={() => handleAddComment(selectedDiscussion._id)}
                            className="bg-green-600 hover:bg-green-700 px-4 py-3 rounded-lg transition-colors"
                            disabled={!commentText.trim()}
                          >
                            <Send size={20} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
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

      {showAddMemberModal && (
        <AddMemberModal
          onClose={() => setShowAddMemberModal(false)}
          onAdd={handleAddMember}
          currentMembers={project.members || []}
        />
      )}

      {showEditModal && (
        <EditProjectModal
          project={project}
          onClose={() => setShowEditModal(false)}
          onUpdate={handleUpdateProject}
        />
      )}

      {showCreateDiscussion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">New Discussion</h2>
            <form onSubmit={handleCreateDiscussion} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title *</label>
                <input
                  type="text"
                  value={discussionData.title}
                  onChange={(e) => setDiscussionData({ ...discussionData, title: e.target.value })}
                  placeholder="What would you like to discuss?"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description *</label>
                <textarea
                  value={discussionData.content}
                  onChange={(e) => setDiscussionData({ ...discussionData, content: e.target.value })}
                  placeholder="Provide more details about your discussion..."
                  rows="6"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent outline-none resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tags</label>
                <input
                  type="text"
                  value={discussionData.tags}
                  onChange={(e) => setDiscussionData({ ...discussionData, tags: e.target.value })}
                  placeholder="question, bug, feature (comma separated)"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent outline-none"
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateDiscussion(false)}
                  className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                >
                  Create Discussion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showFileViewer && selectedFile && (
        <FileViewerModal
          file={selectedFile}
          projectId={id}
          onClose={() => {
            setShowFileViewer(false);
            setSelectedFile(null);
          }}
          onUpdate={handleFileUpdate}
        />
      )}

      {showTransferOwnership && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6">Transfer Ownership</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Select New Owner *</label>
                <select
                  value={selectedNewOwner}
                  onChange={(e) => setSelectedNewOwner(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none"
                >
                  <option value="">Choose a member...</option>
                  {project.members
                    ?.filter(member => member.role !== 'owner')
                    .map((member) => (
                      <option key={member.user._id} value={member.user._id}>
                        {member.user.username} ({member.role})
                      </option>
                    ))}
                </select>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <p className="text-yellow-400 text-sm">
                  <strong>Warning:</strong> Transferring ownership will make you a regular member.
                  Only the new owner will be able to manage project settings, delete the project, or transfer ownership again.
                </p>
              </div>
              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowTransferOwnership(false);
                    setSelectedNewOwner('');
                  }}
                  className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleTransferOwnership}
                  disabled={!selectedNewOwner}
                  className="flex-1 px-6 py-3 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  Transfer Ownership
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmAction && (
        <ConfirmModal
          isOpen={!!confirmAction}
          onClose={() => setConfirmAction(null)}
          onConfirm={confirmAction.onConfirm}
          title={confirmAction.title}
          message={confirmAction.message}
          confirmText={confirmAction.confirmText}
          confirmColor={confirmAction.confirmColor}
        />
      )}
    </div>
  );
};

export default ProjectDetailPage;
