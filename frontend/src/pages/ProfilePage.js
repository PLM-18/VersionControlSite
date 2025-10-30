import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import Sidebar from '../components/Sidebar.js';
import ConfirmModal from '../components/ConfirmModal.js';
import VerificationRequestModal from '../components/VerificationRequestModal.js';
import VerifiedBadge from '../components/VerifiedBadge.js';
import {
  Edit3,
  MapPin,
  Calendar,
  Mail,
  Users,
  UserPlus,
  UserMinus,
  UserCheck,
  X,
  Upload,
  Trash2,
  CheckCircle,
  Shield
} from 'lucide-react';
import { userAPI, projectAPI } from '../services/api.js';

const ProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, updateUserProfile, deleteProfile } = useAuth();
  const toast = useToast();

  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('projects');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [editData, setEditData] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    location: '',
    website: '',
    skills: '',
    profileImage: null
  });

  const isOwnProfile = !userId || (currentUser && userId === currentUser._id);

  useEffect(() => {
    fetchProfileData();
  }, [userId]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      let profileData;

      if (isOwnProfile) {
        profileData = await userAPI.getProfile();
        const [projectsData, friendsData, requestsData] = await Promise.all([
          projectAPI.getUserProjects(currentUser._id),
          userAPI.getFriends(),
          userAPI.getFriendRequests()
        ]);
        setProjects(projectsData);
        setFriends(friendsData);
        setFriendRequests(requestsData);
      } else {
        profileData = await userAPI.getUserById(userId);
        const projectsData = await projectAPI.getUserProjects(userId);
        setProjects(projectsData);
      }

      setProfile(profileData);
      setEditData({
        firstName: profileData.firstName || '',
        lastName: profileData.lastName || '',
        bio: profileData.bio || '',
        location: profileData.location || '',
        website: profileData.website || '',
        skills: profileData.skills?.join(', ') || '',
        profileImage: null
      });
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = async (e) => {
    e.preventDefault();
    try {
      const updateData = {
        ...editData,
        skills: editData.skills.split(',').map(s => s.trim()).filter(Boolean)
      };

      await updateUserProfile(updateData);
      setIsEditModalOpen(false);
      await fetchProfileData();
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    }
  };

  const handleSendFriendRequest = async () => {
    try {
      await userAPI.sendFriendRequest(userId);
      toast.success('Friend request sent!');
    } catch (err) {
      toast.error(err.message || 'Failed to send friend request');
    }
  };

  const handleAcceptFriendRequest = async (requestId) => {
    try {
      await userAPI.acceptFriendRequest(requestId);
      await fetchProfileData();
      toast.success('Friend request accepted!');
    } catch (err) {
      toast.error(err.message || 'Failed to accept friend request');
    }
  };

  const handleRejectFriendRequest = async (requestId) => {
    try {
      await userAPI.rejectFriendRequest(requestId);
      await fetchProfileData();
      toast.success('Friend request rejected');
    } catch (err) {
      toast.error(err.message || 'Failed to reject friend request');
    }
  };

  const handleUnfriend = (friendId) => {
    setConfirmAction({
      title: 'Unfriend User',
      message: 'Are you sure you want to remove this user from your friends?',
      confirmText: 'Unfriend',
      confirmColor: 'red',
      onConfirm: async () => {
        try {
          await userAPI.unfriend(friendId);
          await fetchProfileData();
          toast.success('Unfriended successfully');
        } catch (err) {
          toast.error(err.message || 'Failed to unfriend');
        }
      }
    });
  };

  const handleImageChange = (e) => {
    setEditData({ ...editData, profileImage: e.target.files[0] });
  };

  const handleDeleteProfile = () => {
    setConfirmAction({
      title: 'Delete Profile',
      message: 'Are you sure you want to delete your profile? This action cannot be undone and all your data will be permanently removed.',
      confirmText: 'Delete Profile',
      confirmColor: 'red',
      onConfirm: async () => {
        try {
          await deleteProfile();
          toast.success('Profile deleted successfully');
          navigate('/');
        } catch (err) {
          toast.error(err.message || 'Failed to delete profile');
        }
      }
    });
  };

  const isFriend = friends.some(f => f._id === userId);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Profile not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        <div className="bg-gradient-to-r from-green-600 to-blue-600 h-48"></div>

        <div className="max-w-6xl mx-auto px-6 -mt-20">
          <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-6">
                {profile.profileImage ? (
                  <img
                    src={profile.profileImage}
                    alt={profile.username}
                    className="w-32 h-32 rounded-full border-4 border-gray-900 object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full border-4 border-gray-900 bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center">
                    <span className="text-black font-bold text-4xl">
                      {profile.username?.[0]?.toUpperCase()}
                    </span>
                  </div>
                )}

                <div className="flex-1 pt-4">
                  <div className="flex items-center space-x-2 mb-1">
                    <h1 className="text-3xl font-bold">
                      {profile.firstName} {profile.lastName}
                    </h1>
                    {profile.isVerified && <VerifiedBadge size={24} />}
                    {profile.isAdmin && (
                      <Shield className="text-yellow-400" size={20} title="Administrator" />
                    )}
                  </div>
                  <p className="text-gray-400 mb-3">@{profile.username}</p>

                  {profile.bio && (
                    <p className="text-gray-300 mb-4 max-w-2xl">{profile.bio}</p>
                  )}

                  <div className="flex flex-wrap gap-4 text-sm">
                    {profile.location && (
                      <div className="flex items-center text-gray-400">
                        <MapPin size={16} className="mr-2" />
                        {profile.location}
                      </div>
                    )}
                    {profile.email && (
                      <div className="flex items-center text-gray-400">
                        <Mail size={16} className="mr-2" />
                        {profile.email}
                      </div>
                    )}
                    <div className="flex items-center text-gray-400">
                      <Calendar size={16} className="mr-2" />
                      Joined {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </div>
                  </div>

                  {profile.skills && profile.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {profile.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col space-y-2 pt-4">
                {isOwnProfile ? (
                  <>
                    <button
                      onClick={() => setIsEditModalOpen(true)}
                      className="flex items-center space-x-2 px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      <Edit3 size={16} />
                      <span>Edit Profile</span>
                    </button>
                    {!profile.isVerified && !profile.isAdmin && (
                      <button
                        onClick={() => setShowVerificationModal(true)}
                        className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                      >
                        <CheckCircle size={16} />
                        <span>Request Verification</span>
                      </button>
                    )}
                    <button
                      onClick={handleDeleteProfile}
                      className="flex items-center space-x-2 px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                      <span>Delete Profile</span>
                    </button>
                  </>
                ) : (
                  <>
                    {isFriend ? (
                      <button
                        onClick={() => handleUnfriend(userId)}
                        className="flex items-center space-x-2 px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                      >
                        <UserMinus size={16} />
                        <span>Unfriend</span>
                      </button>
                    ) : (
                      <button
                        onClick={handleSendFriendRequest}
                        className="flex items-center space-x-2 px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                      >
                        <UserPlus size={16} />
                        <span>Add Friend</span>
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 bg-gray-800 rounded-lg">
            <div className="flex border-b border-gray-700">
              <button
                onClick={() => setActiveTab('projects')}
                className={`px-6 py-4 font-medium transition-colors ${
                  activeTab === 'projects'
                    ? 'text-green-400 border-b-2 border-green-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Projects ({projects.length})
              </button>
              {isOwnProfile && (
                <>
                  <button
                    onClick={() => setActiveTab('friends')}
                    className={`px-6 py-4 font-medium transition-colors ${
                      activeTab === 'friends'
                        ? 'text-green-400 border-b-2 border-green-400'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Friends ({friends.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('requests')}
                    className={`px-6 py-4 font-medium transition-colors ${
                      activeTab === 'requests'
                        ? 'text-green-400 border-b-2 border-green-400'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Friend Requests ({friendRequests.length})
                  </button>
                </>
              )}
            </div>

            <div className="p-6">
              {activeTab === 'projects' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {projects.length > 0 ? (
                    projects.map((project) => (
                      <div
                        key={project._id}
                        onClick={() => navigate(`/project/${project._id}`)}
                        className="bg-gray-700 rounded-lg p-6 hover:bg-gray-600 transition-colors cursor-pointer"
                      >
                        {project.projectImage && (
                          <img
                            src={project.projectImage}
                            alt={project.title}
                            className="w-full h-32 object-cover rounded-lg mb-4"
                          />
                        )}
                        <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                        <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                          {project.description}
                        </p>
                        {project.projectType && (
                          <span className="inline-block px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">
                            {project.projectType}
                          </span>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 col-span-2 text-center py-8">
                      No projects yet
                    </p>
                  )}
                </div>
              )}

              {activeTab === 'friends' && (
                <div className="space-y-3">
                  {friends.length > 0 ? (
                    friends.map((friend) => (
                      <div
                        key={friend._id}
                        className="flex items-center justify-between p-4 bg-gray-700 rounded-lg"
                      >
                        <div
                          onClick={() => navigate(`/profile/${friend._id}`)}
                          className="flex items-center space-x-4 flex-1 cursor-pointer hover:opacity-80"
                        >
                          {friend.profileImage ? (
                            <img
                              src={friend.profileImage}
                              alt={friend.username}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center">
                              <span className="text-black font-bold">
                                {friend.username[0].toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="font-medium">
                              {friend.firstName} {friend.lastName}
                            </p>
                            <p className="text-sm text-gray-400">@{friend.username}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleUnfriend(friend._id)}
                          className="p-2 text-red-400 hover:bg-gray-600 rounded-lg transition-colors"
                        >
                          <UserMinus size={20} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-center py-8">No friends yet</p>
                  )}
                </div>
              )}

              {activeTab === 'requests' && (
                <div className="space-y-3">
                  {friendRequests.length > 0 ? (
                    friendRequests.map((request) => (
                      <div
                        key={request._id}
                        className="flex items-center justify-between p-4 bg-gray-700 rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          {request.from.profileImage ? (
                            <img
                              src={request.from.profileImage}
                              alt={request.from.username}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center">
                              <span className="text-black font-bold">
                                {request.from.username[0].toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="font-medium">
                              {request.from.firstName} {request.from.lastName}
                            </p>
                            <p className="text-sm text-gray-400">@{request.from.username}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleAcceptFriendRequest(request._id)}
                            className="p-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                          >
                            <UserCheck size={20} />
                          </button>
                          <button
                            onClick={() => handleRejectFriendRequest(request._id)}
                            className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                          >
                            <X size={20} />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-center py-8">No pending requests</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>
            <form onSubmit={handleEditProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">First Name</label>
                  <input
                    type="text"
                    value={editData.firstName}
                    onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Last Name</label>
                  <input
                    type="text"
                    value={editData.lastName}
                    onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Bio</label>
                <textarea
                  value={editData.bio}
                  onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                  rows="4"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Location</label>
                <input
                  type="text"
                  value={editData.location}
                  onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Website</label>
                <input
                  type="url"
                  value={editData.website}
                  onChange={(e) => setEditData({ ...editData, website: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Skills (comma separated)</label>
                <input
                  type="text"
                  value={editData.skills}
                  onChange={(e) => setEditData({ ...editData, skills: e.target.value })}
                  placeholder="JavaScript, React, Node.js"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Profile Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent outline-none"
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
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

      {showVerificationModal && (
        <VerificationRequestModal
          onClose={() => setShowVerificationModal(false)}
          onSuccess={() => {
            fetchProfileData();
            setShowVerificationModal(false);
          }}
        />
      )}
    </div>
  );
};

export default ProfilePage;
