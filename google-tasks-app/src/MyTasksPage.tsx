import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/MyTasksPage.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

interface Task {
  id: string;
  title: string;
  notes?: string;
  due?: string; // ISO date string
  status?: string;
  completed?: string; // ISO date string
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
  const navigate = useNavigate();
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/tasks/list`, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch tasks');
        return res.json();
      })
      .then((data) => {
        setTasks(data.tasks || []);
      })
      .catch((e) => {
        console.error(e.message || 'Failed to fetch tasks');
      });
  }, []);

  const sortedTasks = sortTasks(tasks);
  const activeTasks = sortedTasks.filter((t) => t.status !== 'completed');
  const completedTasks = sortedTasks.filter((t) => t.status === 'completed');
  const grouped = groupTasksByDate(activeTasks);
  const groupOrder = [
    'Today',
    'Tomorrow',
    ...Object.keys(grouped)
      .filter((k) => k !== 'Today' && k !== 'Tomorrow' && k !== 'No Due Date')
      .sort(),
    'No Due Date',
  ];

  function formatCompletedDate(dateStr: string) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
    });
  }

  async function handleToggleTaskStatus(task: Task) {
    setUpdatingTaskId(task.id);
    const newStatus = task.status === 'completed' ? 'needsAction' : 'completed';
    await fetch(`${API_BASE_URL}/api/tasks/update-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ id: task.id, status: newStatus }),
    });
    // Refetch tasks after update
    fetch(`${API_BASE_URL}/api/tasks/list`, { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => setTasks(data.tasks || []))
      .finally(() => setUpdatingTaskId(null));
  }

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
      <div
        className="w-full max-w-2xl flex flex-col items-center"
        style={{ marginBottom: '2.5rem' }}
      >
        <div className="text-2xl font-bold text-white mb-2">My Tasks</div>
        <div className="w-full flex items-center mb-6">
          <button
            className="flex items-center gap-2 text-blue-300 hover:underline font-medium text-base px-2 py-1 rounded transition"
            onClick={() => navigate('/')}
            style={{ background: 'none', boxShadow: 'none', fontWeight: 500 }}
          >
            <span
              className="flex items-center justify-center w-7 h-7 rounded-full bg-[#232b3b] text-blue-400"
              style={{ fontSize: 22, fontWeight: 600, marginRight: 6 }}
            >
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                <path
                  d="M12 5v14M5 12h14"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            Add a task
          </button>
        </div>
      </div>
      <div
        className="addtask-card addtask-dark-card tasklist-card w-full mx-auto shadow-2xl"
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
        <div
          style={{
            position: 'absolute',
            left: 48,
            top: 0,
            bottom: 0,
            width: 1,
            background: '#232b3b',
            zIndex: 1,
          }}
        />
        <div style={{ width: '100%' }}>
          {groupOrder.map(
            (group) =>
              grouped[group] && (
                <React.Fragment key={group}>
                  {/* Section header row */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '48px 1fr',
                      alignItems: 'center',
                      marginBottom: 8,
                      marginTop: 24,
                    }}
                  >
                    <div></div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 18,
                        color:
                          group === 'Today'
                            ? '#60a5fa'
                            : group === 'Tomorrow'
                              ? '#a78bfa'
                              : '#e5e7eb',
                        textAlign: 'center',
                        width: '100%',
                      }}
                    >
                      {group}
                    </div>
                  </div>
                  {/* Task rows */}
                  {grouped[group].map((task) => (
                    <div
                      key={task.id}
                      style={{
                        display: 'flex',
                        alignItems: 'baseline',
                        minHeight: 40,
                        marginBottom: 8,
                      }}
                    >
                      {/* Checkbox cell */}
                      <div className="tasklist-checkbox" style={{ width: 48, marginRight: 0 }}>
                        <input
                          type="checkbox"
                          className="form-checkbox h-5 w-5 text-blue-400 bg-gray-800 border-gray-600 focus:ring-blue-500"
                          checked={task.status === 'completed'}
                          disabled={updatingTaskId === task.id}
                          onChange={() => handleToggleTaskStatus(task)}
                        />
                      </div>
                      {/* Content cell */}
                      <div className="tasklist-content">
                        <div
                          className="task-title font-medium text-base text-white"
                          style={{ wordBreak: 'break-word' }}
                        >
                          {task.title}
                        </div>
                        {task.notes && (
                          <div
                            className="task-notes text-sm text-gray-400"
                            style={{ wordBreak: 'break-word' }}
                          >
                            {task.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </React.Fragment>
              )
          )}
        </div>
      </div>
      {/* Completed Tasks Card */}
      {completedTasks.length > 0 && (
        <div
          className="addtask-card addtask-dark-card tasklist-card w-full mx-auto shadow-2xl"
          style={{
            maxWidth: '520px',
            width: '100%',
            minHeight: 100,
            maxHeight: '80vh',
            overflowY: 'auto',
            borderRadius: '1.7rem',
            boxShadow: '0 10px 36px 0 rgba(0,0,0,0.36), 0 4px 12px 0 rgba(0,0,0,0.20)',
            padding: '2rem 2rem 1.5rem 0',
            position: 'relative',
            overflow: 'visible',
            marginTop: '2.5rem',
          }}
        >
          {/* Vertical divider for the whole card */}
          <div
            style={{
              position: 'absolute',
              left: 48,
              top: 0,
              bottom: 0,
              width: 1,
              background: '#232b3b',
              zIndex: 1,
            }}
          />
          <div style={{ width: '100%' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '48px 1fr',
                alignItems: 'center',
                marginBottom: 8,
                marginTop: 0,
              }}
            >
              <div></div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 18,
                  color: '#a3e635',
                  textAlign: 'center',
                  width: '100%',
                }}
              >
                Completed
              </div>
            </div>
            {completedTasks.map((task) => (
              <div
                key={task.id}
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  minHeight: 40,
                  marginBottom: 8,
                }}
              >
                {/* Checkmark cell */}
                <button
                  className="tasklist-checkbox completed-check-btn"
                  style={{
                    width: 48,
                    marginRight: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'none',
                    border: 'none',
                    cursor: updatingTaskId === task.id ? 'not-allowed' : 'pointer',
                    padding: 0,
                  }}
                  onClick={() => handleToggleTaskStatus(task)}
                  disabled={updatingTaskId === task.id}
                  title="Mark as incomplete"
                >
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="8" stroke="#60a5fa" strokeWidth="2" fill="#181b20" />
                    <path
                      d="M6 10.5L9 13.5L14 8.5"
                      stroke="#60a5fa"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                {/* Content cell */}
                <div className="tasklist-content">
                  <div
                    className="task-title font-medium text-base text-white"
                    style={{ wordBreak: 'break-word' }}
                  >
                    {task.title}
                  </div>
                  {task.notes && (
                    <div
                      className="task-notes text-sm text-gray-400"
                      style={{ wordBreak: 'break-word' }}
                    >
                      {task.notes}
                    </div>
                  )}
                  <div className="text-xs text-gray-400 mt-1" style={{ fontStyle: 'italic' }}>
                    Completed: {formatCompletedDate(task.completed || '')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTasksPage;
