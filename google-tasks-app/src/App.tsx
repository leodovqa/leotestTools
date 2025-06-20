import { useEffect, useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import './App.css';

function App() {
  const [user, setUser] = useState<any>(null);
  const [authStatus, setAuthStatus] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const auth = params.get('auth');
    if (auth === 'success') setAuthStatus('success');
    else if (auth === 'error') setAuthStatus('error');

    // Restore user from localStorage if available
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userObj = JSON.parse(storedUser);
      setUser(userObj);
      setAuthStatus('success'); // treat as logged in if user is present
    }
  }, []);

  useEffect(() => {
    // Save user to localStorage
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
  }, [user]);

  useEffect(() => {
    // Remove auth param from URL after handling
    const params = new URLSearchParams(window.location.search);
    if (params.get('auth')) {
      params.delete('auth');
      const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
      window.history.replaceState({}, '', newUrl);
    }
  }, [authStatus]);

  const login = useGoogleLogin({
    flow: 'auth-code',
    ux_mode: 'redirect',
    redirect_uri: 'http://localhost:3001/api/auth',
    scope: 'https://www.googleapis.com/auth/tasks https://www.googleapis.com/auth/calendar',
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
      <div className="text-center space-y-8">
        <h1 className="text-5xl font-extrabold mb-4 text-blue-400">Google Tasks Manager</h1>
        <p className="text-lg text-gray-400 mb-8">Your personal task management solution.</p>
        {authStatus === 'success' && (
          <p className="text-xl text-green-400">Login successful! You can now use the app.</p>
        )}
        {authStatus === 'error' && (
          <p className="text-xl text-red-400">Login failed. Please try again.</p>
        )}
        {!user && !authStatus && (
          <button
            onClick={() => login()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300"
          >
            Sign in with Google
          </button>
        )}
        {user && (
          <div className="space-y-4">
            <p className="text-xl text-green-400">Welcome, Authenticated User!</p>
            <button
              onClick={() => {
                setUser(null);
                localStorage.removeItem('user');
              }}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300"
            >
              Sign Out
            </button>
            {/* Placeholder for TaskList component */}
            <div className="mt-8 p-6 bg-gray-800 rounded-lg shadow-xl">
              <h2 className="text-2xl mb-4">Your Tasks (Coming Soon!)</h2>
              <p className="text-gray-500">Integrate Google Tasks API here.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
