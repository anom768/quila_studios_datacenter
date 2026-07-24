/* eslint-disable @next/next/no-img-element */
'use client';

import Link from 'next/link';

export default function StaffTable({ data, role, onDeleteClick }) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  if (!data || data.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6 text-center text-gray-500">
        No staff records found.
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-x-auto text-gray-900">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Photo</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff ID</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            {role === 'admin' && (
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((staff) => (
            <tr key={staff.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="h-10 w-10 flex-shrink-0">
                  {staff.photoPath ? (
                    <img className="h-10 w-10 rounded-full object-cover" src={`${API_URL}/${staff.photoPath}`} alt={staff.fullName} />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                      {staff.fullName.charAt(0)}
                    </div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{staff.staffId}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{staff.fullName}</div>
                <div className="text-sm text-gray-500">{staff.email}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{staff.position}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{staff.employmentType}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                  ${staff.status === 'Active' ? 'bg-green-100 text-green-800' : ''}
                  ${staff.status === 'Inactive' ? 'bg-gray-100 text-gray-800' : ''}
                  ${staff.status === 'Resigned' ? 'bg-red-100 text-red-800' : ''}
                `}>
                  {staff.status}
                </span>
              </td>
              {role === 'admin' && (
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link href={`/staff/${staff.id}/edit`} className="text-indigo-600 hover:text-indigo-900 mr-4">
                    Edit
                  </Link>
                  <button onClick={() => onDeleteClick(staff)} className="text-red-600 hover:text-red-900">
                    Delete
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
