import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar.js';
import SearchBar from '../components/SearchBar.js';
import ProjectCard from '../components/ProjectCard.js';
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
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/signin');
      return;
    }

    fetchUserProfile();
    fetchUserProjects();
  }, [navigate]);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchUserProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/projects', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const projectsData = await response.json();
        // Filter to only show user's projects
        const userProjects = projectsData.filter(
          project => project.ownerId === user?.id || project.members?.includes(user?.id)
        );
        setProjects(userProjects);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (projectData) => {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      Object.keys(projectData).forEach(key => {
        if (key === 'hashtags') {
          formData.append(key, JSON.stringify(projectData[key]));
        } else if (key === 'files') {
          projectData[key].forEach(file => {
            formData.append('files', file);
          });
        } else {
          formData.append(key, projectData[key]);
        }
      });

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const newProject = await response.json();
        setProjects(prev => [newProject, ...prev]);
        setShowCreateModal(false);
      }
    } catch (error) {
      console.error('Error creating project:', error);
    }
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
      <Sidebar user={user} currentPage="projects" />
      
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
                        <label className="block text-sm font-medium text-gray-300 mb-2">Project Type</label>
                        <select
                          value={filters.type}
                          onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                        >
                          <option value="">All Types</option>
                          <option value="Web Application">Web Application</option>
                          <option value="Mobile App">Mobile App</option>
                          <option value="Desktop Application">Desktop Application</option>
                          <option value="Library">Library</option>
                          <option value="API">API</option>
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
                <ProjectCard 
                  key={project.id} 
                  project={project} 
                  viewMode={viewMode}
                  onUpdate={fetchUserProjects}
                />
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