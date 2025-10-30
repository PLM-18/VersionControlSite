import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar.js';
import { Shield, Users, FolderOpen, Activity, CheckCircle } from 'lucide-react';
import AdminProjects from '../components/admin/AdminProjects.js';
import AdminUsers from '../components/admin/AdminUsers.js';
import AdminActivities from '../components/admin/AdminActivities.js';
import AdminVerifications from '../components/admin/AdminVerifications.js';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('projects');

  // Redirect if not admin
  if (!user?.isAdmin) {
    return <Navigate to="/home" />;
  }

  const tabs = [
    { id: 'projects', label: 'Projects', icon: FolderOpen },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'activities', label: 'Activities', icon: Activity },
    { id: 'verifications', label: 'Verifications', icon: CheckCircle },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'projects':
        return <AdminProjects />;
      case 'users':
        return <AdminUsers />;
      case 'activities':
        return <AdminActivities />;
      case 'verifications':
        return <AdminVerifications />;
      default:
        return <AdminProjects />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      <Sidebar currentPage="admin" />

      <div className="flex-1 flex flex-col">
        <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
          <div className="flex items-center space-x-3">
            <Shield className="text-yellow-400" size={28} />
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-gray-400 text-sm">Manage all aspects of SyncSphere</p>
            </div>
          </div>
        </header>

        <div className="bg-gray-800 border-b border-gray-700">
          <nav className="flex space-x-1 px-6">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-all ${
                  activeTab === id
                    ? 'border-green-500 text-white bg-gray-700/50'
                    : 'border-transparent text-gray-400 hover:text-white hover:bg-gray-700/30'
                }`}
              >
                <Icon size={18} />
                <span className="font-medium">{label}</span>
              </button>
            ))}
          </nav>
        </div>

        <main className="flex-1 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
