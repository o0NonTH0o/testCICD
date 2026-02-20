'use client';

import React, { useEffect, useState } from 'react';
import { AwardType } from '../../../types';
import AdminAwardCard from '../../../components/admin/AdminAwardCard'; 
import { api } from '../../../lib/api';
import ApplicationTimerBanner from '../../../components/ApplicationTimerBanner';
import { useMasterData } from '../../../hooks/useMasterData';
import { useCurrentUser } from '../../../hooks/useCurrentUser';

export default function HeadOfDeptHomePage() {
  const { user } = useCurrentUser();
  const [awardTypes, setAwardTypes] = useState<AwardType[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { activePeriod } = useMasterData();

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const data = await api.get<AwardType[]>('/master/award-types');
        // Warning: This stats is global, but for UI similarity we show it. 
        // Ideally backend should provide scoped stats.
        const processed = data?.map(t => ({
            ...t,
            stats: t.stats || { totalApplications: 0, submitted: 0, pending: 0 }
        })) || [];
        setAwardTypes(processed);
      } catch (error) {
        console.error("Failed to fetch award types", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTypes();
  }, []);

  return (
    <div className="min-h-screen bg-white pb-20 font-sans">
      <div className="max-w-[1400px] mx-auto pt-10 px-6">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
            
            <div className="flex-grow w-full lg:w-3/4">
                <ApplicationTimerBanner 
                    activePeriod={activePeriod} 
                    overrideTitle={`Department: ${user?.department?.name || 'Loading...'}`}
                />
            </div>

            <div className="w-full lg:w-1/4 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-[300px]">
                <div className="flex items-center gap-2 mb-6">
                    <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                    <h3 className="font-bold text-gray-800">Notifications</h3>
                </div>

                <div className="flex-grow space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                     <div className="flex flex-col items-center justify-center h-full text-gray-400 text-xs">
                        <p>No new notifications</p>
                    </div>
                </div>
            </div>
        </div>

        <div className="mt-12 mb-10 flex flex-col items-center">
             <div className="px-8 py-2 bg-white rounded-full shadow-sm text-gray-500 font-medium text-sm border border-gray-100 z-10">
                Award Status Overview
             </div>
             <div className="h-[1px] w-full bg-gray-200 -mt-5"></div>
        </div>

        {loading ? (
             <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
             </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {awardTypes.map((award, index) => (
                    <AdminAwardCard 
                        key={award.id}
                        id={award.id}
                        title={award.awardName}
                        iconUrl={award.iconUrl}
                        totalApplications={award.stats?.totalApplications || 0}
                        submittedCount={award.stats?.submitted || 0}
                        pendingCount={award.stats?.pending || 0}
                        gradientType={index % 3 === 0 ? 'purple' : index % 3 === 1 ? 'blue' : 'yellow'}
                        href="/head_of_department/applications"
                    />
                ))}
            </div>
        )}
      </div>
    </div>
  );
}
