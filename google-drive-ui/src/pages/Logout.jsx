import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Loader2 } from 'lucide-react';

const Logout = () => {
  const { logout, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const performLogout = async () => {
      await logout();
      navigate('/login', { replace: true });
    };

    performLogout();
  }, [logout, navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card px-4 py-8 shadow sm:rounded-lg sm:px-10">
          <div className="flex flex-col items-center">
            {loading ? (
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            ) : (
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <svg
                  className="h-5 w-5 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            )}
            <h2 className="mt-4 text-2xl font-semibold text-foreground">
              {loading ? 'Logging out...' : 'Logged out successfully'}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {loading
                ? 'Please wait while we sign you out'
                : 'You have been successfully logged out'}
            </p>
            {!loading && (
              <Button
                onClick={() => navigate('/login')}
                className="mt-6"
                variant="outline"
              >
                Return to Login
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Logout;
