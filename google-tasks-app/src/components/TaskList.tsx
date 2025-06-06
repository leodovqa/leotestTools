'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface Task {
  id: string;
  title: string;
  status: 'needsAction' | 'completed';
  due?: string;
}

export default function TaskList() {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      if (!session?.accessToken) return;

      try {
        const response = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch tasks');
        }

        const data = await response.json();
        setTasks(data.items || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [session]);

  if (loading) {
    return <div className="text-center">Loading tasks...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="space-y-4">
      {tasks.length === 0 ? (
        <p className="text-gray-500">No tasks found. Create your first task!</p>
      ) : (
        tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center justify-between p-4 bg-white rounded-lg shadow"
          >
            <div>
              <h3 className="font-medium">{task.title}</h3>
              {task.due && (
                <p className="text-sm text-gray-500">
                  Due: {new Date(task.due).toLocaleDateString()}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {/* Implement task completion */}}
                className={`px-3 py-1 rounded ${
                  task.status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {task.status === 'completed' ? 'Completed' : 'Mark Complete'}
              </button>
              <button
                onClick={() => {/* Implement task deletion */}}
                className="px-3 py-1 text-red-600 hover:bg-red-50 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
} 