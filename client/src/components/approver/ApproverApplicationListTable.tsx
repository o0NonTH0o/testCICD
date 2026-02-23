'use client';

import React, { useState } from 'react';
import { AwardApplication } from '../../types';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '../../hooks/useCurrentUser';

interface Props {
  applications: AwardApplication[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onBulkApprove: (ids: string[]) => void;
  onBulkReject: (ids: string[]) => void;
  isActionEnabled?: boolean;
}

export default function ApproverApplicationListTable({ 
    applications, 
    onApprove, 
    onReject, 
    onBulkApprove, 
    onBulkReject, 
    isActionEnabled = true 
}: Props) {
  const router = useRouter();
  const { user } = useCurrentUser();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const basePath = user?.role === 'HEAD_OF_DEPARTMENT' ? '/head_of_department' : 
                   user?.role === 'VICE_DEAN' ? '/vice_dean' : 
                   user?.role === 'DEAN' ? '/dean' :
                   user?.role === 'COMMITTEE' ? '/committee' : '/approver';

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(applications.map(app => app.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-[#f8f9fa]">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dep./Fac.
              </th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Details
              </th>
              {isActionEnabled && (
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
              )}
              {isActionEnabled && (
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                      checked={applications.length > 0 && selectedIds.size === applications.length}
                      onChange={handleSelectAll}
                    />
                  </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {applications.map((app) => (
              <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{app.user?.name || '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{app.user?.actualId || '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{app.user?.tel || '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{app.user?.email || '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500 truncate max-w-xs">{app.user?.department?.name || app.user?.faculty?.facultyName || '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <button 
                    onClick={() => router.push(`${basePath}/applications/${app.id}`)}
                    className="inline-flex items-center px-4 py-1.5 border border-transparent text-xs font-medium rounded text-cyan-700 bg-cyan-50 hover:bg-cyan-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
                  >
                    View
                  </button>
                </td>
                {isActionEnabled && (
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex justify-center space-x-2">
                        <button
                            onClick={() => onApprove(app.id)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                            Approve
                        </button>
                        <button
                            onClick={() => onReject(app.id)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                            Reject
                        </button>
                    </div>
                    </td>
                )}
                {isActionEnabled && (
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                    <input
                        type="checkbox"
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer w-4 h-4"
                        checked={selectedIds.has(app.id)}
                        onChange={() => handleSelect(app.id)}
                    />
                    </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bulk Actions Footer */}
      {isActionEnabled && selectedIds.size > 0 && (
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between animate-fade-in-up">
           <div className="flex items-center space-x-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 text-sm font-semibold text-gray-700">
                {selectedIds.size}
              </span>
              <span className="text-sm font-medium text-gray-700">User Selected</span>
           </div>
           
           <div className="flex space-x-4">
              <button
                onClick={() => {
                    onBulkApprove(Array.from(selectedIds));
                    setSelectedIds(new Set());
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-green-900 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-sm"
              >
                Approve Selection
              </button>
              <button
                onClick={() => {
                    onBulkReject(Array.from(selectedIds));
                    setSelectedIds(new Set());
                }}
                 className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-sm"
              >
                Reject Selection
              </button>
              <button
                onClick={() => setSelectedIds(new Set())}
                className="text-sm text-gray-500 hover:text-gray-700 font-medium px-4 py-2"
              >
                Cancel
              </button>
           </div>
        </div>
      )}
    </div>
  );
}
