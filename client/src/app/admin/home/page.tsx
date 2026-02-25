'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AwardType } from '../../../types';
import AdminAwardCard from '../../../components/admin/AdminAwardCard';
import { api } from '../../../lib/api';
import ApplicationTimerBanner from '../../../components/ApplicationTimerBanner';
import { useMasterData } from '../../../hooks/useMasterData';

export default function AdminHomePage() {
  const [awardTypes, setAwardTypes] = useState<AwardType[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Use master data hook to get the real active period
  const { activePeriod } = useMasterData();

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const data = await api.get<AwardType[]>('/master/award-types');
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
      {/* Top Banner Section */}
      <div className="max-w-[1400px] mx-auto pt-10 px-6">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
            
            {/* Main Gradient Banner */}
            <div className="flex-grow w-full lg:w-3/4">
                <ApplicationTimerBanner 
                    activePeriod={activePeriod} 
                    overrideTitle="Application Time" 
                />
            </div>

            {/* Notifications Panel */}
            <div className="w-full lg:w-1/4 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-[300px]">
                <div className="flex items-center gap-2 mb-6">
                    <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                    <h3 className="font-bold text-gray-800">Notifications</h3>
                </div>

                <div className="flex-grow space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                    {/* Mock Notification 1 */}
                    <div className="flex gap-3 items-start">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-1">
                             <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-800">ใบสมัครอนุมัติเรียบร้อย</p>
                            <p className="text-[10px] text-gray-500 leading-tight mt-0.5">ใบสมัครได้รับการอนุมัติจากเจ้าหน้าที่คณะเรียบร้อย</p>
                            <p className="text-[9px] text-gray-400 mt-1">2 ชั่วโมงที่แล้ว</p>
                        </div>
                    </div>

                    {/* Mock Notification 2 */}
                    <div className="flex gap-3 items-start">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-1">
                             <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-800">ส่งใบสมัครเรียบร้อย</p>
                            <p className="text-[10px] text-gray-500 leading-tight mt-0.5">ส่งใบสมัครรางวัลนิสิตดีเด่นด้านกิจกรรมเสริมหลักสูตรเรียบร้อย</p>
                            <p className="text-[9px] text-gray-400 mt-1">เมื่อวานนี้</p>
                        </div>
                    </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-100">
                    <Link href="/admin/notifications" className="text-xs font-bold text-green-700 hover:text-green-800">
                        View All Notifications
                    </Link>
                </div>
            </div>
        </div>

        {/* Divider / Tab */}
        <div className="mt-12 mb-10 flex flex-col items-center">
             <div className="px-8 py-2 bg-white rounded-full shadow-sm text-gray-500 font-medium text-sm border border-gray-100 z-10">
                Awards
             </div>
             <div className="h-[1px] w-full bg-gray-200 -mt-5"></div>
        </div>

        {/* Action Button (Hidden in reference but needed for functionality) */}
        <div className="flex justify-end mb-4">
             <Link href="/admin/awards/create" className="text-sm text-gray-400 hover:text-green-600 flex items-center gap-1 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                Create New Award Type
             </Link>
        </div>

        {loading ? (
             <div className="text-center py-20 text-gray-500">Loading award types...</div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {awardTypes.map((type, index) => {
                const stats = type.stats || { totalApplications: 0, submitted: 0, pending: 0 };
                // Assign gradients based on index for visual variety matching the reference pattern
                const gradientType = index % 3 === 0 ? 'purple' : index % 3 === 1 ? 'blue' : 'yellow';
                
                return (
                    <AdminAwardCard
                        key={type.id}
                        id={type.id}
                        title={type.awardName}
                        iconUrl={type.iconUrl}
                        totalApplications={stats.totalApplications}
                        submittedCount={stats.submitted}
                        pendingCount={stats.pending}
                        gradientType={gradientType}
                    />
                );
            })}
            
            {awardTypes.length === 0 && (
                <div className="col-span-full py-20 text-center">
                    <p className="text-gray-400 mb-4">No award categories defined yet.</p>
                </div>
            )}
            </div>
        )}
      </div>
    </div>
  );
}
