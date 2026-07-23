'use client';

import { useCurrentUser } from '../../../context/UserContext';

export default function DashboardPage() {
  const user = useCurrentUser();

  return (
    <div className="bg-white rounded-xl shadow p-8">
      <div className="border-b pb-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      </div>
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">User Info</h2>
        <div className="bg-gray-100 p-4 rounded-md">
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Role:</strong> <span className="inline-block bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-sm font-semibold capitalize">{user.role}</span></p>
          <p><strong>User ID:</strong> {user.id}</p>
        </div>
        <p className="text-gray-500 text-sm mt-4">
          This is a placeholder dashboard. The actual business logic will be implemented in later phases.
        </p>
      </div>
    </div>
  );
}
