'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCurrentUser } from '../../../hooks/useCurrentUser';
import { useApplications } from '../../../hooks/useApplications';
import { useMasterData } from '../../../hooks/useMasterData';
import ApproverApplicationListTable from '../../../components/approver/ApproverApplicationListTable';

function DeanApplicationsInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeId = searchParams.get('typeId');

  const { user, loading: userLoading } = useCurrentUser();
  const { applications, loading: appLoading, updateStatus } = useApplications();
  const { awardTypes } = useMasterData();

  const [activeTab, setActiveTab] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  useEffect(() => {
    if (!userLoading && !user) router.push('/');
    if (!userLoading && user && user.role !== 'DEAN') router.push('/');
  }, [user, userLoading, router]);

  const currentAward = typeId ? awardTypes.find(t => t.id === typeId) : null;

  const getFilteredApplications = () => {
    if (!applications) return [];
    
    return applications.filter(app => {
        // 1. Award Type Filter
        if (typeId && app.typeId !== typeId && app.awardType?.id !== typeId) return false;

        // 2. Status Filter สำหรับ คณบดี (DEAN)
        if (activeTab === 'PENDING') {
            // ACCEPTED_BY_VICE_DEAN is the actual status when vice dean approves → lands in Dean's queue
            return app.status === 'ACCEPTED_BY_VICE_DEAN' || app.status === 'PENDING_DEAN';
        }
        
        if (activeTab === 'APPROVED') {
             // ใบสมัครที่ผ่านคณบดีไปแล้ว
             return [
                 'ACCEPTED_BY_DEAN', 
                 'PENDING_ADMIN', 
                 'ACCEPTED_BY_ADMIN', 
                 'REJECTED_BY_ADMIN', 
                 'PENDING_COMMITTEE', 
                 'APPROVED',
                 'REJECTED'
             ].includes(app.status || '');
        }

        if (activeTab === 'REJECTED') {
             // ใบสมัครที่ถูกคณบดีปัดตก
             return app.status === 'REJECTED_BY_DEAN';
        }

        return false;
    });
  };

  const filteredApps = (() => {
    let apps = getFilteredApplications();
    if (search.trim()) {
      const q = search.toLowerCase();
      apps = apps.filter(app =>
        app.user?.name?.toLowerCase().includes(q) ||
        app.user?.email?.toLowerCase().includes(q) ||
        app.user?.actualId?.toLowerCase().includes(q)
      );
    }
    apps = [...apps].sort((a, b) => {
      const da = new Date(a.createdAt).getTime();
      const db = new Date(b.createdAt).getTime();
      return sortOrder === 'newest' ? db - da : da - db;
    });
    return apps;
  })();

  const handleApprove = async (id: string) => {
    if (window.confirm('Are you sure you want to approve this application?')) {
        const success = await updateStatus(id, 'APPROVED', 'Approved by Dean'); 
        if (success) {
            alert('Approved successfully');
        } else {
            alert('Failed to approve');
        }
    }
  };

  const handleReject = async (id: string) => {
    const text = window.prompt('Reason for rejection:');
    if (text !== null) {
        const success = await updateStatus(id, 'REJECTED', text || 'No reason provided');
        if (success) {
            alert('Rejected successfully');
        } else {
            alert('Failed to reject');
        }
    }
  };

  const handleBulkApprove = async (ids: string[]) => {
    if (window.confirm(`Approve ${ids.length} applications?`)) {
        let successCount = 0;
        for (const id of ids) {
            const success = await updateStatus(id, 'APPROVED', 'Bulk Approved by Dean');
            if (success) successCount++;
        }
        alert(`${successCount}/${ids.length} applications approved.`);
    }
  };

  const handleBulkReject = async (ids: string[]) => {
      const text = window.prompt('Reason for rejection (Bulk All):');
      if (text !== null) {
         let successCount = 0;
         for (const id of ids) {
             const success = await updateStatus(id, 'REJECTED', text || 'No reason provided');
             if (success) successCount++;
         }
         alert(`${successCount}/${ids.length} applications rejected.`);
      }
  };

  if (userLoading || appLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
        <div className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <button onClick={() => router.back()} className="hover:text-gray-900">Faculty</button>
                    <span>/</span>
                    <span>Applications</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900">
                    {currentAward?.awardName || 'Applications'}
                </h1>
                {user?.faculty?.facultyName && (
                    <p className="text-gray-500 mt-2 text-sm">Faculty: {user.faculty.facultyName}</p>
                )}

                <div className="mt-8 flex space-x-8">
                     {(['PENDING', 'APPROVED', 'REJECTED'] as const).map((tab) => (
                         <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-4 px-2 font-medium text-sm transition-colors relative ${
                                activeTab === tab 
                                ? 'text-green-600 border-b-2 border-green-500' 
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                         >
                            {tab === 'PENDING' ? 'Pending Review' : tab.charAt(0) + tab.slice(1).toLowerCase()}
                         </button>
                     ))}
                </div>
            </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
             <div className="flex justify-between items-center mb-6">
                <div className="text-lg font-bold text-gray-900">
                     All Requests 
                     <span className="ml-2 text-sm font-normal text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                         {filteredApps.length}
                     </span>
                </div>
                <div className="flex gap-3">
                     <div className="relative">
                        <input 
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="ค้นหาชื่อ, อีเมล, รหัสนิสิต..."
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-green-500 focus:border-green-500 w-64"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </div>
                     </div>
                     <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
                        className="pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:ring-green-500 focus:border-green-500 bg-white"
                     >
                        <option value="newest">ใหม่สุด</option>
                        <option value="oldest">เก่าสุด</option>
                     </select>
                </div>
             </div>

            <ApproverApplicationListTable 
                applications={filteredApps} 
                onApprove={handleApprove} 
                onReject={handleReject}
                onBulkApprove={handleBulkApprove}
                onBulkReject={handleBulkReject}
                isActionEnabled={activeTab === 'PENDING'}
            />
        </div>
    </div>
  );
}

export default function DeanApplicationsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" />
        </div>
      }
    >
      <DeanApplicationsInner />
    </Suspense>
  );
}