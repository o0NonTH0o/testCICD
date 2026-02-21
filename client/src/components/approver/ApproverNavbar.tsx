'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCurrentUser } from '../../hooks/useCurrentUser';

export default function ApproverNavbar() {
  const { user, loading } = useCurrentUser();
  const pathname = usePathname();

  const getLinkClasses = (isActive: boolean) => {
    return isActive 
      ? "text-gray-900 font-medium hover:text-green-600 transition-colors border-b-2 border-green-500 pb-1"
      : "text-gray-500 font-medium hover:text-green-600 transition-colors";
  };

  const isHomeActive = pathname?.includes('/home');
  // Removed isAppsActive as the link is removed
  
  // Determine base path based on role
  const basePath = user?.role === 'HEAD_OF_DEPARTMENT' ? '/head_of_department' : 
                   user?.role === 'VICE_DEAN' ? '/vice_dean' : 
                   user?.role === 'DEAN' ? '/dean' : '/approver';

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
              <p className="text-xs text-gray-500">{user?.role ? user.role.replace(/_/g, ' ') : 'Approver'} Portal</p>
          </div>
        </div>
      </div>

      <div className="hidden md:flex items-center space-x-8">
          <Link href={`${basePath}/home`} className={getLinkClasses(isHomeActive)}>Home</Link>
          {/* Applications link removed as it requires specific award type context */}
      </div>

      <div className="flex items-center gap-6">
          {loading ? (
             <div className="text-sm text-gray-400">Loading...</div>
          ) : user ? (
            <>
              <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500 uppercase">{user.faculty?.facultyName || user.department?.name || user.role}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden relative border border-gray-100">
                  <img 
                    src={user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
                    alt="User" 
                    className="h-full w-full object-cover" 
                  />
              </div>
            </>
          ) : (
            <div className="text-sm text-gray-500">Guest</div>
          )}
          {user && (
            <button 
              className="text-gray-400 hover:text-red-500 ml-4" 
              onClick={() => {
                localStorage.removeItem('token');
                window.location.href = '/';
              }}
              title="Logout"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            </button>
          )}
      </div>
    </nav>
  );
}
