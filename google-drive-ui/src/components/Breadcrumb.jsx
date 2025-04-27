import { ChevronRight } from 'lucide-react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../services/api';

const Breadcrumb = () => {
  const location = useLocation();
  const [folderPath, setFolderPath] = useState([]);
  const {id} = useParams();
  // Get the folder ID from the URL
  console.log(id);
  useEffect(() => {
    const fetchFolderPath = async () => {
      if (!id) {
        setFolderPath([]);
        return;
      }

      try {
        const response = await api.get(`/files/folders/${id}/path`);
        setFolderPath(response.data);
      } catch (error) {
        console.error('Error fetching folder path:', error);
        setFolderPath([]);
      }
    };

    fetchFolderPath();
  }, [id]);

  return (
    <nav className="flex items-center gap-2 px-6 py-3 bg-white border-b">
      <Link 
        to="/" 
        className="text-blue-600 hover:underline font-medium"
      >
        My Drive
      </Link>
      {folderPath.map((folder) => (
        <div key={folder.id} className="flex items-center gap-2">
          <ChevronRight className="h-4 w-4 text-gray-400" />
          <Link
            to={`/folder/${folder.id}`}
            className="text-blue-600 hover:underline font-medium"
          >
            {folder.name}
          </Link>
        </div>
      ))}
    </nav>
  );
};

export default Breadcrumb; 