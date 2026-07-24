'use client';

import { useState } from 'react';

export default function StaffForm({ mode, initialData, onSubmit, error }) {
  const [formData, setFormData] = useState({
    fullName: initialData?.fullName || '',
    position: initialData?.position || 'IT Staff',
    phoneNumber: initialData?.phoneNumber || '',
    email: initialData?.email || '',
    joinDate: initialData?.joinDate ? new Date(initialData.joinDate).toISOString().split('T')[0] : '',
    exitDate: initialData?.exitDate ? new Date(initialData.exitDate).toISOString().split('T')[0] : '',
    status: initialData?.status || 'Active',
    employmentType: initialData?.employmentType || 'Permanent',
  });

  const [validationError, setValidationError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    // Client-side required field validation
    if (!formData.fullName || !formData.position || !formData.phoneNumber || !formData.email || !formData.joinDate || !formData.employmentType) {
      setValidationError('Please fill in all required fields.');
      return;
    }

    // Email basic validation
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setValidationError('Please enter a valid email address.');
      return;
    }

    const payload = { ...formData };
    if (mode === 'create') {
      delete payload.status; // Defaulted on backend
    }
    // Convert empty strings to null or remove for optional dates
    if (!payload.exitDate) {
      payload.exitDate = null;
    } else {
      payload.exitDate = new Date(payload.exitDate).toISOString();
    }
    payload.joinDate = new Date(payload.joinDate).toISOString();

    onSubmit(payload);
  };

  return (
    <div className="bg-white rounded-xl shadow p-8 max-w-2xl mx-auto mb-8 text-gray-900">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">{mode === 'create' ? 'Add New Staff' : 'Edit Staff'}</h2>
      
      {(error || validationError) && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
          {error || validationError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Full Name *</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className="mt-1 w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border"
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Position *</label>
            <select
              name="position"
              value={formData.position}
              onChange={handleChange}
              className="mt-1 w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border"
              required
            >
              <option value="IT Staff">IT Staff</option>
              <option value="Management">Management</option>
              <option value="Comic Mentor">Comic Mentor</option>
              <option value="3D Mentor">3D Mentor</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Employment Type *</label>
            <select
              name="employmentType"
              value={formData.employmentType}
              onChange={handleChange}
              className="mt-1 w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border"
              required
            >
              <option value="Permanent">Permanent</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone Number *</label>
            <input
              type="text"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="mt-1 w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Join Date *</label>
            <input
              type="date"
              name="joinDate"
              value={formData.joinDate}
              onChange={handleChange}
              className="mt-1 w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Exit Date</label>
            <input
              type="date"
              name="exitDate"
              value={formData.exitDate}
              onChange={handleChange}
              className="mt-1 w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border"
            />
          </div>
        </div>

        {mode === 'edit' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="mt-1 w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Resigned">Resigned</option>
            </select>
          </div>
        )}

        <div className="pt-4 border-t flex justify-end gap-3">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {mode === 'create' ? 'Create Staff' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
