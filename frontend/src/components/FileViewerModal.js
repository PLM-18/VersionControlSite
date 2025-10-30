import React, { useState, useEffect } from 'react';
import { X, Download, Edit, Upload } from 'lucide-react';

const FileViewerModal = ({ file, onClose, onUpdate, projectId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [fileContent, setFileContent] = useState('');
  const [loadingContent, setLoadingContent] = useState(false);
  const [updateData, setUpdateData] = useState({
    message: '',
    changesDescription: '',
    updatedFile: null,
  });

  const isTextFile = file.originalName.match(/\.(txt|md|js|jsx|ts|tsx|html|css|json|xml|py|java|c|cpp|h|sql)$/i);
  const isImageFile = file.originalName.match(/\.(jpg|jpeg|png|gif|svg|webp)$/i);

  useEffect(() => {
    if (isTextFile && !isEditing) {
      fetchFileContent();
    }
  }, [file.path, isTextFile, isEditing]);

  const fetchFileContent = async () => {
    setLoadingContent(true);
    try {
      const response = await fetch(file.path);
      const text = await response.text();
      setFileContent(text);
    } catch (err) {
      console.error('Error loading file:', err);
      setFileContent('Error loading file content');
    } finally {
      setLoadingContent(false);
    }
  };

  const handleFileChange = (e) => {
    setUpdateData({ ...updateData, updatedFile: e.target.files[0] });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!updateData.message.trim() || !updateData.updatedFile) return;

    await onUpdate(projectId, {
      message: updateData.message,
      changesDescription: updateData.changesDescription,
      files: [updateData.updatedFile],
    });
  };

  const handleDownload = () => {
    fetch(file.path)
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.originalName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      })
      .catch(err => console.error('Error downloading file:', err));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9997] p-4">
      <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-white">{file.originalName}</h2>
            <p className="text-sm text-gray-400">
              {(file.size / 1024).toFixed(2)} KB
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownload}
              className="p-2 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors"
              title="Download"
            >
              <Download size={20} />
            </button>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
              title="Update File"
            >
              {isEditing ? <X size={20} /> : <Edit size={20} />}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {!isEditing ? (
            <div>
              {isImageFile ? (
                <img
                  src={file.path}
                  alt={file.originalName}
                  className="max-w-full h-auto rounded-lg"
                />
              ) : isTextFile ? (
                <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm text-gray-300 overflow-auto max-h-[60vh]">
                  {loadingContent ? (
                    <p className="text-gray-400 text-center py-8">Loading file content...</p>
                  ) : (
                    <pre className="whitespace-pre-wrap break-words">{fileContent}</pre>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-400 mb-4">Preview not available for this file type</p>
                  <button
                    onClick={handleDownload}
                    className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg transition-colors inline-flex items-center space-x-2"
                  >
                    <Download size={20} />
                    <span>Download File</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Update Message *
                </label>
                <input
                  type="text"
                  value={updateData.message}
                  onChange={(e) => setUpdateData({ ...updateData, message: e.target.value })}
                  placeholder="Brief description of changes"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:border-green-500 focus:ring-1 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Changes Description
                </label>
                <textarea
                  value={updateData.changesDescription}
                  onChange={(e) => setUpdateData({ ...updateData, changesDescription: e.target.value })}
                  placeholder="Detailed description of what changed"
                  rows="3"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:border-green-500 focus:ring-1 focus:ring-green-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Upload Updated File *
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500"
                  required
                />
                {updateData.updatedFile && (
                  <p className="text-sm text-gray-400 mt-2">
                    Selected: {updateData.updatedFile.name}
                  </p>
                )}
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <Upload size={20} />
                  <span>Check In Update</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileViewerModal;
