import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button'; 

const LogoutSuccess = () => {
  const navigate = useNavigate();

  // Optional: Redirect after delay
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/login'); 
    }, 5000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8 text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
          <svg
            className="h-6 w-6 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Logout Successful
        </h2>
        <p className="text-gray-600 mb-6">
          You have been successfully logged out. Thank you for using our service.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => navigate('/login')}
            color="#1D9B5E"
            radius="md"
            className="w-full sm:w-auto"
          >
            Return to Login
          </Button>
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            color="gray"
            radius="md"
            className="w-full sm:w-auto"
          >
            Go to Homepage
          </Button>
        </div>

        <p className="text-sm text-gray-500 mt-4">
          Redirecting to login page in 5 seconds...
        </p>
      </div>
    </div>
  );
};

export default LogoutSuccess;