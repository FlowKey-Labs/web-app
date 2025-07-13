import { useState } from 'react';
import { useAuthStore, Role } from '../../store/auth';
import { useGetUserProfile } from '../../hooks/reactQuery';

const AuthDebugger: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const role = useAuthStore((state) => state.role);
  const user = useAuthStore((state) => state.user);

  const { data: userProfile, isLoading: profileLoading, error: profileError } = useGetUserProfile({
    enabled: isAuthenticated,
    retry: false,
  });

  if (!isExpanded) {
    return (
      <div 
        className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer shadow-lg z-50"
        onClick={() => setIsExpanded(true)}
      >
        🔍 Auth Debug
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-xl p-4 z-50 max-w-md max-h-96 overflow-y-auto">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-gray-800">🔍 Auth Debug State</h3>
        <button 
          onClick={() => setIsExpanded(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <div className="space-y-3 text-sm">
        {/* Authentication Status */}
        <div>
          <div className="font-semibold text-gray-700">Authentication:</div>
          <div className={`px-2 py-1 rounded ${isAuthenticated ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated'}
          </div>
        </div>

        {/* User Information */}
        <div>
          <div className="font-semibold text-gray-700">User:</div>
          <div className="bg-gray-100 p-2 rounded text-xs">
            {user ? (
              <pre>{JSON.stringify({ id: user.id, email: user.email, is_staff: user.is_staff }, null, 2)}</pre>
            ) : (
              'No user data'
            )}
          </div>
        </div>

        {/* Profile Loading Status */}
        <div>
          <div className="font-semibold text-gray-700">Profile Loading:</div>
          <div className={`px-2 py-1 rounded ${profileLoading ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
            {profileLoading ? '🔄 Loading...' : '✅ Loaded'}
          </div>
        </div>

        {/* Profile Data */}
        <div>
          <div className="font-semibold text-gray-700">Profile Data:</div>
          <div className="bg-gray-100 p-2 rounded text-xs">
            {userProfile ? (
              <pre>{JSON.stringify({ 
                id: userProfile.id, 
                email: userProfile.email,
                role: userProfile.role ? { id: userProfile.role.id, name: userProfile.role.name } : null
              }, null, 2)}</pre>
            ) : (
              'No profile data'
            )}
          </div>
        </div>

        {/* Role in Store */}
        <div>
          <div className="font-semibold text-gray-700">Role in Store:</div>
          <div className="bg-gray-100 p-2 rounded text-xs">
            {role ? (
              <pre>{JSON.stringify({ 
                id: role.id, 
                name: role.name,
                can_access_staff_portal: role.can_access_staff_portal,
                can_view_staff: role.can_view_staff,
                can_manage_profile: role.can_manage_profile
              }, null, 2)}</pre>
            ) : (
              'No role data'
            )}
          </div>
        </div>

        {/* Profile Error */}
        {profileError && (
          <div>
            <div className="font-semibold text-gray-700">Profile Error:</div>
            <div className="bg-red-100 text-red-800 p-2 rounded text-xs">
              {String(profileError)}
            </div>
          </div>
        )}

        {/* Current Time */}
        <div>
          <div className="font-semibold text-gray-700">Last Updated:</div>
          <div className="text-gray-600 text-xs">
            {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthDebugger; 