'use client';

import React from 'react';
import Navbar from '../../components/Navbar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-[#1a1a1a]">
      <Navbar />
      {children}
    </div>
  );
}
