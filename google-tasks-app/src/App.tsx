import { useEffect, useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import './App.css';
import Sidebar from './components/Sidebar';
import ReactDOM from 'react-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import MyTasksPage from './MyTasksPage.tsx';

function TopBanner({
  user,
  onSignOut,
  onOpenSidebar,
}: {
  user: any;
  onSignOut: () => void;
  onOpenSidebar: () => void;
}) {
  const { pathname } = useLocation();
  return (
    <div className="top-banner">
      <div className="top-banner-left">
        <button className="hamburger-btn" onClick={onOpenSidebar} aria-label="Open sidebar">
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>
      </div>
      <span className="top-banner-title">
        {pathname === '/tasks' ? 'My Google Tasks' : 'Google Tasks Manager'}
      </span>
      <div className="top-banner-right">
        {user ? (
          <button
            onClick={onSignOut}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ml-4"
          >
            Sign Out
          </button>
        ) : null}
      </div>
    </div>
  );
}

function App() {
  const [user, setUser] = useState<any>(null);
  const [authStatus, setAuthStatus] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDetails, setTaskDetails] = useState('');
  const [taskDue, setTaskDue] = useState<string | null>(null);
  const today = new Date();
  const tomorrow = new Date(Date.now() + 86400000);
  const [customDate, setCustomDate] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

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

  function formatDate(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function formatDateDisplay(dateStr: string) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  return (
    <Router>
      <div id="root" className="min-h-screen w-full bg-gray-900 text-white p-0">
        <TopBanner
          user={user}
          onSignOut={async () => {
            await fetch(`${API_BASE_URL}/api/logout`, {
              method: 'POST',
              credentials: 'include',
            });
            setUser(null);
            setAuthStatus(null);
          }}
          onOpenSidebar={() => setSidebarOpen(true)}
        />
        <Routes>
          <Route path="/tasks" element={<MyTasksPage />} />
          <Route
            path="/"
            element={
              !user && !authStatus ? (
                <div className="logged-out-view">
                  <button
                    onClick={() => login()}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300"
                  >
                    Sign in with Google
                  </button>
                </div>
              ) : (
                <div className="content-view">
                  {authStatus === 'success' && (
                    <p
                      className={`text-xl font-bold ${
                        window.location.hostname === 'leotest-tools.vercel.app'
                          ? 'text-green-400'
                          : 'text-yellow-400'
                      }`}
                      style={{
                        color:
                          window.location.hostname === 'leotest-tools.vercel.app'
                            ? '#4ade80'
                            : '#fde047',
                      }}
                    >
                      Login successful! You are using{' '}
                      {window.location.hostname === 'leotest-tools.vercel.app' ? 'PROD' : 'DEV'}{' '}
                      version.
                    </p>
                  )}
                  {authStatus === 'error' && (
                    <p className="text-xl text-red-400">Login failed. Please try again.</p>
                  )}
                  {user && (
                    <section className="addtask-section">
                      <h2 className="addtask-title">Create a new task</h2>
                      <div className="addtask-card addtask-dark-card">
                        <div className="addtask-drag addtask-dark-drag"></div>
                        <div className="flex flex-col gap-3 w-full">
                          <div className="addtask-input-row">
                            <input
                              className="addtask-input addtask-dark-input"
                              placeholder="Add a task"
                              value={taskTitle}
                              onChange={(e) => setTaskTitle(e.target.value)}
                            />
                          </div>
                          <textarea
                            className="addtask-textarea addtask-dark-input"
                            placeholder="Details"
                            rows={2}
                            value={taskDetails}
                            onChange={(e) => setTaskDetails(e.target.value)}
                          />
                          <div className="addtask-btn-row">
                            <button
                              type="button"
                              className={`addtask-btn addtask-dark-btn${
                                taskDue === formatDate(today) ? ' selected' : ''
                              }`}
                              onClick={() => {
                                setTaskDue(formatDate(today));
                                setCustomDate(null);
                              }}
                            >
                              Today
                            </button>
                            <button
                              type="button"
                              className={`addtask-btn addtask-dark-btn${
                                taskDue === formatDate(tomorrow) ? ' selected' : ''
                              }`}
                              onClick={() => {
                                setTaskDue(formatDate(tomorrow));
                                setCustomDate(null);
                              }}
                            >
                              Tomorrow
                            </button>
                            <DatePicker
                              selected={customDate}
                              onChange={(date) => {
                                setCustomDate(date as Date);
                                setTaskDue(date ? formatDate(date as Date) : null);
                              }}
                              customInput={
                                <button
                                  type="button"
                                  className={`addtask-btn addtask-dark-btn${
                                    customDate ? ' selected' : ''
                                  }`}
                                >
                                  <svg width="15" height="15" fill="none" viewBox="0 0 24 24">
                                    <rect
                                      x="3"
                                      y="5"
                                      width="18"
                                      height="16"
                                      rx="2"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                    />
                                    <path
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      d="M16 3v4M8 3v4"
                                    />
                                  </svg>
                                  <span>Date</span>
                                </button>
                              }
                              calendarClassName="addtask-datepicker-dark"
                              popperPlacement="bottom"
                              popperClassName="addtask-datepicker-popper"
                              dateFormat="yyyy-MM-dd"
                              minDate={today}
                              showPopperArrow={false}
                            />
                          </div>
                          {/* Show picked date below buttons if set */}
                          <div
                            style={{
                              width: '100%',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 0,
                            }}
                          >
                            {taskDue && (
                              <span className="addtask-date-pill">
                                {formatDateDisplay(taskDue)}
                              </span>
                            )}
                            <button
                              className="addtask-save addtask-dark-save"
                              disabled={!taskTitle.trim() || saving}
                              onClick={async () => {
                                setSaving(true);
                                setSaveError(null);
                                setSaveSuccess(false);
                                try {
                                  const res = await fetch(`${API_BASE_URL}/api/tasks/create`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    credentials: 'include',
                                    body: JSON.stringify({
                                      title: taskTitle,
                                      notes: taskDetails,
                                      due: taskDue || undefined,
                                    }),
                                  });
                                  if (!res.ok) {
                                    const err = await res.json();
                                    setSaveError(err.error || 'Failed to create task');
                                  } else {
                                    setSaveSuccess(true);
                                    setTaskTitle('');
                                    setTaskDetails('');
                                    setTaskDue(null);
                                    setCustomDate(null);
                                  }
                                } catch (e: any) {
                                  setSaveError(e.message || 'Failed to create task');
                                } finally {
                                  setSaving(false);
                                }
                              }}
                            >
                              {saving ? 'Saving...' : 'Save'}
                            </button>
                            {saveSuccess && (
                              <div
                                style={{ color: '#4cae4f', textAlign: 'center', marginTop: 8 }}
                              >
                                Task created!
                              </div>
                            )}
                            {saveError && (
                              <div
                                style={{ color: '#e53e3e', textAlign: 'center', marginTop: 8 }}
                              >
                                {saveError}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </section>
                  )}
                </div>
              )
            }
          />
        </Routes>
        {/* Overlay and Sidebar for sidebarOpen using portal */}
        {sidebarOpen &&
          ReactDOM.createPortal(
            <>
              <div
                className="fixed inset-0 bg-black bg-opacity-40 z-[104]"
                onClick={() => setSidebarOpen(false)}
              ></div>
              <Sidebar
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                onSidebarClick={(e) => e.stopPropagation()}
                userName={user?.profile?.name}
                homeUrl={'/'}
                myTasksUrl={'/tasks'}
              />
            </>,
            document.body
          )}
      </div>
    </Router>
  );
}

export default App;
