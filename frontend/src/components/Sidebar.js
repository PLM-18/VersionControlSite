import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, User, FolderOpen, Bell, Plus, LogOut } from 'lucide-react';

const Sidebar = ({ user, currentPage }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const menuItems = [
    { icon: Home, label: 'Home', path: '/home', id: 'home' },
    { icon: User, label: 'Profile', path: '/profile', id: 'profile' },
    { icon: FolderOpen, label: 'Create Project', path: '/create-project', id: 'create'},
    { icon: Bell, label: 'Notifications', path: '/notifications', id: 'notifications' },
  ];

  const isActive = (path) => {
    console.log('Current Page:', currentPage, 'Path:', path, 'Location:', location.pathname);
    if (currentPage) {
      return currentPage === path.split('/')[1];
    }
    return location.pathname === path;
  };

  return (
    <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-2xl font-bold gradient-text">SyncSphere</h1>
      </div>

      {/* Navigation */}
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

      {/* User Profile Section */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center space-x-3 mb-4">
          <img 
            src={user?.profileImage || '/api/placeholder/40/40'} 
            alt={user?.firstName} 
            className="w-10 h-10 rounded-full"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.firstName} {user?.lastName}
            </p>
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