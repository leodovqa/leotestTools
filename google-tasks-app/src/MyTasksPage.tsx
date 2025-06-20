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

function groupTasksByDate(tasks: Task[]) {
  const today = new Date();
  const tomorrow = new Date(Date.now() + 86400000);
  const groups: { [key: string]: Task[] } = {};
  tasks.forEach((task) => {
    if (!task.due) {
      if (!groups['No Due Date']) groups['No Due Date'] = [];
      groups['No Due Date'].push(task);
    } else {
      const d = new Date(task.due);
      if (
        d.getFullYear() === today.getFullYear() &&
        d.getMonth() === today.getMonth() &&
        d.getDate() === today.getDate()
      ) {
        if (!groups['Today']) groups['Today'] = [];
        groups['Today'].push(task);
      } else if (
        d.getFullYear() === tomorrow.getFullYear() &&
        d.getMonth() === tomorrow.getMonth() &&
        d.getDate() === tomorrow.getDate()
      ) {
        if (!groups['Tomorrow']) groups['Tomorrow'] = [];
        groups['Tomorrow'].push(task);
      } else {
        const label = d.toLocaleDateString(undefined, {
          weekday: 'short',
          month: 'short',
          day: '2-digit',
        });
        if (!groups[label]) groups[label] = [];
        groups[label].push(task);
      }
    }
  });
  return groups;
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
  const grouped = groupTasksByDate(sortedTasks);
  const groupOrder = ['Today', 'Tomorrow', ...Object.keys(grouped).filter(k => k !== 'Today' && k !== 'Tomorrow' && k !== 'No Due Date').sort(), 'No Due Date'];

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
          overflow: 'visible',
        }}
      >
        {/* Vertical divider for the whole card */}
        <div style={{ position: 'absolute', left: 48, top: 0, bottom: 0, width: 1, background: '#232b3b', zIndex: 1 }} />
        <div style={{ width: '100%' }}>
          {groupOrder.map(
            (group) =>
              grouped[group] && (
                <React.Fragment key={group}>
                  {/* Section header row */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '48px 1fr',
                    alignItems: 'center',
                    marginBottom: 8,
                    marginTop: 24,
                  }}>
                    <div></div>
                    <div style={{
                      fontWeight: 700,
                      fontSize: 18,
                      color: group === 'Today' ? '#60a5fa' : group === 'Tomorrow' ? '#a78bfa' : '#e5e7eb',
                      textAlign: 'center',
                      width: '100%',
                    }}>{group}</div>
                  </div>
                  {/* Task rows */}
                  {grouped[group].map((task) => (
                    <div key={task.id} style={{ display: 'grid', gridTemplateColumns: '48px 1fr', alignItems: 'flex-start', minHeight: 40, marginBottom: 8 }}>
                      {/* Checkbox cell */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start', width: 48, marginLeft: '-12px' }}>
                        <input
                          type="checkbox"
                          className="form-checkbox h-5 w-5 text-blue-400 bg-gray-800 rounded-full border-gray-600 focus:ring-blue-500"
                          checked={task.status === 'completed'}
                          readOnly
                        />
                      </div>
                      {/* Content cell */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', paddingLeft: 24, textAlign: 'left' }}>
                        <div className="font-medium text-base text-white" style={{ lineHeight: 1.3, textAlign: 'left', wordBreak: 'break-word' }}>{task.title}</div>
                        {task.notes && <div className="text-sm text-gray-400" style={{ lineHeight: 1.2, textAlign: 'left', wordBreak: 'break-word' }}>{task.notes}</div>}
                      </div>
                    </div>
                  ))}
                </React.Fragment>
              )
          )}
        </div>
      </div>
    </div>
  );
};

export default MyTasksPage;
