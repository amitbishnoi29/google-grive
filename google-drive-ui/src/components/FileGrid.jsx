import { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { File, Folder, MoreVertical, Star, Image, FileText, FileVideo, FileAudio, Download, Pencil, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from './ui/dropdown-menu';
import { useToast } from '../hooks/use-toast';

import FileViewer from './FileViewer';
import RenameDialog from './RenameDialog';
import api from '../services/api';
import { useData } from '../context/DataContext';

const FileGrid = () => {
  const {files, filesLoading, error, fetchFiles, setFiles, handleDownload} = useData();
  const [selectedFile, setSelectedFile] = useState(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const {id} = useParams();
  const { toast } = useToast();

  useEffect(() => {
    const asyncFetchFiles = async () => {
      await fetchFiles(id || '/');
    }
    asyncFetchFiles();
  }, [id]);


  const handleFileClick = (file) => {
    setSelectedFile(file);
    setIsViewerOpen(true);
  };

  const handleDelete = async (fileId) => {
    try {
      await api.delete(`/files/${fileId}`);
      setFiles(files.filter(file => file._id !== fileId));
      toast({
        title: "Success",
        description: "File deleted successfully",
        variant: "default",
      });
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({
        title: "Error",
        description: "Failed to delete file",
        variant: "destructive",
      });
    }
  };

  const handleRenameSuccess = (newName) => {
    setFiles(files.map(file => 
      file._id === selectedFile._id 
        ? { ...file, name: newName }
        : file
    ));
  };

  const openRenameModal = (file) => {
    setSelectedFile(file);
    setIsRenameModalOpen(true);
  };

  const getFileIcon = (file) => {
    const type = file.type?.split('/')[0];
    switch (type) {
      case 'image':
        return <Image className="h-10 w-10 text-blue-500" />;
      case 'video':
        return <FileVideo className="h-10 w-10 text-red-500" />;
      case 'audio':
        return <FileAudio className="h-10 w-10 text-purple-500" />;
      default:
        return <FileText className="h-10 w-10 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (filesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500">
        {error}
      </div>
    );
  }
  if (files.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        No files found
      </div>
    );
  }
  return (
    <div className="p-6">
      <h1>Files</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {files.map((file) => (
          <div
            key={file._id}
            className="group  max-w-[250px] relative bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-all duration-200 cursor-pointer hover:border-blue-200 hover:scale-[1.02]"
            onClick={() => handleFileClick(file)}
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-center mb-4 p-4 bg-gray-50 rounded-lg">
                {getFileIcon(file)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatFileSize(file.size)}
                </p>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Modified {formatDate(file.updatedAt)}
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
                  <DropdownMenuItem onClick={() => handleDownload(file._id, file.name)}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => openRenameModal(file)}>
                    <FileText className="mr-2 h-4 w-4" />
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-red-600"
                    onClick={() => handleDelete(file._id)}
                  >
                    <MoreVertical className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>

      {selectedFile && (
        <FileViewer
          file={selectedFile}
          open={isViewerOpen}
          onOpenChange={setIsViewerOpen}
        />
      )}

      <RenameDialog
        isOpen={isRenameModalOpen}
        onOpenChange={setIsRenameModalOpen}
        item={selectedFile}
        type="file"
        onSuccess={handleRenameSuccess}
      />
    </div>
  );
};

export default FileGrid; 