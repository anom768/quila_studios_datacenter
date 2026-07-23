'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchAPI } from '../../../../lib/api';
import StaffForm from '../../../../components/StaffForm';
import { useCurrentUser } from '../../../../context/UserContext';

export default function NewStaffPage() {
  const router = useRouter();
  const user = useCurrentUser();
  const [error, setError] = useState('');

  if (user.role !== 'admin') {
    return <div className="text-center py-10 text-red-500 font-bold">Unauthorized. Admin access required.</div>;
  }

  const handleSubmit = async (payload) => {
    try {
      setError('');
      await fetchAPI('/api/staff', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      router.push('/staff');
    } catch (err) {
      setError(err.message || 'Failed to create staff record.');
    }
  };

  return (
    <div>
      <StaffForm mode="create" onSubmit={handleSubmit} error={error} />
    </div>
  );
}
