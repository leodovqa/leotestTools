"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import TaskList from "@/components/TaskList";

export default function Home() {
  const { data: session } = useSession();

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[var(--background)] to-[var(--card-background)] p-4">
      <div className="w-full max-w-2xl flex flex-col items-center justify-center space-y-8">
        <h1 className="gradient-text text-5xl mb-2 text-center">
          Google Tasks Manager
        </h1>

        {!session ? (
          <div className="text-center card p-8 w-full">
            <p className="mb-8">Please sign in to manage your tasks</p>
            <button
              onClick={() => signIn("google")}
              className="btn-primary w-full"
            >
              Sign in with Google
            </button>
          </div>
        ) : (
          <div className="w-full space-y-6">
            <div className="flex justify-between items-center card p-4">
              <p className="welcome-text">Welcome, {session.user?.name}</p>
              <button onClick={() => signOut()} className="btn-danger">
                Sign out
              </button>
            </div>
            <div className="card p-6">
              <h2 className="mb-6">Your Tasks</h2>
              <TaskList />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
