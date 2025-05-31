'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import TaskList from '@/components/TaskList';

export default function Home() {
  const { data: session } = useSession();

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Google Tasks Manager</h1>
        
        {!session ? (
          <div className="text-center">
            <p className="mb-4">Please sign in to manage your tasks</p>
            <button
              onClick={() => signIn('google')}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Sign in with Google
            </button>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-8">
              <p>Welcome, {session.user?.name}</p>
              <button
                onClick={() => signOut()}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                Sign out
              </button>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Your Tasks</h2>
              <TaskList />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
