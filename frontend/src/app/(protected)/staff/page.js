'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { fetchAPI } from '../../../lib/api';
import { useCurrentUser } from '../../../context/UserContext';
import StaffTable from '../../../components/StaffTable';
import ConfirmDialog from '../../../components/ConfirmDialog';

export default function StaffPage() {
  const user = useCurrentUser();
  const [data, setData] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters & Pagination state
  const [page, setPage] = useState(1);
  const limit = 10;
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const [position, setPosition] = useState('');

  // Delete dialog state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);

  const fetchStaff = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = new URLSearchParams({
        page,
        limit,
        ...(search && { search }),
        ...(status && { status }),
        ...(employmentType && { employmentType }),
        ...(position && { position }),
      });

      const response = await fetchAPI(`/api/staff?${params.toString()}`);
      setData(response.data);
    } catch (err) {
      setError('Failed to fetch staff records.');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, status, employmentType, position]);

  useEffect(() => {
    // Debounce search
    const delayDebounceFn = setTimeout(() => {
      fetchStaff();
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [fetchStaff]);

  const handleClearFilters = () => {
    setSearch('');
    setStatus('');
    setEmploymentType('');
    setPosition('');
    setPage(1);
  };

  const handleDeleteConfirm = async () => {
    if (!staffToDelete) return;
    try {
      await fetchAPI(`/api/staff/${staffToDelete.id}`, { method: 'DELETE' });
      setIsConfirmOpen(false);
      setStaffToDelete(null);
      fetchStaff(); // refresh current page
    } catch (err) {
      alert('Failed to delete staff: ' + err.message);
    }
  };

  const openDeleteDialog = (staff) => {
    setStaffToDelete(staff);
    setIsConfirmOpen(true);
  };

  const totalPages = Math.ceil(data.total / limit) || 1;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
        {user.role === 'admin' && (
          <Link
            href="/staff/new"
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
          >
            Add Staff
          </Link>
        )}
      </div>

      <div className="bg-white p-4 rounded-lg shadow mb-6 space-y-4 sm:space-y-0 sm:flex sm:gap-4 sm:items-end text-gray-900">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <input
            type="text"
            placeholder="Search name or ID..."
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border p-2 text-gray-900 bg-white"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <div className="w-full sm:w-48">
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border p-2 text-gray-900 bg-white"
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          >
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Resigned">Resigned</option>
          </select>
        </div>
        <div className="w-full sm:w-48">
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border p-2 text-gray-900 bg-white"
            value={employmentType}
            onChange={(e) => { setEmploymentType(e.target.value); setPage(1); }}
          >
            <option value="">All Types</option>
            <option value="Permanent">Permanent</option>
            <option value="Contract">Contract</option>
            <option value="Internship">Internship</option>
          </select>
        </div>
        <div className="w-full sm:w-48">
          <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
          <select
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border p-2 text-gray-900 bg-white"
            value={position}
            onChange={(e) => { setPosition(e.target.value); setPage(1); }}
          >
            <option value="">All Positions</option>
            <option value="IT Staff">IT Staff</option>
            <option value="Management">Management</option>
            <option value="Comic Mentor">Comic Mentor</option>
            <option value="3D Mentor">3D Mentor</option>
          </select>
        </div>
        <button
          onClick={handleClearFilters}
          className="w-full sm:w-auto px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Clear
        </button>
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}
      
      {loading && !data.items.length ? (
        <div className="text-center py-10 text-gray-500">Loading...</div>
      ) : (
        <>
          <StaffTable data={data.items} role={user.role} onDeleteClick={openDeleteDialog} />
          
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span>
              {' '} ({data.total} total items)
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Delete Staff"
        message={`Are you sure you want to delete ${staffToDelete?.fullName}? This action cannot be undone and will remove their photo.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => { setIsConfirmOpen(false); setStaffToDelete(null); }}
      />
    </div>
  );
}
