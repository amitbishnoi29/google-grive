import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {  Folder, MoreVertical, Star, Image, FileText, FileVideo, FileAudio, Pencil, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from './ui/dropdown-menu';
import { useToast } from '../hooks/use-toast';
import Breadcrumb from './Breadcrumb';
import api from '../services/api';
import { useData } from '../context/DataContext';

const FolderGrid = () => {
  const params = useParams();
  const { toast } = useToast();
  const {id} = params;
  const navigate = useNavigate();
  const {folders, foldersLoading, error, fetchFolders, setFolders} = useData();
 
  useEffect(() => {
    const asyncFetchFolders = async () => {
      await fetchFolders(id || '/');
    }
    asyncFetchFolders();
  }, [id]);

  // const fetchFolders = async () => {
  //   try {
  //     setLoading(true);
  //     const response = await api.get('/files/getFolders', { 
  //       params: { parent: id || '/' } 
  //     });
  //     setFolders(response.data);
  //     setError(null);
  //   } catch (err) {
  //     console.error('Error fetching folders:', err);
  //     setError('Failed to load folders');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleFolderClick = (folder) => {
    // const currentPath = location.pathname.endsWith('/') ? location.pathname.slice(0, -1) : location.pathname;
    // const newPath = `${currentPath}/${encodeURIComponent(folder.name)}`;
  
    // console.log(newPath);

    navigate(`/folder/${folder._id}`);
  
    // Ensure it starts with '/'
    // navigate(newPath.startsWith('/') ? newPath : `/${newPath}`);
  };
  
  

  const handleDelete = async (folderId) => {
    try {
      await api.delete(`/files/folder/${folderId}`);
      setFolders(folders.filter(folder => folder._id !== folderId));
      toast({
        title: "Success",
        description: "Folder deleted successfully",
        variant: "success",
      });
    } catch (error) {
      console.error('Error deleting folder:', error);
      toast({
        title: "Error",
        description: "Failed to delete folder",
        variant: "destructive",
      });
    }
  };

  const getFolderIcon = () => {
    return <Folder className="h-10 w-10 text-blue-500" />;
  };

  // const formatFileSize = (bytes) => {
  //   if (bytes === 0) return '0 Bytes';
  //   const k = 1024;
  //   const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  //   const i = Math.floor(Math.log(bytes) / Math.log(k));
  //   return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  // };

  if(folders.length === 0) {
    return null;
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="">
      {/* <Breadcrumb /> */}
      <div className="p-6 overflow-auto">
        <h1 className="">Folders</h1>
        {foldersLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64 text-red-500">
            {error}
          </div>
        ) 
        : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {folders.map((folder) => (
              <div
                key={folder._id}
                className="group max-w-[250px] relative bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-all duration-200 cursor-pointer hover:border-blue-200 hover:scale-[1.02]"
                onClick={() => handleFolderClick(folder)}
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-center mb-4 p-4 bg-gray-50 rounded-lg">
                    {getFolderIcon(folder)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {folder.name}
                    </p>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Modified {formatDate(folder.updatedAt)}
                  </div>
                </div>
                <div 
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Star className="mr-2 h-4 w-4" />
                        <span>Add to Starred</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => handleDelete(folder._id)}
                      >
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FolderGrid; 