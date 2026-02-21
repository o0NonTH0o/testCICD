'use client';

import React from 'react';
import ApproverNavbar from '../../components/approver/ApproverNavbar';

export default function ViceDeanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 text-[#1a1a1a]">
      <ApproverNavbar /> 
      {children}
    </div>
  );
}
