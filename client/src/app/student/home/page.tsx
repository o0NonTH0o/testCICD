'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApplications } from '../../../hooks/useApplications';
import { useCurrentUser } from '../../../hooks/useCurrentUser';
import { useMasterData } from '../../../hooks/useMasterData';
import ApplicationTimerBanner from '../../../components/ApplicationTimerBanner';
import AwardCard from '../../../components/AwardCard';
import { getStatusColor, getStatusLabel } from '../../../lib/status-helper';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useCurrentUser();
  const { applications } = useApplications();
  const { awardTypes, activePeriod, loading: typesLoading } = useMasterData();

  useEffect(() => {
    if (!userLoading && user) {
      if (user.role === 'ADMIN') {
        router.push('/admin/home');
      } else if (user.role === 'HEAD_OF_DEPARTMENT') {
        router.push('/head_of_department/home');
      } else if (user.role === 'VICE_DEAN') {
        router.push('/vice_dean/home');
      } else if (user.role === 'DEAN') {
        router.push('/dean/home');
      }
    }
  }, [user, userLoading, router]);

  // Loading States
  if (userLoading || typesLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
           <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
           <p className="text-gray-400 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-[1400px] mx-auto px-8 py-10 font-sans text-[#1a1a1a]">
      <div className="grid grid-cols-12 gap-8 mb-12">
        {/* Banner with Countdown */}
        <div className="col-span-12 md:col-span-8">
           <ApplicationTimerBanner activePeriod={activePeriod} className="h-full" />
        </div>

        {/* Notifications Panel */}
        <div className="col-span-12 md:col-span-4 bg-white rounded-[40px] p-6 shadow-md border border-gray-100 flex flex-col h-[300px]">
            <div className="flex items-center gap-2 mb-6 px-2">
                <svg className="w-5 h-5 text-green-700" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/></svg>
                <h3 className="font-bold text-lg text-gray-800">Notifications</h3>
            </div>
            
            <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                {applications.length > 0 ? (
                    applications.map(app => (
                        <div key={app.id} className="flex gap-4 p-3 hover:bg-gray-50 rounded-2xl transition-colors cursor-pointer" onClick={() => router.push(`/student/applications/${app.id}`)}>
                            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getStatusColor(app.status)}`}>
                                {app.status === 'APPROVED' ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                ) : app.status === 'REJECTED' ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-800">{app.awardType?.awardName || 'Application'}</p>
                                <p className="text-xs text-gray-500 mt-1 leading-relaxed">Status: {getStatusLabel(app.status)}</p>
                                <p className="text-[10px] text-gray-400 mt-2 font-medium">
                                  {new Date(app.createdAt).toLocaleDateString('th-TH')}
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm">
                        <p>No active applications</p>
                    </div>
                )}
            </div>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-8">
         <div className="h-px bg-gray-300 flex-1"></div>
         <h2 className="text-xl text-gray-500 font-medium uppercase tracking-widest">Awards</h2>
         <div className="h-px bg-gray-300 flex-1"></div>
      </div>

      {/* Awards Grid - Dynamic from Master Data */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
        {awardTypes.map((award, index) => {
            const hasActiveApp = applications.some(app => 
                app.academicYear === activePeriod?.academicYear && 
                app.semester === activePeriod?.semester &&
                app.status !== 'REJECTED'
            );

            const isPeriodActive = !!activePeriod;

            let isDisabled = false;
            let disabledReason = '';

            if (!isPeriodActive) {
                isDisabled = true;
                disabledReason = 'ไม่อยู่ในช่วงรับสมัคร';
            } else if (hasActiveApp) {
                isDisabled = true;
                disabledReason = 'สมัครไปแล้ว';
            }

            const gradientType = index % 3 === 0 ? 'purple' : index % 3 === 1 ? 'blue' : 'yellow';

            return (
                <AwardCard 
                    key={award.id} 
                    award={award} 
                    isDisabled={isDisabled}
                    disabledReason={disabledReason}
                    gradientType={gradientType as 'purple' | 'blue' | 'yellow'}
                />
            );
        })}
      </div>
    </main>
  );
}
