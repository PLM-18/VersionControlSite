import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import {
  MoreHorizontal,
  Download,
  GitBranch,
  Users,
  Clock,
  Edit,
  Trash2,
  ExternalLink,
} from "lucide-react";

const ProjectCard = ({ project, viewMode, onUpdate }) => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleProjectClick = (e) => {
    // Prevent navigation when clicking on menu buttons
    if (e.target.closest('button')) {
      return;
    }
    navigate(`/project/${project.id}`);
  };

  const handleDelete = () => {
    if (!window.confirm("Are you sure you want to delete this project?"))
      return;

    setIsDeleting(true);
    // Mock delete - just call the update function
    setTimeout(() => {
      onUpdate();
      setIsDeleting(false);
    }, 500);
  };

  const handleCheckOut = () => {
    // Mock checkout - just call the update function
    onUpdate();
  };

  const handleDownload = () => {
    // Mock download
    alert(`Downloading ${project.name}.zip`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));

    if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else if (diffHours < 168) {
      // 7 days
      return `${Math.floor(diffHours / 24)} days ago`;
    } else {
      return `${Math.floor(diffHours / 168)} weeks ago`;
    }
  };

  if (viewMode === "list") {
    return (
      <div
        onClick={handleProjectClick}
        className="bg-gray-800 rounded-lg p-4 flex items-center justify-between hover:bg-gray-750 transition-colors cursor-pointer"
      >
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
            <GitBranch className="text-green-400" size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-white">{project.name}</h3>
            <p className="text-gray-400 text-sm">{project.description}</p>
          </div>
        </div>

        <div className="flex items-center space-x-6 text-sm text-gray-400">
          <span>{project.type}</span>
          <span>{formatDate(project.updatedAt)}</span>
          <div className="flex items-center space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDownload();
              }}
              className="p-2 hover:bg-gray-700 rounded transition-colors"
            >
              <Download size={16} />
            </button>
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="p-2 hover:bg-gray-700 rounded transition-colors"
              >
                <MoreHorizontal size={16} />
              </button>
              {showMenu && (
                <div className="absolute right-0 top-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-xl z-10 w-48">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      // Navigate to edit
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-600 flex items-center space-x-2"
                  >
                    <Edit size={14} />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete();
                    }}
                    disabled={isDeleting}
                    className="w-full text-left px-4 py-2 hover:bg-gray-600 text-red-400 flex items-center space-x-2"
                  >
                    <Trash2 size={14} />
                    <span>{isDeleting ? "Deleting..." : "Delete"}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-gray-800 rounded-lg overflow-hidden card-hover cursor-pointer" 
      onClick={handleProjectClick}
    >
      {/* Project Header */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">
              {project.name}
            </h3>
            <p className="text-gray-400 text-sm line-clamp-2">
              {project.description}
            </p>
          </div>
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            >
              <MoreHorizontal size={18} />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-xl z-10 w-48">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/project/${project.id}`);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-600 flex items-center space-x-2"
                >
                  <ExternalLink size={14} />
                  <span>View Details</span>
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    // Navigate to edit
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-600 flex items-center space-x-2"
                >
                  <Edit size={14} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                  }}
                  disabled={isDeleting}
                  className="w-full text-left px-4 py-2 hover:bg-gray-600 text-red-400 flex items-center space-x-2"
                >
                  <Trash2 size={14} />
                  <span>{isDeleting ? "Deleting..." : "Delete"}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Project Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {project.hashtags?.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded"
            >
              #{tag}
            </span>
          ))}
          <span className="px-2 py-1 bg-blue-600 text-blue-100 text-xs rounded">
            {project.type}
          </span>
        </div>

        {/* Project Status */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span
              className={`w-2 h-2 rounded-full ${
                project.status === "checked_out"
                  ? "bg-orange-400"
                  : "bg-green-400"
              }`}
            ></span>
            <span className="text-sm text-gray-400">
              {project.status === "checked_out" ? "Checked Out" : "Available"}
            </span>
          </div>
          <span className="text-sm text-gray-500">v{project.version}</span>
        </div>

        {/* Project Stats */}
        <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Users size={14} />
              <span>{project.members?.length || 1}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock size={14} />
              <span>{formatDate(project.updatedAt)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDownload();
            }}
            className="flex-1 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
          >
            <Download size={16} />
            <span>Download</span>
          </button>

          {project.status === "checked_in" ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCheckOut();
              }}
              className="flex-1 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
            >
              <GitBranch size={16} />
              <span>Check Out</span>
            </button>
          ) : (
            <button
              disabled
              className="flex-1 bg-gray-600 px-4 py-2 rounded-lg flex items-center justify-center space-x-2 cursor-not-allowed"
            >
              <GitBranch size={16} />
              <span>Checked Out</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;