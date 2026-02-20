'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '../../../hooks/useCurrentUser';
import { useApplications } from '../../../hooks/useApplications';
import ApplicationList from '../../../components/ApplicationList';

// Reuse the logic from the previous home page
export default function HeadOfDeptApplicationsPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useCurrentUser();
  const { applications, loading: appLoading, updateStatus } = useApplications();
  const [activeTab, setActiveTab] = useState<'PENDING' | 'HISTORY'>('PENDING');

  useEffect(() => {
    if (!userLoading && !user) router.push('/');
    if (!userLoading && user && user.role !== 'HEAD_OF_DEPARTMENT') router.push('/');
  }, [user, userLoading, router]);

  if (userLoading || appLoading) {
    return (
        <div className="flex justify-center items-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
        </div>
    );
  }

  const pendingApps = applications.filter(app => app.status === 'PENDING_DEPT_HEAD');
  const historyApps = applications.filter(app => app.status !== 'PENDING_DEPT_HEAD');
  const displayApps = activeTab === 'PENDING' ? pendingApps : historyApps;

  const handleApprove = async (id: string) => {
    if (confirm('ยืนยันอนุมัติคำร้องนี้?')) {
        await updateStatus(id, 'APPROVED'); 
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('ระบุเหตุผลที่ไม่อนุมัติ/แก้ไข (ถ้ามี):');
    if (reason !== null) {
        await updateStatus(id, 'REJECTED', reason);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">รายการคำร้อง (Applications)</h1>
        <p className="text-gray-600 mt-1">ภาควิชา: {user?.department?.name || '-'}</p>
      </div>

      <div className="bg-white shadow rounded-lg bg-gray-50 border border-gray-200">
          <div className="border-b border-gray-200 px-6 pt-4">
              <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab('PENDING')}
                    className={`${activeTab === 'PENDING' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  >
                      รอการอนุมัติ ({pendingApps.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('HISTORY')}
                    className={`${activeTab === 'HISTORY' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  >
                      ประวัติทั้งหมด ({historyApps.length})
                  </button>
              </nav>
          </div>

          <div className="p-6">
             <ApplicationList 
                applications={displayApps} 
                isApprover={true}
                onApprove={handleApprove}
                onReject={handleReject}
             />
          </div>
      </div>
    </div>
  );
}
