'use client';

import React from 'react';
import CommitteeNavBar from '../../components/committee/CommitteeNavBar';

export default function CommitteeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 text-[#1a1a1a]">
      <CommitteeNavBar />
      {children}
    </div>
  );
}
