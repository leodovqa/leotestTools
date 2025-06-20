import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

interface Task {
  id: string;
  title: string;
  notes?: string;
  due?: string; // ISO date string
  status?: string;
}

function formatDateDisplay(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatDatePill(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(Date.now() + 86400000);
  if (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  ) {
    return 'Today';
  }
  if (
    d.getFullYear() === tomorrow.getFullYear() &&
    d.getMonth() === tomorrow.getMonth() &&
    d.getDate() === tomorrow.getDate()
  ) {
    return 'Tomorrow';
  }
  // Google Tasks web uses 'Sun, Jun 22' format
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: '2-digit',
  });
}

function sortTasks(tasks: Task[]): Task[] {
  // Today, Tomorrow, then by due date, then no due date
  return [...tasks].sort((a, b) => {
    if (!a.due && b.due) return 1;
    if (a.due && !b.due) return -1;
    if (!a.due && !b.due) return 0;
    return new Date(a.due!).getTime() - new Date(b.due!).getTime();
  });
}

const MyTasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`${API_BASE_URL}/api/tasks/list`, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch tasks');
        return res.json();
      })
      .then((data) => {
        setTasks(data.tasks || []);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message || 'Failed to fetch tasks');
        setLoading(false);
      });
  }, []);

  const sortedTasks = sortTasks(tasks);

  return (
    <div
      style={{
        minHeight: '80vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: '2rem 1rem',
        boxSizing: 'border-box',
      }}
    >
      <div className="w-full max-w-2xl flex flex-col items-center" style={{ marginBottom: '2.5rem' }}>
        <div className="text-2xl font-bold text-white mb-2">My Tasks</div>
        <div className="w-full flex items-center mb-6">
          <button
            className="flex items-center gap-2 text-blue-300 hover:underline font-medium text-base px-2 py-1 rounded transition"
            onClick={() => navigate('/')}
            style={{ background: 'none', boxShadow: 'none', fontWeight: 500 }}
          >
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#232b3b] text-blue-400" style={{ fontSize: 22, fontWeight: 600, marginRight: 6 }}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            </span>
            Add a task
          </button>
        </div>
      </div>
      <div
        className="addtask-card addtask-dark-card w-full mx-auto shadow-2xl"
        style={{
          maxWidth: '520px',
          width: '100%',
          minHeight: 400,
          maxHeight: '80vh',
          overflowY: 'auto',
          borderRadius: '1.7rem',
          boxShadow: '0 10px 36px 0 rgba(0,0,0,0.36), 0 4px 12px 0 rgba(0,0,0,0.20)',
          padding: '2rem 2rem 1.5rem 0',
          position: 'relative',
          display: 'grid',
          gridTemplateColumns: '48px 1fr',
        }}
      >
        {/* Vertical divider for the whole card */}
        <div style={{ position: 'absolute', left: 48, top: 0, bottom: 0, width: 1, background: '#232b3b', zIndex: 1 }} />
        {/* Checkbox column */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
          {sortedTasks.map((task, idx) => (
            <div key={task.id} style={{ height: 48, display: 'flex', alignItems: 'center', width: '100%' }}>
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-blue-400 bg-gray-800 rounded-full border-gray-600 focus:ring-blue-500"
                checked={task.status === 'completed'}
                readOnly
              />
            </div>
          ))}
        </div>
        {/* Content column */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', paddingLeft: 24, zIndex: 2 }}>
          {loading && (
            <div className="flex items-center justify-center min-h-[120px] text-lg text-gray-300 mb-14">
              Loading tasks...
            </div>
          )}
          {error && (
            <div className="flex items-center justify-center min-h-[120px] text-lg text-red-400 mb-14">
              {error}
            </div>
          )}
          {!loading && !error && sortedTasks.length === 0 && (
            <div className="flex flex-col items-center justify-center min-h-[120px] text-gray-400 mb-14">
              <svg width="48" height="48" fill="none" viewBox="0 0 24 24" className="mb-2"><circle cx="12" cy="12" r="10" stroke="#374151" strokeWidth="2"/><path d="M8 12l2 2 4-4" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              No tasks yet. Enjoy your day!
            </div>
          )}
          {!loading && !error && (
            <div className="flex flex-col w-full" style={{ marginTop: 0 }}>
              {sortedTasks.map((task, idx) => (
                <div key={task.id} style={{ minHeight: 48, display: 'flex', flexDirection: 'column', justifyContent: 'center', marginBottom: 4 }}>
                  <div className="font-medium text-base text-white" style={{ lineHeight: 1.3, textAlign: 'left', wordBreak: 'break-word' }}>{task.title}</div>
                  {task.notes && <div className="text-sm text-gray-400" style={{ lineHeight: 1.2, textAlign: 'left', wordBreak: 'break-word' }}>{task.notes}</div>}
                  {task.due && (
                    <span
                      className="mt-1 px-3 py-1 rounded-full text-xs font-semibold border"
                      style={{
                        borderColor: formatDatePill(task.due) === 'Today' ? '#60a5fa' : formatDatePill(task.due) === 'Tomorrow' ? '#a78bfa' : '#374151',
                        background: formatDatePill(task.due) === 'Today' ? 'rgba(96,165,250,0.08)' : formatDatePill(task.due) === 'Tomorrow' ? 'rgba(167,139,250,0.08)' : 'rgba(55,65,81,0.12)',
                        color: formatDatePill(task.due) === 'Today' ? '#60a5fa' : formatDatePill(task.due) === 'Tomorrow' ? '#a78bfa' : '#e5e7eb',
                        fontWeight: 500,
                        minWidth: 80,
                        textAlign: 'center',
                        marginTop: 2,
                        display: 'inline-block',
                      }}
                    >
                      {formatDatePill(task.due)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyTasksPage;
