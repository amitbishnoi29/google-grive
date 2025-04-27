import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const checkAuth = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/auth/current');
      setUser(response.data);
      setError(null);
    } catch (error) {
      console.error('Auth check failed:', error);
      if (error.response.status === 401) {
        setUser(null);
        // setError(`Login to continue`);
      } else if (error.request) {
        setError('Unable to connect to server. Please check if the server is running.');
      } else {
        setError('An error occurred while checking authentication');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(() => {
    window.location.href = `${api.defaults.baseURL}/auth/google`;
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await api.get('/auth/logout');
      setUser(null);
      setError(null);
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      if (error.response) {
        setError(`Logout failed: ${error.response.status}`);
      } else if (error.request) {
        setError('Unable to connect to server during logout');
      } else {
        setError('An error occurred during logout');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, error, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 