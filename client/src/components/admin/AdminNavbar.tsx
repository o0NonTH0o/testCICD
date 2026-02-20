'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCurrentUser } from '../../hooks/useCurrentUser';

export default function AdminNavbar() {
  const { user, loading } = useCurrentUser();
  const pathname = usePathname();

  const getLinkClasses = (path: string) => {
    // Exact match for '/' or check if path starts with the link
    const isActive = pathname === path || (path !== '/' && pathname.startsWith(path));
    return isActive 
      ? "text-gray-900 font-medium hover:text-green-600 transition-colors"
      : "text-gray-500 font-medium hover:text-green-600 transition-colors";
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-8 h-20 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2">
          {/* Logo Icon */}
          <div className="text-yellow-500">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 0L24.4903 13.8197H39.0211L27.2654 22.3607L31.7557 36.1803L20 27.6393L8.2443 36.1803L12.7346 22.3607L0.97887 13.8197H15.5097L20 0Z" fill="currentColor"/>
              </svg>
          </div>
          <div>
              <h1 className="text-xl font-bold text-gray-800 leading-none">KU Nisit Deeden</h1>
              <p className="text-xs text-gray-500">Kasetsart University Student Award System</p>
          </div>
        </Link>
      </div>

      <div className="hidden md:flex items-center space-x-8">
          <Link href="/admin/home" className={getLinkClasses("/admin/home")}>Home</Link>
          <Link href="/admin/users" className={getLinkClasses("/admin/users")}>Register Approval</Link>
          <Link href="/admin/awards" className={getLinkClasses("/admin/awards")}>Applications</Link>
      </div>

      <div className="flex items-center gap-6">
          {loading ? (
             <div className="text-sm text-gray-400">Loading...</div>
          ) : user ? (
            <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500 uppercase">{user.role}</p>
                </div>
                {/* Profile Image/Avatar */}
                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden relative border border-gray-100">
                    {user.image ? (
                        <img src={user.image} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                        </div>
                    )}
                </div>
                <button 
                  onClick={() => {
                    localStorage.removeItem('token');
                    window.location.href = '/';
                  }}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                </button>
            </div>
          ) : (
            <Link href="/" className="text-sm font-medium text-gray-600 hover:text-green-600">Login</Link>
          )}
      </div>
    </nav>
  );
}
