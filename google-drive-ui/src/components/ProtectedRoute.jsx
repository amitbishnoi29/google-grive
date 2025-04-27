import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';

const ProtectedRoute = ({ children }) => {
  const { user, checkAuth } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Only check auth if we don't have a user
    if (!user) {
      const verifyAuth = async () => {
        await checkAuth();
        setIsChecking(false);
      };
      verifyAuth();
    } else {
      setIsChecking(false);
    }
  }, [user, checkAuth]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login"  />;
  }

  return children;
};

export default ProtectedRoute; 