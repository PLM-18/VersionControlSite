import React, { useState } from 'react';
import { X, Upload, Plus, Trash2 } from 'lucide-react';

const CreateProjectModal = ({ onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'Web Application',
    version: '1.0.0',
    hashtags: [],
    files: []
  });
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);

  const projectTypes = [
    'Web Application',
    'Mobile App',
    'Desktop Application',
    'Library',
    'API',
    'Machine Learning Model',
    'Game',
    'Tool'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.hashtags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        hashtags: [...prev.hashtags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      hashtags: prev.hashtags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      files: [...prev.files, ...files]
    }));
  };

  const handleRemoveFile = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setLoading(true);
    try {
      await onCreate(formData);
    } catch (error) {
      console.error('Error creating project:', error);
    }
    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.target.name === 'tagInput') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Create New Project</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Project Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Project Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:border-green-500 focus:ring-1 focus:ring-green-500"
              placeholder="Enter project name"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:border-green-500 focus:ring-1 focus:ring-green-500"
              placeholder="Describe your project..."
            />
          </div>

          {/* Project Type and Version */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Project Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500"
              >
                {projectTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Version
              </label>
              <input
                type="text"
                name="version"
                value={formData.version}
                onChange={handleInputChange}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:border-green-500 focus:ring-1 focus:ring-green-500"
                placeholder="1.0.0"
              />
            </div>
          </div>

          {/* Hashtags */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Hashtags
            </label>
            <div className="flex items-center space-x-2 mb-3">
              <input
                type="text"
                name="tagInput"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:border-green-500 focus:ring-1 focus:ring-green-500"
                placeholder="Add a hashtag..."
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="bg-green-600 hover:bg-green-700 p-2 rounded-lg transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
            
            {formData.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.hashtags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-gray-700 text-gray-300 px-2 py-1 rounded flex items-center space-x-1"
                  >
                    <span>#{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-gray-400 hover:text-red-400"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Project Files
            </label>
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
              <Upload className="mx-auto mb-2 text-gray-400" size={24} />
              <p className="text-gray-400 mb-2">Drag and drop files here, or click to browse</p>
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg cursor-pointer transition-colors inline-block"
              >
                Choose Files
              </label>
            </div>
            
            {formData.files.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-medium text-gray-300">Selected Files:</h4>
                {formData.files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-700 rounded px-3 py-2">
                    <span className="text-sm text-gray-300">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      className="text-gray-400 hover:text-red-400"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.name.trim() || loading}
              className={`px-6 py-2 rounded-lg transition-colors ${
                !formData.name.trim() || loading
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectModal;