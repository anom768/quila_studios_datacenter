'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchAPI } from '../../lib/api';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await fetchAPI('/api/auth/me');
        setUser(data.data);
      } catch (err) {
        // Redirect to login if unauthorized
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetchAPI('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) return null; // Wait for redirect

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow p-8">
        <div className="flex justify-between items-center mb-8 border-b pb-4">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
          >
            Logout
          </button>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">User Info</h2>
          <div className="bg-gray-100 p-4 rounded-md">
            <p><strong>Username:</strong> {user.username}</p>
            <p><strong>Role:</strong> <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-semibold capitalize">{user.role}</span></p>
            <p><strong>User ID:</strong> {user.id}</p>
          </div>
          <p className="text-gray-500 text-sm mt-4">
            This is a placeholder dashboard. The actual business logic will be implemented in later phases.
          </p>
        </div>
      </div>
    </div>
  );
}
