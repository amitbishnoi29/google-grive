import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [filesLoading, setFilesLoading] = useState(true);
  const [foldersLoading, setFoldersLoading] = useState(true);

  const fetchFiles = async (path = '/') => {
    try {
      setFilesLoading(true);
      const filesResponse = await api.get('/files/getFiles', { params: { path } });
      setFiles(filesResponse.data);
      setError(null);
    } catch (err) {
        console.error('Error fetching files:', err);
        if(err?.response?.data?.message){
          setError(err?.response?.data?.message);
        }else{
          setError('Failed to load files');
        }
      } finally {
        setFilesLoading(false);
      }
  };

  const handleDownload = async (fileId, fileName) => {
    try {
    //   setLoading(true);
      const response = await api.get(`/files/${fileId}/download`);
      console.log(response.data);
      // Create a URL for the blob
      // const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      // make target blank
      link.target = '_blank';
      link.href = response.data.url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading file:', error);
    } finally {
    //   setLoading(false);
    }
  };

  const fetchFolders = async (path = '/') => {
    try {
      setFoldersLoading(true); 
      const foldersResponse = await api.get('/files/getFolders', { params: { parent: path } });
      setFolders(foldersResponse.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching folders:', err);
      setError('Failed to load folders');
    } finally {
      setFoldersLoading(false);
    }
  };

  const fetchData = async (path = '/') => {
    await Promise.all([
      fetchFiles(path),
      fetchFolders(path)
    ]);
  };

  // Fetch data when path changes or refresh is triggered
//   useEffect(() => {
//     const path = location.pathname === '/' ? '/' : location.pathname.split('/folder/')[1];
//     fetchData(path);
//   }, [location.pathname, refreshTrigger, fetchData]);

  const refreshData = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);



  const deleteFile = async (fileId) => {
    try {
      await api.delete(`/files/${fileId}`);
      refreshData();
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  };

  const deleteFolder = async (folderId) => {
    try {
      await api.delete(`/files/folder/${folderId}`);
      refreshData();
    } catch (error) {
      console.error('Error deleting folder:', error);
      throw error;
    }
  };

  return (
    <DataContext.Provider value={{
      files,
      setFiles,
      folders,
      setFolders,
      error,
      filesLoading,
      foldersLoading,
      fetchFiles,
      fetchFolders,
      deleteFile,
      deleteFolder,
      refreshData,
      handleDownload
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}; 