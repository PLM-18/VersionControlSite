import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar.js';
import CreateProjectModal from '../components/CreateProjectModal.js';
import { Plus, Filter, Search, Grid, List } from 'lucide-react';

const ProjectsPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    dateRange: 'all'
  });

  useEffect(() => {
    // Mock user data
    const mockUser = {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      username: 'johndoe',
      email: 'johndoe@gmail.com',
      profileImage: null
    };

    // Mock projects data
    const mockProjects = [
      {
        id: 1,
        name: 'E-commerce Platform',
        description: 'A modern e-commerce platform built with React and Node.js featuring real-time inventory management and payment.',
        type: 'TypeScript',
        hashtags: [],
        status: 'checked_in',
        version: '1.0.0',
        members: [1],
        ownerId: 1,
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 2,
        name: 'Mobile Banking App',
        description: 'Secure mobile banking application with biometric authentication and real-time transaction monitoring.',
        type: 'React Native',
        hashtags: [],
        status: 'checked_in',
        version: '1.0.0',
        members: [1],
        ownerId: 1,
        updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 3,
        name: 'AI Analytics Dashboard',
        description: 'Machine learning powered analytics dashboard for business intelligence and data visualization.',
        type: 'Python',
        hashtags: [],
        status: 'checked_in',
        version: '1.0.0',
        members: [1],
        ownerId: 1,
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    setUser(mockUser);
    setProjects(mockProjects);
    setLoading(false);
  }, []);

  const handleCreateProject = async (projectData) => {
    // Mock create project
    const newProject = {
      id: projects.length + 1,
      name: projectData.name,
      description: projectData.description,
      type: projectData.type,
      hashtags: projectData.hashtags,
      status: 'checked_in',
      version: projectData.version,
      members: [user.id],
      ownerId: user.id,
      updatedAt: new Date().toISOString()
    };
    
    setProjects(prev => [newProject, ...prev]);
    setShowCreateModal(false);
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.hashtags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = !filters.type || project.type === filters.type;
    const matchesStatus = !filters.status || project.status === filters.status;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="loading w-8 h-8"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Sidebar */}
      <Sidebar user={user} currentPage="create-project" />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold">My Projects</h1>
              <span className="text-gray-400">Manage and collaborate on your development projects</span>
            </div>
            
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Plus size={18} />
              <span>New Project</span>
            </button>
          </div>
        </header>

        {/* Search and Filters */}
        <div className="bg-gray-800 px-6 py-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:border-green-500 focus:ring-1 focus:ring-green-500"
                />
              </div>
              
              <div className="relative">
                <button
                  onClick={() => setFilterOpen(!filterOpen)}
                  className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <Filter size={18} />
                  <span>Filter</span>
                </button>
                
                {filterOpen && (
                  <div className="absolute top-12 left-0 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10 p-4 w-64">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Language/Framework</label>
                        <select
                          value={filters.type}
                          onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                        >
                          <option value="">All Languages</option>
                          <option value="TypeScript">TypeScript</option>
                          <option value="React Native">React Native</option>
                          <option value="Python">Python</option>
                          <option value="JavaScript">JavaScript</option>
                          <option value="Java">Java</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                        <select
                          value={filters.status}
                          onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                        >
                          <option value="">All Status</option>
                          <option value="checked_in">Available</option>
                          <option value="checked_out">Checked Out</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'grid' ? 'bg-gray-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'list' ? 'bg-gray-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Projects Grid/List */}
        <main className="flex-1 p-6">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Grid size={64} className="mx-auto mb-4 opacity-30" />
                <h3 className="text-xl font-semibold mb-2">No projects found</h3>
                <p>Create your first project to get started with SyncSphere</p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg transition-colors"
              >
                Create Your First Project
              </button>
            </div>
          ) : (
            <div className={`
              ${viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
                : 'space-y-4'
              }
            `}>
              {filteredProjects.map(project => (
                <div
                  key={project.id}
                  className={viewMode === 'grid' ? 'bg-gray-800 rounded-lg p-6 hover:shadow-lg transition-all cursor-pointer' : ''}
                  onClick={() => navigate(`/project/${project.id}`)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">{project.name}</h3>
                      <p className="text-gray-400 text-sm line-clamp-2">{project.description}</p>
                    </div>
                    {viewMode === 'grid' && (
                      <button className="p-2 text-gray-400 hover:text-white">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                        </svg>
                      </button>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">{project.type}</span>
                    <span className="text-gray-500">
                      {(() => {
                        const hours = Math.floor((Date.now() - new Date(project.updatedAt)) / (1000 * 60 * 60));
                        if (hours < 24) return `${hours} hours ago`;
                        const days = Math.floor(hours / 24);
                        if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
                        return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} ago`;
                      })()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
      
      {/* Create Project Modal */}
      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateProject}
        />
      )}
    </div>
  );
};

export default ProjectsPage;