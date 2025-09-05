import React, { useState, useRef, useEffect } from 'react';
import { Search, Users, FolderOpen, MessageSquare } from 'lucide-react';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
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
      setResults([]);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&type=all`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data);
        setIsOpen(true);
      }
    } catch (error) {
      console.error('Search error:', error);
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

  const getResultIcon = (type) => {
    switch (type) {
      case 'user':
        return <Users size={16} className="text-blue-400" />;
      case 'project':
        return <FolderOpen size={16} className="text-green-400" />;
      case 'activity':
        return <MessageSquare size={16} className="text-purple-400" />;
      default:
        return <Search size={16} className="text-gray-400" />;
    }
  };

  const handleResultClick = (result) => {
    // Handle navigation based on result type
    setIsOpen(false);
    setQuery('');
  };

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
          {results.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              {query ? 'No results found' : 'Start typing to search...'}
            </div>
          ) : (
            <div className="py-2">
              {results.map((result, index) => (
                <button
                  key={`${result.type}-${result.id || index}`}
                  onClick={() => handleResultClick(result)}
                  className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-700 transition-colors"
                >
                  {getResultIcon(result.type)}
                  <div className="flex-1 text-left">
                    <div className="font-medium text-white">
                      {result.name || result.username || result.title}
                    </div>
                    <div className="text-sm text-gray-400">
                      {result.type === 'user' && result.email}
                      {result.type === 'project' && result.description}
                      {result.type === 'activity' && result.message}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 uppercase">
                    {result.type}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;