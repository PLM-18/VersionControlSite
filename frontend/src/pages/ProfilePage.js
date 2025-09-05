import React, { useState } from 'react';
import { Home, User, Plus, Bell, Search, Edit3, MapPin, Calendar, Mail, Code, Settings } from 'lucide-react';
import Sidebar from '../components/Sidebar.js';

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('Projects');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Mock user data
  const [userProfile, setUserProfile] = useState({
    name: 'John Doe',
    username: '@johndoe',
    bio: 'Passionate developer with 10+ years of experience in full-stack development.',
    role: 'Web Developer',
    location: 'Pretoria, SA',
    birthdate: '1/15/1990',
    email: 'johndoe@gmail.com',
    joinDate: '5/10/2022',
    favoriteLanguages: ['JavaScript', 'TypeScript', 'React', 'Python']
  });

  const projects = [
    {
      id: 1,
      title: 'React Dashboard',
      description: 'A modern dashboard built with React',
      technologies: ['JavaScript', 'React', 'CSS']
    },
    {
      id: 2,
      title: 'API Gateway',
      description: 'A microservices API gateway',
      technologies: ['TypeScript', 'Node.js']
    }
  ];

  const EditProfileModal = () => {
    const [editedProfile, setEditedProfile] = useState(userProfile);

    const handleSave = () => {
      setUserProfile(editedProfile);
      setIsEditModalOpen(false);
    };

    if (!isEditModalOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg p-6 w-96 max-w-md border border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Edit Profile</h2>
            <button 
              onClick={() => setIsEditModalOpen(false)}
              className="text-gray-400 hover:text-gray-200"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
              <input
                type="text"
                value={editedProfile.name}
                onChange={(e) => setEditedProfile({...editedProfile, name: e.target.value})}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Bio</label>
              <textarea
                value={editedProfile.bio}
                onChange={(e) => setEditedProfile({...editedProfile, bio: e.target.value})}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent h-24"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Role</label>
              <input
                type="text"
                value={editedProfile.role}
                onChange={(e) => setEditedProfile({...editedProfile, role: e.target.value})}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 text-gray-300 border border-gray-600 rounded-lg hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      <Sidebar user={userProfile} currentPage="profile" />
      <div className="flex-1">
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search users, projects, or languages..."
                className="pl-10 pr-4 py-2 w-96 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Profile Header with Gradient Background */}
        <div className="relative">
          <div className="h-48 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600"></div>
          
          <div className="absolute -bottom-16 left-8">
            <div className="relative">
              <div className="w-32 h-32 bg-gray-700 rounded-full border-4 border-gray-800 flex items-center justify-center">
                <User className="w-16 h-16 text-gray-300" />
              </div>
              <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-gray-800"></div>
            </div>
          </div>

          <button
            onClick={() => setIsEditModalOpen(true)}
            className="absolute bottom-4 right-8 flex items-center px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors border border-gray-600"
          >
            <Edit3 className="w-4 h-4 mr-2" />
            Edit Profile
          </button>
        </div>

        {/* Profile Info */}
        <div className="mt-20 px-8 pb-6 bg-gray-900">
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold text-white">{userProfile.name}</h1>
            <p className="text-lg text-gray-400 mb-2">{userProfile.username}</p>
            <p className="text-gray-300 mb-4 max-w-2xl">{userProfile.bio}</p>
            
            <div className="flex flex-wrap gap-6 text-sm text-gray-400 mb-6">
              <div className="flex items-center">
                <Code className="w-4 h-4 mr-2" />
                <span>{userProfile.role}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                <span>{userProfile.location}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                <span>Born {userProfile.birthdate}</span>
              </div>
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                <span>{userProfile.email}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                <span>Joined {userProfile.joinDate}</span>
              </div>
            </div>

            {/* Favorite Languages */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-300 mb-2">Favorite Languages</h3>
              <div className="flex flex-wrap gap-2">
                {userProfile.favoriteLanguages.map((lang, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-green-600/20 text-green-400 text-sm rounded-full font-medium border border-green-600/30"
                  >
                    #{lang}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-8 border-b border-gray-700 bg-gray-900">
          <div className="flex space-x-8">
            {['Activities', 'Projects'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-green-500 text-green-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-6 bg-gray-900">
          {activeTab === 'Projects' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:shadow-lg hover:border-gray-600 transition-all cursor-pointer"
                >
                  <h3 className="text-lg font-semibold text-white mb-2">{project.title}</h3>
                  <p className="text-gray-400 text-sm mb-4">{project.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded font-medium border border-gray-600"
                      >
                        #{tech}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {activeTab === 'Activities' && (
            <div className="text-center py-12 text-gray-500">
              <div className="mb-4">
                <Calendar className="w-12 h-12 mx-auto text-gray-600" />
              </div>
              <h3 className="text-lg font-medium mb-2 text-gray-400">No recent activities</h3>
              <p className="text-sm text-gray-500">Your recent activities will appear here</p>
            </div>
          )}
        </div>
      </div>
      
      <EditProfileModal />
    </div>
  );
};

export default ProfilePage;