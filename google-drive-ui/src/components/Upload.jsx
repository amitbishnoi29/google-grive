import { useState, useRef, useEffect } from 'react';
import { Upload, FolderPlus, File, Folder, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { useToast } from '../hooks/use-toast';
import { useLocation, useParams } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from './ui/dropdown-menu';
import api from '../services/api';
import CreateFolderModal from './CreateFolderModal';
import { useData } from '../context/DataContext';

const UploadComponent = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('idle');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [currentFile, setCurrentFile] = useState(null);
  const [supportsWebkitDirectory, setSupportsWebkitDirectory] = useState(false);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const fileInputRef = useRef(null);
  // const folderInputRef = useRef(null);
  const { toast } = useToast();
  const location = useLocation();
  const {id} = useParams();
  const { fetchFiles } = useData();

  const handleFileInput = async (e) => {
    const files = Array.from(e.target.files);
    await handleFiles(files);
  };

  // const handleFolderInput = async (e) => {
  //   const files = Array.from(e.target.files);
  //   await handleFiles(files);
  // };

  const handleFiles = async (files) => {
    if (files.length === 0) return;
  
    for (const file of files) {
      const uploadId = Date.now().toString() + Math.random().toString(36).substring(2, 8); // Unique per file
  
      try {
        setCurrentFile(file);
        setUploadStatus('uploading');
        setUploadProgress(0);
  
        // Start listening for progress updates FIRST
        const eventSource = new EventSource(`${import.meta.env.VITE_API_URL}/files/upload-progress/${uploadId}`);
  
        eventSource.onmessage = (event) => {
          const data = JSON.parse(event.data);
          console.log('Progress Update:', data);
          setUploadProgress(data.progress);
  
          if (data.complete) {
            eventSource.close();
            setUploadStatus('success');
            fetchFiles(id || '/'); // Call fetchFiles after successful upload
            toast({
              variant: "success",
              title: "Upload Successful",
              description: `${file.name} has been uploaded successfully.`,
            });
          }
        };
  
        eventSource.onerror = (error) => {
          console.error('SSE connection error:', error);
          eventSource.close();
          setUploadStatus('error');
          toast({
            variant: "destructive",
            title: "Upload Failed",
            description: `Failed to upload ${file.name}. Please try again.`,
          });
        };
  
        // THEN start uploading
        const formData = new FormData();
        formData.append('file', file);
        formData.append('parent', id || '/');
        formData.append('uploadId', uploadId);
  
        const res = await api.post('files/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if(res.status === 200 || res.status === 201){
          fetchFiles(id || '/'); // Call fetchFiles after successful upload
          toast({
            title: "Upload Successful",
            description: `${file.name} has been uploaded successfully.`,
          });
        }
  
      } catch (error) {
        console.error('Error uploading file:', error);
        setUploadStatus('error');
        toast({
          variant: "destructive",
          title: "Upload Error",
          description: `An error occurred while uploading ${file.name}.`,
        });
      } finally {
        setCurrentFile(null);
        setUploadProgress(0);
      }
    }
  };
  

  const handleCreateFolder = () => {
    setShowCreateFolderModal(true);
  };

  return (
    <div className="space-y-4 w-full">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold hidden md:block">Upload Files</h2>
        <div className="flex space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>New</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                <File className="mr-2 h-4 w-4" />
                <span>File Upload</span>
              </DropdownMenuItem>
              {/* <DropdownMenuItem onClick={() => folderInputRef.current?.click()}>
                <Folder className="mr-2 h-4 w-4" />
                <span>Folder Upload</span>
              </DropdownMenuItem> */}
              <DropdownMenuItem onClick={handleCreateFolder}>
                <FolderPlus className="mr-2 h-4 w-4" />
                <span>New Folder</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInput}
        multiple
        className="hidden"
      />

      {/* <input
        type="file"
        ref={folderInputRef}
        onChange={handleFolderInput}
        webkitdirectory="true"
        directory="true"
        className="hidden"
      /> */}

      {/* <div
        className={`border-2 border-dashed rounded-lg p-8 text-center ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="h-12 w-12 mx-auto text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          Drag and drop files here, or click to select files
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Supported formats: Any file type
        </p>
      </div> */}

      {uploadStatus === 'uploading' && currentFile && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Uploading {currentFile.name}...</span>
            <span>{Math.round(uploadProgress)}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}

      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Uploaded Files</h3>
          <div className="space-y-2">
            {uploadedFiles.map((file) => (
              <div
                key={file._id}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-2">
                  <File className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">{file.name}</span>
                </div>
                <span className="text-xs text-gray-500">
                  {Math.round(file.size / 1024)} KB
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <CreateFolderModal
        isOpen={showCreateFolderModal}
        onClose={() => setShowCreateFolderModal(false)}
        currentPath={location.pathname.slice(1) || '/'}
      />
    </div>
  );
};

export default UploadComponent; 