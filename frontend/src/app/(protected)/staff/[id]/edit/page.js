/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { fetchAPI } from '../../../../../lib/api';
import StaffForm from '../../../../../components/StaffForm';
import { useCurrentUser } from '../../../../../context/UserContext';

export default function EditStaffPage({ params }) {
  const router = useRouter();
  const user = useCurrentUser();
  const fileInputRef = useRef(null);
  
  const { id } = use(params);

  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [timestamp, setTimestamp] = useState(0);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  useEffect(() => {
    const loadStaff = async () => {
      try {
        const data = await fetchAPI(`/api/staff/${id}`);
        setStaff(data.data);
      } catch (err) {
        setError('Failed to load staff details.');
      } finally {
        setLoading(false);
      }
    };
    loadStaff();
  }, [id]);

  if (user.role !== 'admin') {
    return <div className="text-center py-10 text-red-500 font-bold">Unauthorized. Admin access required.</div>;
  }

  if (loading) return <div className="text-center py-10 text-gray-500">Loading...</div>;
  if (!staff) return <div className="text-center py-10 text-red-500 font-bold">{error}</div>;

  const handleSubmit = async (payload) => {
    try {
      setError('');
      await fetchAPI(`/api/staff/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      router.push('/staff');
    } catch (err) {
      setError(err.message || 'Failed to update staff record.');
    }
  };

  const handleUploadPhoto = async () => {
    const file = fileInputRef.current?.files[0];
    if (!file) {
      setUploadError('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('photo', file);

    try {
      setUploadError('');
      setUploadSuccess('');
      const data = await fetchAPI(`/api/staff/${id}/photo`, {
        method: 'POST',
        body: formData,
      });
      setStaff(data.data); // Update staff state with new photoPath
      setUploadSuccess('Photo uploaded successfully!');
      setTimestamp(Date.now());
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setUploadError(err.message || 'Failed to upload photo.');
    }
  };

  return (
    <div>
      <StaffForm mode="edit" initialData={staff} onSubmit={handleSubmit} error={error} />

      <div className="bg-white rounded-xl shadow p-8 max-w-2xl mx-auto mt-8">
        <h3 className="text-xl font-bold mb-6 text-gray-900">Staff Photo</h3>
        
        {uploadError && <div className="mb-4 text-red-600 text-sm">{uploadError}</div>}
        {uploadSuccess && <div className="mb-4 text-green-600 text-sm">{uploadSuccess}</div>}

        <div className="flex items-center gap-6">
          <div className="h-24 w-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden border">
            {staff.photoPath ? (
              <img 
                src={`${API_URL}/${staff.photoPath}?t=${timestamp}`} 
                alt="Staff Photo" 
                className="h-full w-full object-cover" 
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-gray-400">No Photo</div>
            )}
          </div>
          
          <div className="flex-1 space-y-3">
            <input 
              type="file" 
              ref={fileInputRef}
              accept="image/jpeg,image/png,image/webp"
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-indigo-50 file:text-indigo-700
                hover:file:bg-indigo-100"
            />
            <button
              type="button"
              onClick={handleUploadPhoto}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none"
            >
              Upload Photo
            </button>
            <p className="text-xs text-gray-500">Only JPEG, PNG, and WebP (max 2MB).</p>
          </div>
        </div>
      </div>
    </div>
  );
}
