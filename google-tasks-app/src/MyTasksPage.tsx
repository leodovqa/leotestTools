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
  const [completedOpen, setCompletedOpen] = useState(true);

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
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime()), // Sort by date
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
    <div className="tasklist-card">
      {/* Active Tasks */}
      {groupOrder.map(
        (group) =>
          grouped[group] &&
          grouped[group].length > 0 && (
            <div key={group} className="task-group">
              <div className="task-group-header">
                <div
                  className="task-group-header-title"
                  style={{
                    color:
                      group === 'Today' ? '#60a5fa' : group === 'Tomorrow' ? '#a78bfa' : '#e5e7eb',
                  }}
                >
                  {group}
                </div>
              </div>
              {grouped[group].map((task) => (
                <div key={task.id} className="task-row">
                  <div className="task-checkbox-cell">
                    <input
                      type="checkbox"
                      checked={false}
                      disabled={updatingTaskId === task.id}
                      onChange={() => handleToggleTaskStatus(task)}
                    />
                  </div>
                  <div className="task-content-cell">
                    <div className="task-title">{task.title}</div>
                    {task.notes && <div className="task-notes">{task.notes}</div>}
                  </div>
                </div>
              ))}
            </div>
          )
      )}

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div className="task-group">
          <div
            className="task-group-header is-collapsible"
            onClick={() => setCompletedOpen(!completedOpen)}
          >
            <div className="task-group-header-title" style={{ color: '#a3e635' }}>
              Completed
            </div>
            <svg
              className={`collapsible-chevron ${!completedOpen ? 'is-closed' : ''}`}
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
          {completedOpen &&
            completedTasks.map((task) => (
              <div key={task.id} className="task-row is-completed">
                <div className="task-checkbox-cell">
                  <input
                    type="checkbox"
                    checked={true}
                    disabled={updatingTaskId === task.id}
                    onChange={() => handleToggleTaskStatus(task)}
                  />
                </div>
                <div className="task-content-cell">
                  <div className="task-title">{task.title}</div>
                  {task.notes && <div className="task-notes">{task.notes}</div>}
                  {task.completed && (
                    <div className="task-completed-date">
                      Completed: {formatCompletedDate(task.completed)}
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default MyTasksPage;
