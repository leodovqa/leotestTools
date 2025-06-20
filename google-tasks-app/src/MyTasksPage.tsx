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

function isToday(dateStr: string) {
  const today = new Date();
  const d = new Date(dateStr);
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  );
}

function isTomorrow(dateStr: string) {
  const tomorrow = new Date(Date.now() + 86400000);
  const d = new Date(dateStr);
  return (
    d.getFullYear() === tomorrow.getFullYear() &&
    d.getMonth() === tomorrow.getMonth() &&
    d.getDate() === tomorrow.getDate()
  );
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

  // Group tasks
  const todayTasks = tasks.filter((t) => t.due && isToday(t.due));
  const tomorrowTasks = tasks.filter((t) => t.due && isTomorrow(t.due));
  const otherTasks = tasks.filter((t) => t.due && !isToday(t.due) && !isTomorrow(t.due));
  const noDueTasks = tasks.filter((t) => !t.due);

  // Group otherTasks by date
  const otherTasksByDate: { [date: string]: Task[] } = {};
  otherTasks.forEach((t) => {
    if (!t.due) return;
    if (!otherTasksByDate[t.due]) otherTasksByDate[t.due] = [];
    otherTasksByDate[t.due].push(t);
  });

  // Helper to render a card for a group
  const renderTaskCard = (label: string, tasks: Task[], dateStr?: string) =>
    tasks.length > 0 && (
      <div className="addtask-card addtask-dark-card w-full max-w-lg mx-auto mb-12 shadow-2xl" style={{padding: '1.7rem 1.7rem 1.2rem 1.7rem', borderRadius: '1.5rem', boxShadow: '0 8px 32px 0 rgba(0,0,0,0.32), 0 2px 8px 0 rgba(0,0,0,0.18)'}}>
        <div className="flex items-center gap-2 mb-5">
          <span className="text-lg font-bold text-blue-200 tracking-wide">{label}</span>
          {dateStr && (
            <span className="ml-2 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-900 text-yellow-300">
              {formatDateDisplay(dateStr)}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-3">
          {tasks.map((task) => (
            <TaskRow key={task.id} task={task} />
          ))}
        </div>
      </div>
    );

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
      <div className="w-full max-w-2xl flex flex-col items-center mb-8">
        <div className="text-2xl font-bold text-white mb-2">My Tasks</div>
        <div className="flex items-center gap-2 mb-10 mt-4">
          <button
            className="text-blue-300 hover:underline font-medium text-base px-4 py-2 rounded transition"
            style={{ marginTop: '0.5rem' }}
            onClick={() => navigate('/')}
          >
            Add a task
          </button>
        </div>
      </div>
      {loading && (
        <div className="addtask-card addtask-dark-card w-full max-w-lg mx-auto flex items-center justify-center min-h-[120px] text-lg text-gray-300 mb-12">
          Loading tasks...
        </div>
      )}
      {error && (
        <div className="addtask-card addtask-dark-card w-full max-w-lg mx-auto flex items-center justify-center min-h-[120px] text-lg text-red-400 mb-12">
          {error}
        </div>
      )}
      {!loading && !error && tasks.length === 0 && (
        <div className="addtask-card addtask-dark-card w-full max-w-lg mx-auto flex flex-col items-center justify-center min-h-[120px] text-gray-400 mb-12">
          <svg width="48" height="48" fill="none" viewBox="0 0 24 24" className="mb-2"><circle cx="12" cy="12" r="10" stroke="#374151" strokeWidth="2"/><path d="M8 12l2 2 4-4" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          No tasks yet. Enjoy your day!
        </div>
      )}
      {!loading && !error && (
        <>
          {renderTaskCard('Today', todayTasks)}
          {renderTaskCard('Tomorrow', tomorrowTasks)}
          {Object.keys(otherTasksByDate).sort().map((date) =>
            renderTaskCard(formatDateDisplay(date), otherTasksByDate[date], date)
          )}
          {renderTaskCard('No Due Date', noDueTasks)}
        </>
      )}
    </div>
  );
};

function TaskRow({ task }: { task: Task }) {
  return (
    <div className="flex items-center gap-3 bg-[#181b20] rounded-lg px-3 py-2 shadow-sm" style={{ minHeight: 48 }}>
      <div style={{ minWidth: 36, display: 'flex', justifyContent: 'center' }}>
        <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-400 bg-gray-800 rounded-full border-gray-600 focus:ring-blue-500" checked={task.status === 'completed'} readOnly />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-base text-white truncate">{task.title}</div>
        {task.notes && <div className="text-sm text-gray-400 truncate">{task.notes}</div>}
      </div>
    </div>
  );
}

export default MyTasksPage;
