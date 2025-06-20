import { useEffect, useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import './App.css';

function App() {
  const [user, setUser] = useState<any>(null);
  const [authStatus, setAuthStatus] = useState<string | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
  console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);

  const isProd = window.location.hostname === 'leotest-tools.vercel.app';

  useEffect(() => {
    // On page load, check session from backend
    fetch(`${API_BASE_URL}/api/session`, {
      credentials: 'include',
    })
      .then((res) => (res.ok ? res.json() : { user: null }))
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          setAuthStatus('success');
        } else {
          setUser(null);
          setAuthStatus(null);
        }
      })
      .catch(() => {
        setUser(null);
        setAuthStatus(null);
      });
  }, []);

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
    redirect_uri: import.meta.env.VITE_GOOGLE_REDIRECT_URI,
    scope: 'https://www.googleapis.com/auth/tasks https://www.googleapis.com/auth/calendar',
    onSuccess: async (codeResponse) => {
      // Exchange code for tokens with backend
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: codeResponse.code }),
        });
        if (!response.ok) {
          setAuthStatus('error');
          return;
        }
        const data = await response.json();
        // Store expiry timestamp
        const tokenData = {
          ...data,
          expires_at: Date.now() + (data.expires_in ? data.expires_in * 1000 : 3600 * 1000),
        };
        setUser(tokenData);
        localStorage.setItem('user', JSON.stringify(tokenData));
        setAuthStatus('success');
      } catch (e) {
        setAuthStatus('error');
      }
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
      <div className="text-center space-y-8">
        <h1 className="text-5xl font-extrabold mb-4 text-blue-400">Google Tasks Manager</h1>
        <p className="text-lg text-gray-400 mb-8">Your personal task management solution.</p>
        {authStatus === 'success' && (
          <p className={`text-xl font-bold ${isProd ? 'text-green-400' : 'text-yellow-400'}`}
            style={{ color: isProd ? '#4ade80' : '#fde047' }}>
            Login successful! You are using {isProd ? 'PROD' : 'DEV'} version.
          </p>
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
            <p className="text-xl text-green-400">
              Welcome, {user?.profile?.name || 'Authenticated User'}!
            </p>
            <button
              onClick={async () => {
                await fetch(`${API_BASE_URL}/api/logout`, {
                  method: 'POST',
                  credentials: 'include',
                });
                setUser(null);
                setAuthStatus(null);
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
