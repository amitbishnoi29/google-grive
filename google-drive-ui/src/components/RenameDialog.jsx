import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Input } from './ui/input';
import { Button } from './ui/button';
import api from '../services/api';

const RenameDialog = ({ 
  isOpen, 
  onOpenChange, 
  item, 
  type = 'file', // 'file' or 'folder'
  onSuccess 
}) => {
  const [newName, setNewName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && item) {
      setNewName(item.name);
      setError('');
    }
  }, [isOpen, item]);

  const handleRename = async () => {
    if (!item || !newName.trim()) return;
    setIsLoading(true);
    setError('');

    try {
      const endpoint = type === 'file' 
        ? `/files/${item._id}/rename`
        : `/folders/${item._id}/rename`;

      await api.patch(endpoint, {
        name: newName.trim()
      });

      onSuccess?.(newName.trim());
      onOpenChange(false);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to rename item');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename {type === 'file' ? 'File' : 'Folder'}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={`Enter new ${type} name`}
            autoFocus
          />
          {error && (
            <p className="text-sm text-red-500 mt-2">{error}</p>
          )}
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleRename}
            disabled={isLoading || !newName.trim()}
          >
            {isLoading ? 'Renaming...' : 'Rename'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RenameDialog; 