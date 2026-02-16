'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUsers } from '../../../hooks/useUsers';
import { User } from '../../../types';

export default function AdminUserApprovalPage() {
  const { users, loading, error, fetchUsers, approveUser } = useUsers();
  const [activeTab, setActiveTab] = useState<'PENDING_REVIEW' | 'APPROVED' | 'REJECTED'>('PENDING_REVIEW');
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  // Initial Fetch
  useEffect(() => {
    // Mapping tabs to API statuses if needed, or filtering client side
    // For now, let's assume fetchUsers accepts a status
    if (activeTab === 'PENDING_REVIEW') fetchUsers('PENDING_APPROVAL');
    else if (activeTab === 'APPROVED') fetchUsers('ACTIVE');
    else fetchUsers('REJECTED');
  }, [fetchUsers, activeTab]);

  const toggleUserSelection = (id: string) => {
    const newSelected = new Set(selectedUserIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedUserIds(newSelected);
  };

  const toggleAllSelection = () => {
    if (selectedUserIds.size === users.length && users.length > 0) {
      setSelectedUserIds(new Set());
    } else {
      setSelectedUserIds(new Set(users.map(u => u.id)));
    }
  };

  const handleApproveSelected = async () => {
    if (!confirm(`Approve ${selectedUserIds.size} users?`)) return;
    
    // Process purely sequentially for now as useUsers doesn't support batch
    for (const id of Array.from(selectedUserIds)) {
      await approveUser(id);
    }
    setSelectedUserIds(new Set());
    // Refetch or let the local state update handle it (approveUser updates local state)
  };

  const handleRejectSelected = async () => {
    // Placeholder for reject logic
    alert('Reject functionality to be implemented in API');
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.actualId && user.actualId.includes(searchTerm))
  );

  return (
    <div>
      {/* Main Content */}
      <main className="max-w-[1400px] mx-auto px-8 py-10">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">User Registration Approval</h1>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-8">
            <button 
                onClick={() => setActiveTab('PENDING_REVIEW')}
                className={`pb-4 px-2 text-sm font-bold mr-8 transition-colors relative ${activeTab === 'PENDING_REVIEW' ? 'text-green-500' : 'text-gray-500 hover:text-gray-700'}`}
            >
                Pending Review ({activeTab === 'PENDING_REVIEW' ? users.length : '0'})
                {activeTab === 'PENDING_REVIEW' && <div className="absolute bottom-0 left-0 w-full h-1 bg-green-500 rounded-t-full"></div>}
            </button>
            <button 
                onClick={() => setActiveTab('APPROVED')}
                 className={`pb-4 px-2 text-sm font-bold mr-8 transition-colors relative ${activeTab === 'APPROVED' ? 'text-green-500' : 'text-gray-500 hover:text-gray-700'}`}
            >
                Approved
                {activeTab === 'APPROVED' && <div className="absolute bottom-0 left-0 w-full h-1 bg-green-500 rounded-t-full"></div>}
            </button>
            <button 
                onClick={() => setActiveTab('REJECTED')}
                 className={`pb-4 px-2 text-sm font-bold mr-8 transition-colors relative ${activeTab === 'REJECTED' ? 'text-green-500' : 'text-gray-500 hover:text-gray-700'}`}
            >
                Rejected
                {activeTab === 'REJECTED' && <div className="absolute bottom-0 left-0 w-full h-1 bg-green-500 rounded-t-full"></div>}
            </button>
        </div>

        {/* Action Bar: Search & Filter */}
        <div className="flex justify-end mb-6 gap-4">
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
                <input 
                    type="text" 
                    className="pl-10 pr-4 py-2 border border-transparent bg-green-50/50 hover:bg-green-50 focus:bg-white focus:border-green-500 rounded-lg text-sm text-gray-800 placeholder-gray-400 w-80 transition-all outline-none" 
                    placeholder="Search by name, email, or ID..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
                Filter
            </button>
        </div>

        {/* Data List */}
        <div className="space-y-4 pb-32">
            {loading ? (
                <div className="text-center py-20 text-gray-400">Loading users...</div>
            ) : filteredUsers.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                    <p className="text-gray-400">No users found.</p>
                </div>
            ) : (
                <>
                {/* Header Row (Optional for card view but helpful) */}
                 <div className="bg-white rounded-t-xl border-b border-gray-100 px-6 py-4 flex items-center shadow-sm">
                    <div className="w-12 flex justify-center">
                        <input 
                            type="checkbox" 
                            className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                            checked={selectedUserIds.size === filteredUsers.length && filteredUsers.length > 0}
                            onChange={toggleAllSelection}
                        />
                    </div>
                    <div className="flex-1 grid grid-cols-12 gap-4 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                         <div className="col-span-4">User Details</div>
                         <div className="col-span-3">Role / Campus</div>
                         <div className="col-span-3">Faculty / Dept</div>
                         <div className="col-span-2">Date</div>
                    </div>
                 </div>

                 {/* User Cards */}
                 {filteredUsers.map(user => (
                     <div key={user.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center hover:shadow-md transition-shadow group">
                         {/* Checkbox */}
                         <div className="w-12 flex justify-center flex-shrink-0">
                            <input 
                                type="checkbox" 
                                className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                                checked={selectedUserIds.has(user.id)}
                                onChange={() => toggleUserSelection(user.id)}
                            />
                         </div>

                         {/* Content Grid */}
                         <div className="flex-1 grid grid-cols-12 gap-4 items-center">
                            
                            {/* User Info */}
                            <div className="col-span-4 flex items-center gap-4">
                                <div className="h-10 w-10 text-xs rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                                    {user.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 group-hover:text-green-600 transition-colors">{user.name}</h3>
                                    <p className="text-xs text-gray-500">{user.email}</p>
                                    {user.actualId && <p className="text-xs text-green-600 font-mono mt-1">{user.actualId}</p>}
                                </div>
                            </div>

                            {/* Role / Campus */}
                            <div className="col-span-3">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800`}>
                                    {user.role}
                                </span>
                                <p className="text-xs text-gray-500 mt-1">
                                    {user.faculty?.campus?.campusName || '-'}
                                </p>
                            </div>

                            {/* Faculty / Dept */}
                             <div className="col-span-3">
                                <p className="text-xs font-medium text-gray-900">{user.faculty?.facultyName || '-'}</p>
                                <p className="text-xs text-gray-500">{user.department?.name || '-'}</p>
                            </div>

                            {/* Date */}
                            <div className="col-span-2 text-right">
                                {/* Use optional chaining just in case */}
                                <p className="text-xs text-gray-400">
                                   {/* If createdAt is unavailable, simplified mock */}
                                   Today
                                </p>
                            </div>

                         </div>
                     </div>
                 ))}
                 </>
            )}
        </div>
      </main>

      {/* Floating Bottom Bar (Only if items selected) */}
      {selectedUserIds.size > 0 && (
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-white rounded-2xl shadow-xl border border-gray-100 py-3 px-6 flex items-center gap-6 z-50 animate-bounce-in">
             <div className="flex items-center gap-3 pr-4 border-r border-gray-200">
                <span className="flex items-center justify-center bg-green-100 text-green-700 font-bold w-6 h-6 rounded-full text-xs">
                    {selectedUserIds.size}
                </span>
                <span className="text-sm font-bold text-gray-800">User Selected</span>
             </div>

             <div className="flex items-center gap-3">
                 <button 
                    onClick={handleApproveSelected}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-bold shadow-green-200 shadow-lg transition-all transform hover:scale-105 active:scale-95"
                 >
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                     Approve Selection
                 </button>

                 <button 
                    onClick={handleRejectSelected}
                    className="flex items-center gap-2 px-4 py-2 bg-[#E11D48] hover:bg-red-700 text-white rounded-lg text-sm font-bold shadow-red-200 shadow-lg transition-all transform hover:scale-105 active:scale-95"
                 >
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                     Reject Selection
                 </button>
             </div>
             
             <button 
                onClick={() => setSelectedUserIds(new Set())}
                className="text-gray-400 hover:text-gray-600 text-sm font-medium ml-2"
             >
                 Cancel
             </button>
          </div>
      )}
    </div>
  );
}
