import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext.js';
import { adminAPI } from '../../services/api.js';
import { Trash2, Edit, Search, Plus, Tag } from 'lucide-react';
import ConfirmModal from '../ConfirmModal.js';

const AdminProjectTypes = () => {
  const toast = useToast();
  const [projectTypes, setProjectTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModal, setDeleteModal] = useState({ show: false, type: null });
  const [editModal, setEditModal] = useState({ show: false, type: null });
  const [addModal, setAddModal] = useState(false);

  useEffect(() => {
    fetchProjectTypes();
  }, []);

  const fetchProjectTypes = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getAllProjectTypes();
      setProjectTypes(data.projectTypes || []);
    } catch (err) {
      console.error('Error fetching project types:', err);
      toast.error(err.message || 'Failed to fetch project types');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (typeId) => {
    try {
      await adminAPI.deleteProjectType(typeId);
      toast.success('Project type deleted successfully');
      fetchProjectTypes();
      setDeleteModal({ show: false, type: null });
    } catch (err) {
      console.error('Error deleting project type:', err);
      toast.error(err.message || 'Failed to delete project type');
    }
  };

  const handleUpdate = async (typeId, updates) => {
    try {
      await adminAPI.updateProjectType(typeId, updates);
      toast.success('Project type updated successfully');
      fetchProjectTypes();
      setEditModal({ show: false, type: null });
    } catch (err) {
      console.error('Error updating project type:', err);
      toast.error(err.message || 'Failed to update project type');
    }
  };

  const handleCreate = async (typeData) => {
    try {
      await adminAPI.createProjectType(typeData);
      toast.success('Project type created successfully');
      fetchProjectTypes();
      setAddModal(false);
    } catch (err) {
      console.error('Error creating project type:', err);
      toast.error(err.message || 'Failed to create project type');
    }
  };

  const filteredTypes = projectTypes.filter(type =>
    type.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    type.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h2 className="text-2xl font-bold mb-1">Project Types Management</h2>
          <p className="text-gray-400">Total: {projectTypes.length} types</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search types..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:border-green-500 focus:ring-1 focus:ring-green-500"
            />
          </div>
          <button
            onClick={() => setAddModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
          >
            <Plus size={18} />
            <span>Add Type</span>
          </button>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Color
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredTypes.map((type) => (
                <tr key={type._id} className="hover:bg-gray-700/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <Tag size={16} className="text-gray-400" />
                      <span className="text-sm font-medium text-white">{type.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-400">
                      {type.description || 'No description'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-6 h-6 rounded border border-gray-600"
                        style={{ backgroundColor: type.color || '#6B7280' }}
                        title={type.color || '#6B7280'}
                      />
                      <span className="text-sm text-gray-400 font-mono">
                        {type.color || '#6B7280'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => setEditModal({ show: true, type })}
                        className="text-green-400 hover:text-green-300 p-1"
                        title="Edit Type"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => setDeleteModal({ show: true, type })}
                        className="text-red-400 hover:text-red-300 p-1"
                        title="Delete Type"
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

        {filteredTypes.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            No project types found
          </div>
        )}
      </div>

      {deleteModal.show && (
        <ConfirmModal
          isOpen={deleteModal.show}
          title="Delete Project Type"
          message={`Are you sure you want to delete the project type "${deleteModal.type?.name}"? This action cannot be undone.`}
          onConfirm={() => handleDelete(deleteModal.type._id)}
          onClose={() => setDeleteModal({ show: false, type: null })}
          confirmText="Delete"
          confirmColor="red"
        />
      )}

      {editModal.show && (
        <ProjectTypeModal
          type={editModal.type}
          onSave={(updates) => handleUpdate(editModal.type._id, updates)}
          onClose={() => setEditModal({ show: false, type: null })}
          title="Edit Project Type"
        />
      )}

      {addModal && (
        <ProjectTypeModal
          onSave={handleCreate}
          onClose={() => setAddModal(false)}
          title="Add Project Type"
        />
      )}
    </div>
  );
};

const ProjectTypeModal = ({ type, onSave, onClose, title }) => {
  const [formData, setFormData] = useState({
    name: type?.name || '',
    description: type?.description || '',
    color: type?.color || '#6B7280',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const colorPresets = [
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Green', value: '#10B981' },
    { name: 'Purple', value: '#8B5CF6' },
    { name: 'Pink', value: '#EC4899' },
    { name: 'Orange', value: '#F59E0B' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Teal', value: '#14B8A6' },
    { name: 'Indigo', value: '#6366F1' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-700">
          <h3 className="text-xl font-bold">{title}</h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
              required
              placeholder="e.g., Web Application, Mobile App"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
              rows="3"
              placeholder="Brief description of this project type..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Color</label>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-12 h-12 bg-gray-700 border border-gray-600 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white font-mono"
                  placeholder="#6B7280"
                  pattern="^#[0-9A-Fa-f]{6}$"
                />
              </div>

              <div className="grid grid-cols-4 gap-2">
                {colorPresets.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, color: preset.value })}
                    className="flex items-center space-x-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors border border-gray-600"
                  >
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: preset.value }}
                    />
                    <span className="text-xs text-white">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-700">
            <div className="flex items-center space-x-3 p-4 bg-gray-700/50 rounded-lg">
              <Tag size={20} style={{ color: formData.color }} />
              <div>
                <div className="text-sm font-medium text-white">{formData.name || 'Preview'}</div>
                <div className="text-xs text-gray-400">{formData.description || 'No description'}</div>
              </div>
            </div>
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
              {type ? 'Save Changes' : 'Create Type'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminProjectTypes;
