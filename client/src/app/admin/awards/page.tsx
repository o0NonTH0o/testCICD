 'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AwardType } from '../../../types';
import AdminAwardCard from '../../../components/admin/AdminAwardCard';
import { api } from '../../../lib/api';

export default function AdminAwardsPage() {
  const [awardTypes, setAwardTypes] = useState<AwardType[]>([]);
  const [loading, setLoading] = useState(true);

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
      <div className="max-w-[1400px] mx-auto pt-10 px-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Applications</h1>
            <p className="text-sm text-gray-400 mt-1">เลือกประเภทรางวัลเพื่อดูรายการใบสมัคร</p>
          </div>
          <Link
            href="/admin/awards/create"
            className="text-sm text-gray-400 hover:text-green-600 flex items-center gap-1 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Create New Award Type
          </Link>
        </div>

        {/* Divider */}
        <div className="mb-10 flex flex-col items-center">
          <div className="px-8 py-2 bg-white rounded-full shadow-sm text-gray-500 font-medium text-sm border border-gray-100 z-10">
            Awards
          </div>
          <div className="h-[1px] w-full bg-gray-200 -mt-5"></div>
        </div>

        {/* Award Type Grid */}
        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading award types...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {awardTypes.map((type, index) => {
              const stats = type.stats || { totalApplications: 0, submitted: 0, pending: 0 };
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
                  href={`/admin/awards/${type.id}/applications`}
                />
              );
            })}

            {awardTypes.length === 0 && (
              <div className="col-span-full py-20 text-center">
                <p className="text-gray-400">No award categories defined yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}