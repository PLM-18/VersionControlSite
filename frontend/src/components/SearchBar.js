import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users, FolderOpen, Hash } from 'lucide-react';
import { userAPI, projectAPI } from '../services/api.js';

const SearchBar = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ users: [], projects: [] });
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const performSearch = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults({ users: [], projects: [] });
      setIsOpen(false);
      return;
    }

    setLoading(true);
    try {
      const [usersData, projectsData] = await Promise.all([
        userAPI.searchUsers(searchQuery),
        projectAPI.searchProjects(searchQuery)
      ]);

      setResults({
        users: usersData || [],
        projects: projectsData || []
      });
      setIsOpen(true);
    } catch (error) {
      console.error('Search error:', error);
      setResults({ users: [], projects: [] });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Debounce search
    timeoutRef.current = setTimeout(() => {
      performSearch(value);
    }, 300);
  };

  const handleResultClick = (type, id) => {
    setIsOpen(false);
    setQuery('');

    if (type === 'user') {
      navigate(`/profile/${id}`);
    } else if (type === 'project') {
      navigate(`/project/${id}`);
    }
  };

  const totalResults = results.users.length + results.projects.length;

  return (
    <div className="relative w-96" ref={searchRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search users, projects, or languages..."
          value={query}
          onChange={handleInputChange}
          onFocus={() => query && setIsOpen(true)}
          className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-gray-600 border-t-green-500 rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          {totalResults === 0 ? (
            <div className="p-4 text-center text-gray-400">
              {query ? 'No results found' : 'Start typing to search...'}
            </div>
          ) : (
            <div className="py-2">
              {/* Users Section */}
              {results.users.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                    Users ({results.users.length})
                  </div>
                  {results.users.map((user) => (
                    <button
                      key={user._id}
                      onClick={() => handleResultClick('user', user._id)}
                      className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex-shrink-0">
                        {user.profileImage ? (
                          <img
                            src={user.profileImage}
                            alt={user.username}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-black font-bold text-sm">
                              {user.username[0].toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <div className="font-medium text-white truncate">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-gray-400 truncate">
                          @{user.username}
                        </div>
                      </div>
                      <Users size={14} className="text-blue-400 flex-shrink-0" />
                    </button>
                  ))}
                </div>
              )}

              {/* Projects Section */}
              {results.projects.length > 0 && (
                <div className={results.users.length > 0 ? 'mt-2 border-t border-gray-700' : ''}>
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                    Projects ({results.projects.length})
                  </div>
                  {results.projects.map((project) => (
                    <button
                      key={project._id}
                      onClick={() => handleResultClick('project', project._id)}
                      className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-700 transition-colors"
                    >
                      <FolderOpen size={20} className="text-green-400 flex-shrink-0" />
                      <div className="flex-1 text-left min-w-0">
                        <div className="font-medium text-white truncate">
                          {project.title}
                        </div>
                        <div className="text-sm text-gray-400 truncate">
                          {project.description}
                        </div>
                        {project.hashtags && project.hashtags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {project.hashtags.slice(0, 3).map((tag, idx) => (
                              <span key={idx} className="flex items-center text-green-400 text-xs">
                                <Hash size={10} className="mr-0.5" />
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      {project.projectType && (
                        <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs flex-shrink-0">
                          {project.projectType}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;