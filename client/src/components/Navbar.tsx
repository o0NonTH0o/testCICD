'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCurrentUser } from '../hooks/useCurrentUser';

export default function Navbar() {
  const { user, loading } = useCurrentUser();
  const pathname = usePathname();

  const getLinkClasses = (isActive: boolean) => {
    return isActive 
      ? "text-gray-900 font-medium hover:text-green-600 transition-colors border-b-2 border-green-500 pb-1"
      : "text-gray-500 font-medium hover:text-green-600 transition-colors";
  };

  const isHomeActive = pathname === '/' || pathname?.startsWith('/student/home') || pathname?.startsWith('/admin/home');
  const isAppsActive = pathname?.startsWith('/student/applications');

  return (
    <nav className="bg-white border-b border-gray-200 px-8 h-20 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
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
        </div>
      </div>

      <div className="hidden md:flex items-center space-x-8">
          <Link href="/student/home" className={getLinkClasses(isHomeActive)}>Home</Link>
          <Link href="/student/applications" className={getLinkClasses(isAppsActive)}>My Application</Link>
      </div>

      <div className="flex items-center gap-6">
          {loading ? (
             <div className="text-sm text-gray-400">Loading...</div>
          ) : user ? (
            <>
              <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.actualId || user.email}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden relative border border-gray-100">
                  <img 
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
                    alt="User" 
                    className="h-full w-full object-cover" 
                  />
              </div>
            </>
          ) : (
            <div className="text-sm text-gray-500">Guest</div>
          )}
          <button className="text-gray-400 hover:text-red-500" onClick={() => {
            // Simple logout: clear token and redirect
            localStorage.removeItem('token');
            window.location.href = '/';
          }}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          </button>
      </div>
    </nav>
  );
}
