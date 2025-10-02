import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import Sidebar from '../components/Sidebar.js';
import CreateProjectModal from '../components/CreateProjectModal.js';
import { Plus, Filter, Search, Grid, List, Hash } from 'lucide-react';
import { projectAPI } from '../services/api.js';

const ProjectsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
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
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await projectAPI.getAllProjects();
      setProjects(data);
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (projectData) => {
    try {
      await projectAPI.createProject(projectData);
      await fetchProjects();
      setShowCreateModal(false);
    } catch (err) {
      console.error('Error creating project:', err);
      alert(err.message || 'Failed to create project');
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.hashtags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = !filters.type || project.projectType === filters.type;
    const matchesStatus = !filters.status ||
      (filters.status === 'checked_out' ? project.checkedOutBy : !project.checkedOutBy);

    return matchesSearch && matchesType && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="loading w-8 h-8"></div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    const diffWeeks = Math.floor(diffDays / 7);
    return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      <Sidebar currentPage="projects" />
      
      <div className="flex-1 flex flex-col">
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
                  key={project._id}
                  className={`${
                    viewMode === 'grid'
                      ? 'bg-gray-800 rounded-lg p-6 hover:shadow-lg transition-all cursor-pointer'
                      : 'bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors cursor-pointer'
                  }`}
                  onClick={() => navigate(`/project/${project._id}`)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      {project.projectImage && viewMode === 'grid' && (
                        <img
                          src={project.projectImage}
                          alt={project.title}
                          className="w-full h-32 object-cover rounded-lg mb-3"
                        />
                      )}
                      <h3 className="text-lg font-semibold text-white mb-2">{project.title}</h3>
                      <p className="text-gray-400 text-sm line-clamp-2 mb-3">{project.description}</p>

                      {project.hashtags && project.hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {project.hashtags.slice(0, 3).map((tag, index) => (
                            <span key={index} className="flex items-center text-green-400 text-xs">
                              <Hash size={12} className="mr-1" />
                              {tag}
                            </span>
                          ))}
                          {project.hashtags.length > 3 && (
                            <span className="text-gray-500 text-xs">+{project.hashtags.length - 3} more</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-3">
                      {project.projectType && (
                        <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs">
                          {project.projectType}
                        </span>
                      )}
                      {project.checkedOutBy && (
                        <span className="bg-orange-500/20 text-orange-400 px-2 py-1 rounded text-xs">
                          Checked Out
                        </span>
                      )}
                    </div>
                    <span className="text-gray-500">
                      {formatDate(project.updatedAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
      
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