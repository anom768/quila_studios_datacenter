'use client';

import { useCurrentUser } from '../../../context/UserContext';

export default function DashboardPage() {
  const user = useCurrentUser();

  return (
    <div className="bg-white rounded-xl shadow p-8 text-gray-900">
      <div className="border-b border-gray-200 pb-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      </div>
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">User Info</h2>
        <div className="bg-gray-100 p-4 rounded-md text-gray-700">
          <p><strong className="text-gray-900">Username:</strong> {user.username}</p>
          <p><strong className="text-gray-900">Role:</strong> <span className="inline-block bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-sm font-semibold capitalize">{user.role}</span></p>
          <p><strong className="text-gray-900">User ID:</strong> {user.id}</p>
        </div>
        <p className="text-gray-600 text-sm mt-4">
          This is a placeholder dashboard. The actual business logic will be implemented in later phases.
        </p>
      </div>
    </div>
  );
}
