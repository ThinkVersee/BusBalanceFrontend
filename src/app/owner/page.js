"use client";

import { useAuth } from "@/hooks/useAuth";

export default function OwnerPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Owner Dashboard</h2>
        <p>Welcome, {user?.name || 'Owner'}!</p>
        <p>This is the o dashboard. Only owner can access this page.</p>
        <button
          onClick={logout}
          className="mt-4 w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </div>
  );
}