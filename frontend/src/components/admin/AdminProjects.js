import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext.js';
import { adminAPI } from '../../services/api.js';
import { Trash2, Edit, Search, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import ConfirmModal from '../ConfirmModal.js';

const AdminProjects = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProjects, setTotalProjects] = useState(0);
  const [deleteModal, setDeleteModal] = useState({ show: false, project: null });
  const [editModal, setEditModal] = useState({ show: false, project: null });

  useEffect(() => {
    fetchProjects();
  }, [currentPage]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getAllProjectsAdmin(currentPage, 20);
      setProjects(data.projects);
      setTotalPages(data.totalPages);
      setTotalProjects(data.totalProjects);
    } catch (err) {
      console.error('Error fetching projects:', err);
      toast.error(err.message || 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (projectId) => {
    try {
      await adminAPI.deleteProjectAdmin(projectId);
      toast.success('Project deleted successfully');
      fetchProjects();
      setDeleteModal({ show: false, project: null });
    } catch (err) {
      console.error('Error deleting project:', err);
      toast.error(err.message || 'Failed to delete project');
    }
  };

  const handleUpdate = async (projectId, updates) => {
    try {
      await adminAPI.updateProjectAdmin(projectId, updates);
      toast.success('Project updated successfully');
      fetchProjects();
      setEditModal({ show: false, project: null });
    } catch (err) {
      console.error('Error updating project:', err);
      toast.error(err.message || 'Failed to update project');
    }
  };

  const filteredProjects = projects.filter(project =>
    project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.owner?.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="loading w-8 h-8"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-1">Projects Management</h2>
          <p className="text-gray-400">Total: {totalProjects} projects</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:border-green-500 focus:ring-1 focus:ring-green-500"
          />
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Project
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Owner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredProjects.map((project) => (
                <tr key={project._id} className="hover:bg-gray-700/50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-white">{project.title}</div>
                      <div className="text-sm text-gray-400 truncate max-w-xs">
                        {project.description}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {project.owner?.profileImage ? (
                        <img
                          src={project.owner.profileImage}
                          alt={project.owner.username}
                          className="w-8 h-8 rounded-full mr-2"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mr-2">
                          <span className="text-black font-bold text-sm">
                            {project.owner?.username?.[0]?.toUpperCase()}
                          </span>
                        </div>
                      )}
                      <span className="text-sm text-white">{project.owner?.username}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-medium bg-blue-500/20 text-blue-400 rounded">
                      {project.projectType || 'Other'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {project.checkedOutBy ? (
                      <span className="px-2 py-1 text-xs font-medium bg-orange-500/20 text-orange-400 rounded">
                        Checked Out
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium bg-green-500/20 text-green-400 rounded">
                        Available
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {formatDate(project.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => navigate(`/project/${project._id}`)}
                        className="text-blue-400 hover:text-blue-300 p-1"
                        title="View Project"
                      >
                        <ExternalLink size={18} />
                      </button>
                      <button
                        onClick={() => setEditModal({ show: true, project })}
                        className="text-green-400 hover:text-green-300 p-1"
                        title="Edit Project"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => setDeleteModal({ show: true, project })}
                        className="text-red-400 hover:text-red-300 p-1"
                        title="Delete Project"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            No projects found
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-gray-400">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {deleteModal.show && (
        <ConfirmModal
          title="Delete Project"
          message={`Are you sure you want to delete "${deleteModal.project?.title}"? This action cannot be undone and will delete all associated files.`}
          onConfirm={() => handleDelete(deleteModal.project._id)}
          onCancel={() => setDeleteModal({ show: false, project: null })}
          confirmText="Delete"
          confirmStyle="danger"
        />
      )}

      {editModal.show && (
        <EditProjectModal
          project={editModal.project}
          onSave={(updates) => handleUpdate(editModal.project._id, updates)}
          onClose={() => setEditModal({ show: false, project: null })}
        />
      )}
    </div>
  );
};

const EditProjectModal = ({ project, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    title: project.title || '',
    description: project.description || '',
    projectType: project.projectType || '',
    status: project.status || 'active',
    isPublic: project.isPublic !== undefined ? project.isPublic : true,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-700">
          <h3 className="text-xl font-bold">Edit Project</h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
              rows="4"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Project Type</label>
            <input
              type="text"
              value={formData.projectType}
              onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
            >
              <option value="active">Active</option>
              <option value="archived">Archived</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isPublic"
              checked={formData.isPublic}
              onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="isPublic" className="text-sm">Public Project</label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminProjects;
