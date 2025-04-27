import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import FileGrid from './FileGrid';
import FolderGrid from './FolderGrid';
import SearchBar from './SearchBar';
import api from '../services/api';
import UploadComponent from './Upload';
import Breadcrumb from './Breadcrumb';
const Grid = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);


  return (
    <div className="flex flex-col h-full">
      <div className="block md:hidden flex items-center justify-between flex-row-reverse px-6 py-3 border-b gap-4">
        <UploadComponent />
      </div>

      <div className="flex-1 overflow-auto">
        <Breadcrumb />
        <FolderGrid refreshTrigger={refreshTrigger} />
        <FileGrid refreshTrigger={refreshTrigger} />
      </div>
    </div>
  );
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

export default Grid; 