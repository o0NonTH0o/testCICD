'use client';

import React from 'react';
import AdminNavbar from '../../components/admin/AdminNavbar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-[#1a1a1a]">
      <AdminNavbar />
      {children}
    </div>
  );
}

