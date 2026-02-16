'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApplications } from '../../../hooks/useApplications';
import { useCurrentUser } from '../../../hooks/useCurrentUser';
import { useMasterData } from '../../../hooks/useMasterData';
import AwardCard from '../../../components/AwardCard';
import { getStatusColor, getStatusLabel } from '../../../lib/status-helper';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useCurrentUser();
  const { applications, loading: appLoading, error } = useApplications();
  const { awardTypes, activePeriod, loading: typesLoading } = useMasterData(); // added activePeriod

  // Countdown State
  const [timeLeft, setTimeLeft] = useState<{days: number, hours: number, minutes: number, seconds: number} | null>(null);

  useEffect(() => {
    if (!userLoading && user?.role === 'ADMIN') {
      router.push('/admin/home');
    }
  }, [user, userLoading, router]);

  // Countdown Logic
  const calculateTime = React.useCallback((endDate: string) => {
    const now = new Date().getTime();
    const end = new Date(endDate).getTime();
    const distance = end - now;
    
    if (distance < 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
    };
  }, []);

  // Timer Effect
  useEffect(() => {
    if (!activePeriod) return;

    // Initial update - wrapped in requestAnimationFrame to avoid synchronous state update warning
    const AnimationFrameId = requestAnimationFrame(() => {
        setTimeLeft(calculateTime(activePeriod.endDate));
    });

    const interval = setInterval(() => {
        setTimeLeft(calculateTime(activePeriod.endDate));
    }, 1000);

    return () => {
        cancelAnimationFrame(AnimationFrameId);
        clearInterval(interval);
    };
  }, [activePeriod, calculateTime]);



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
        <div className="col-span-12 md:col-span-8 bg-gradient-to-r from-[#74c69d] to-[#b7e4c7] rounded-[40px] p-10 text-white flex flex-col items-center justify-center shadow-lg relative overflow-hidden min-h-[300px]">
           {/* Abstract Circle Decoration */}
           <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
           
           {activePeriod ? (
             <>
               <h2 className="text-3xl font-medium mb-6 tracking-wide">
                  Application Time {activePeriod.academicYear}/{activePeriod.semester}
               </h2>
               
               <div className="text-4xl md:text-6xl font-bold tracking-widest font-mono mb-2 drop-shadow-sm text-center tabular-nums">
                 {timeLeft ? (
                    <span>
                      {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
                    </span>
                 ) : (
                    <span>Loading...</span>
                 )}
               </div>
               <p className="opacity-80 mt-2">
                  Ends on {new Date(activePeriod.endDate).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
               </p>
             </>
           ) : (
             <div className="flex flex-col items-center justify-center h-full z-10">
                <svg className="w-16 h-16 mb-4 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <h2 className="text-3xl font-medium mb-2 tracking-wide">ไม่อยู่ในช่วงรับสมัคร</h2>
                <p className="opacity-80">โปรดติดตามประกาศจากทางคณะ/มหาวิทยาลัย</p>
             </div>
           )}
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
        {awardTypes.map(award => {
            // Check if user has an active application for the current period
            // Active means NOT REJECTED. If rejected, they might be able to apply again depending on policy.
            // Assumption: 1 active app per term.
            const hasActiveApp = applications.some(app => 
                app.academicYear === activePeriod?.academicYear && 
                app.semester === activePeriod?.semester &&
                app.status !== 'REJECTED'
            );

            // Also check if activePeriod exists at all
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

            return (
                <AwardCard 
                    key={award.id} 
                    award={award} 
                    isDisabled={isDisabled}
                    disabledReason={disabledReason}
                />
            );
        })}
      </div>
    </main>
  );
}
