import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { Home, User, FolderOpen, Bell, LogOut, Shield } from 'lucide-react';
import VerifiedBadge from './VerifiedBadge.js';

const Sidebar = ({ currentPage }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const menuItems = [
    { icon: Home, label: 'Home', path: '/home', id: 'home' },
    { icon: User, label: 'Profile', path: '/profile', id: 'profile' },
    { icon: FolderOpen, label: 'Projects', path: '/projects', id: 'projects'},
    { icon: Bell, label: 'Notifications', path: '/notifications', id: 'notifications' },
  ];

  // Add admin item if user is admin
  if (user?.isAdmin) {
    menuItems.push({
      icon: Shield,
      label: 'Admin',
      path: '/admin',
      id: 'admin'
    });
  }

  const isActive = (path) => {
    if (currentPage) {
      return currentPage === path.split('/')[1];
    }
    return location.pathname === path;
  };

  return (
    <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-2xl font-bold gradient-text">SyncSphere</h1>
      </div>

      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2">
          {menuItems.map(({ icon: Icon, label, path, id, action }) => (
            <li key={id}>
              <button
                onClick={() => navigate(path)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                  isActive(path)
                    ? 'bg-green-600 text-white shadow-lg'
                    : action 
                      ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center space-x-3">
          {user?.profileImage ? (
            <img
              src={user.profileImage}
              alt={user.username}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-black font-bold">
                {user?.username?.[0]?.toUpperCase()}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-1">
              <p className="text-sm font-medium text-white truncate">
                {user?.firstName} {user?.lastName}
              </p>
              {user?.isVerified && <VerifiedBadge size={14} />}
            </div>
            <p className="text-xs text-gray-400 truncate">@{user?.username}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-gray-400 hover:text-red-400 transition-colors"
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;