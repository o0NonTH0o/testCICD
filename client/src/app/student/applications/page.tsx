'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '../../../hooks/useCurrentUser';
import { useApplications } from '../../../hooks/useApplications';
import ApplicationStatusCard from '../../../components/student/ApplicationStatusCard';

export default function ApplicationsPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useCurrentUser();
  const { applications, loading: appLoading, error } = useApplications();
  const [activeTab, setActiveTab] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/');
    }
  }, [user, userLoading, router]);

  if (userLoading || appLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  // Filter Logic
  const getFilteredApplications = () => {
    if (!applications) return [];
    
    return applications.filter(app => {
        if (activeTab === 'APPROVED') return app.status === 'APPROVED';
        if (activeTab === 'REJECTED') return app.status === 'REJECTED';
        // PENDING includes all other statuses except APPROVED and REJECTED
        return !['APPROVED', 'REJECTED'].includes(app.status || '');
    });
  };

  const filteredApps = (() => {
    let apps = getFilteredApplications();
    if (search.trim()) {
      const q = search.toLowerCase();
      apps = apps.filter(app =>
        app.awardType?.awardName?.toLowerCase().includes(q) ||
        app.user?.name?.toLowerCase().includes(q)
      );
    }
    apps = [...apps].sort((a, b) => {
      const da = new Date(a.createdAt).getTime();
      const db = new Date(b.createdAt).getTime();
      return sortOrder === 'newest' ? db - da : da - db;
    });
    return apps;
  })();

  // Stats for the tabs
  const pendingCount = applications ? applications.filter(a => !['APPROVED', 'REJECTED'].includes(a.status || '')).length : 0;
  const approvedCount = applications ? applications.filter(a => a.status === 'APPROVED').length : 0;
  const rejectedCount = applications ? applications.filter(a => a.status === 'REJECTED').length : 0;


  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
            <p className="mt-2 text-gray-600">ติดตามสถานะและประวัติการสมัครรางวัลของคุณ</p>
        </div>
        
        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
            <div className="flex space-x-8">
                <button 
                  onClick={() => setActiveTab('PENDING')}
                  className={`pb-4 px-2 font-medium text-sm transition-colors relative ${activeTab === 'PENDING' ? 'text-green-600 border-b-2 border-green-500' : 'text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300'}`}
                >
                    Pending Review ({pendingCount})
                </button>
                <button 
                   onClick={() => setActiveTab('APPROVED')}
                   className={`pb-4 px-2 font-medium text-sm transition-colors relative ${activeTab === 'APPROVED' ? 'text-green-600 border-b-2 border-green-500' : 'text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300'}`}
                >
                    Approved ({approvedCount})
                </button>
                <button 
                   onClick={() => setActiveTab('REJECTED')}
                   className={`pb-4 px-2 font-medium text-sm transition-colors relative ${activeTab === 'REJECTED' ? 'text-green-600 border-b-2 border-green-500' : 'text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300'}`}
                >
                    Rejected ({rejectedCount})
                </button>
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Search & Sort */}
        <div className="flex flex-col sm:flex-row justify-end items-center gap-4 mb-8">
            <div className="relative w-full sm:w-64">
                <input 
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="ค้นหาชื่อรางวัล..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-sm"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                     <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
            </div>
            
            <div className="flex gap-2 w-full sm:w-auto">
                 <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
                    className="pl-4 pr-10 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm focus:ring-green-500 focus:border-green-500"
                 >
                     <option value="newest">ใหม่สุด</option>
                     <option value="oldest">เก่าสุด</option>
                 </select>
            </div>
        </div>

        {/* Content */}
        {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-md border border-red-200 mb-6">
              Error: {error}
            </div>
        )}

        {filteredApps.length > 0 ? (
            <div className="space-y-6">
                {filteredApps.map(app => (
                    <ApplicationStatusCard key={app.id} application={app} />
                ))}
            </div>
        ) : (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200 border-dashed">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No applications found in this tab</h3>
            </div>
        )}
      </div>
    </div>
  );
}

