import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Folder, File, Image, Video, Music, FileText } from 'lucide-react';
import { Input } from './ui/input';
import { useNavigate } from 'react-router-dom';
import FileViewer from './FileViewer';
import api from '../services/api';

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const debouncedSearch = useCallback(
    debounce(async (query) => {
      if (!query.trim()) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      try {
        setLoading(true);
        const response = await api.get('/files/search', {
          params: { query: query.trim() }
        });
        setResults(response.data);
        setIsOpen(true);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchQuery, debouncedSearch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleItemClick = (item) => {
    if (item.type === 'folder') {
      navigate(`/folder/${item._id}`);
      setIsOpen(false);
    } else {
      setSelectedFile(item);
      setIsViewerOpen(true);
      setIsOpen(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getParentFolder = (path) => {
    return path;
    if (!path) return '';
    const parts = path.split('/');
    if (parts.length <= 2) return 'My Drive';
    return parts[parts.length - 2] || 'My Drive';
  };

  const getFileIcon = (item) => {
    if (item.type === 'folder') {
      return <Folder className="h-5 w-5 text-blue-500" />;
    }
    
    const fileType = item.mimeType?.split('/')[0];
    switch (fileType) {
      case 'image':
        return <Image className="h-5 w-5 text-green-500" />;
      case 'video':
        return <Video className="h-5 w-5 text-purple-500" />;
      case 'audio':
        return <Music className="h-5 w-5 text-pink-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="relative flex-1 max-w-2xl" ref={dropdownRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search in Drive"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900" />
          </div>
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto z-50">
          {results.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No results found for "{searchQuery}"
            </div>
          ) : (
            results.map((item) => (
              <div
                key={item._id}
                onClick={() => handleItemClick(item)}
                className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
              >
                <div className="flex-shrink-0">
                  {getFileIcon(item)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.name}
                    </p>
                    <span className="text-xs text-gray-500">•</span>
                    <p className="text-xs text-gray-500 truncate">
                      {getParentFolder(item.parentFolder)}
                    </p>
                  </div>
                  {item.type === 'file' && (
                    <p className="text-xs text-gray-500">
                      {formatFileSize(item.size)}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {selectedFile && (
        <FileViewer
          file={selectedFile}
          open={isViewerOpen}
          onOpenChange={setIsViewerOpen}
        />
      )}
    </div>
  );
};

// Debounce utility function
function debounce(func, wait) {
  let timeout;
  const debounced = (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
  debounced.cancel = () => clearTimeout(timeout);
  return debounced;
}

export default SearchBar; 