import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { X, Download, Star } from 'lucide-react';
import { useData } from '../context/DataContext';

const FileViewer = ({ file, open, onOpenChange }) => {
  const [loading, setLoading] = useState(false);

  const { handleDownload } = useData();

  const renderViewer = () => {
    const type = file.type?.split('/')[0];
    const extension = file.name?.split('.').pop()?.toLowerCase();

    switch (type) {
      case 'image':
        return (
          <img
            src={file.url}
            alt={file.name}
            className="max-h-[70vh] w-auto object-contain"
          />
        );
      case 'video':
        return (
          <video
            controls
            className="max-h-[70vh] w-auto"
            src={file.url}
          />
        );
      case 'audio':
        return (
          <audio
            controls
            className="w-full"
            src={file.url}
          />
        );
      case 'application':
        if (extension === 'pdf') {
          return (
            <iframe
              src={file.url}
              className="w-full h-[70vh]"
              title={file.name}
            />
          );
        }
        // For other document types, show a download button
        return (
          <div className="flex flex-col items-center justify-center h-[70vh] space-y-4">
            <p className="text-gray-500">Preview not available for this file type</p>
            <Button onClick={handleDownload} disabled={loading}>
              <Download className="mr-2 h-4 w-4" />
              Download File
            </Button>
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center h-[70vh] space-y-4">
            <p className="text-gray-500">Preview not available for this file type</p>
            <Button onClick={handleDownload} disabled={loading}>
              <Download className="mr-2 h-4 w-4" />
              Download File
            </Button>
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="truncate max-w-md">{file.name}</span>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" onClick={() => handleDownload(file._id, file.name)} disabled={loading}>
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Star className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4 flex justify-center">
          {renderViewer()}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FileViewer; 