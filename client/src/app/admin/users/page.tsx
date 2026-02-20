'use client';

import React, { useEffect, useState } from 'react';
import { useUsers } from '../../../hooks/useUsers';
import { User } from '../../../types';
import EditUserModal from '../../../components/admin/EditUserModal';

export default function AdminUserApprovalPage() {
  const { users, loading, fetchUsers, approveUser, rejectUser, updateUser } = useUsers();
  const [activeTab, setActiveTab] = useState<'PENDING_REVIEW' | 'APPROVED' | 'REJECTED'>('PENDING_REVIEW');
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const handleEdit = (user: User) => {
    setEditingUser(user);
  };
  
  const handleSaveUser = async (id: string, data: Partial<User>) => {
    await updateUser(id, data);
    setEditingUser(null);
  };

  // Initial Fetch & Tab Logic
  useEffect(() => {
    if (activeTab === 'PENDING_REVIEW') fetchUsers('PENDING_APPROVAL');
    else if (activeTab === 'APPROVED') fetchUsers('ACTIVE');
    else fetchUsers('REJECTED');
  }, [fetchUsers, activeTab]);

  const handleTabChange = (tab: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED') => {
    setActiveTab(tab);
    setSelectedUserIds(new Set());
  };

  const toggleUserSelection = (id: string) => {
    const newSelected = new Set(selectedUserIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedUserIds(newSelected);
  };

  const clearSelection = () => {
    setSelectedUserIds(new Set());
  };

  const handleApproveSelected = async () => {
    if (!confirm(`Approve ${selectedUserIds.size} users?`)) return;
    
    // Process purely sequentially
    for (const id of Array.from(selectedUserIds)) {
      await approveUser(id);
    }
    setSelectedUserIds(new Set());
    // Refetch to refresh list
    if (activeTab === 'PENDING_REVIEW') fetchUsers('PENDING_APPROVAL');
    else if (activeTab === 'APPROVED') fetchUsers('ACTIVE');
    else fetchUsers('REJECTED');
  };

  const handleRejectSelected = async () => {
    if (!confirm(`Reject ${selectedUserIds.size} users?`)) return;
    
    for (const id of Array.from(selectedUserIds)) {
      if (rejectUser) await rejectUser(id);
    }
    setSelectedUserIds(new Set());
    // Refetch
    if (activeTab === 'PENDING_REVIEW') fetchUsers('PENDING_APPROVAL');
    else if (activeTab === 'APPROVED') fetchUsers('ACTIVE');
    else fetchUsers('REJECTED');
  };

  const filteredUsers = users.filter(user => 
    (user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (user.actualId || '').includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-10">User Registration Approval</h1>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-8">
            <button 
                onClick={() => handleTabChange('PENDING_REVIEW')}
                className={`pb-4 px-1 text-sm font-bold mr-8 transition-colors relative ${activeTab === 'PENDING_REVIEW' ? 'text-green-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
                Pending Review ({activeTab === 'PENDING_REVIEW' ? users.length : (activeTab === 'APPROVED' || activeTab === 'REJECTED' ? '?' : users.length)})
                {activeTab === 'PENDING_REVIEW' && <div className="absolute bottom-0 left-0 w-full h-1 bg-green-500 rounded-t-full"></div>}
            </button>
            <button 
                onClick={() => handleTabChange('APPROVED')}
                 className={`pb-4 px-1 text-sm font-bold mr-8 transition-colors relative ${activeTab === 'APPROVED' ? 'text-green-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
                Approved
                {activeTab === 'APPROVED' && <div className="absolute bottom-0 left-0 w-full h-1 bg-green-500 rounded-t-full"></div>}
            </button>
            <button 
                onClick={() => handleTabChange('REJECTED')}
                 className={`pb-4 px-1 text-sm font-bold mr-8 transition-colors relative ${activeTab === 'REJECTED' ? 'text-green-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
                Rejected
                {activeTab === 'REJECTED' && <div className="absolute bottom-0 left-0 w-full h-1 bg-green-500 rounded-t-full"></div>}
            </button>
        </div>

        {/* Filter Bar */}
        <div className="flex justify-between items-center mb-6">
            <div>
                 <h2 className="text-lg font-bold text-gray-900">All Registration</h2>
                 <p className="text-xs text-green-500 font-medium">{activeTab === 'PENDING_REVIEW' ? 'Pending Approve' : activeTab === 'APPROVED' ? 'Active Users' : 'Rejected Users'}</p>
            </div>
            
            <div className="flex items-center gap-4">
                {/* Search */}
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>
                    <input 
                        type="text" 
                        placeholder="Search by name, email, or ID..." 
                        className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-green-500 w-64"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Sort By (Mock) */}
                <div className="bg-[#E8F5E9] px-4 py-2 rounded-lg text-sm font-bold text-gray-700 flex items-center gap-2 cursor-pointer">
                    <span className="text-gray-500 font-normal">Short by :</span> Newest
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>

                {/* Filter Button (Mock) */}
                <button className="bg-[#E8F5E9] px-4 py-2 rounded-lg text-sm font-bold text-gray-700 flex items-center gap-2 hover:bg-green-100 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
                    Filter
                </button>
            </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-none shadow-none overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-100">
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Phone Number</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Campus</th>
                            <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider w-20">Select</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            <tr><td colSpan={6} className="px-6 py-20 text-center text-gray-500">Loading requests...</td></tr>
                        ) : filteredUsers.length === 0 ? (
                            <tr><td colSpan={6} className="px-6 py-20 text-center text-gray-500">No users found in this status.</td></tr>
                        ) : (
                            filteredUsers.map((user) => {
                                const isSelected = selectedUserIds.has(user.id);
                                return (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <div className="text-sm font-bold text-gray-800">{user.name || 'Unknown'}</div>
                                                <button 
                                                    onClick={() => handleEdit(user)}
                                                    className="text-gray-400 hover:text-green-600 transition-colors p-1 rounded hover:bg-green-50"
                                                    title="Edit User"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-gray-600">{user.actualId || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-gray-600">{user.tel || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-gray-600">{user.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {/* Campus logic: prioritize direct campus, then faculty campus */}
                                            <div className="text-sm font-bold text-gray-600">
                                                {user.campus?.campusName || user.faculty?.campus?.campusName || '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <button 
                                                onClick={() => toggleUserSelection(user.id)}
                                                className={`w-5 h-5 rounded border ${isSelected ? 'bg-green-100 border-green-500' : 'border-gray-200 hover:border-green-400'} flex items-center justify-center transition-colors mx-auto`}
                                            >
                                                {isSelected && <div className="w-3 h-3 bg-green-500 rounded-sm"></div>}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Mock */}
            {!loading && filteredUsers.length > 0 && (
                <div className="px-6 py-8 flex items-center justify-between border-t border-gray-50">
                    <span className="text-xs text-gray-400">Showing data 1 to {filteredUsers.length} entries</span>
                    <div className="flex items-center gap-1">
                        <button className="w-8 h-8 flex items-center justify-center rounded bg-gray-50 text-gray-400 text-xs hover:bg-gray-100">{'<'}</button>
                        <button className="w-8 h-8 flex items-center justify-center rounded bg-green-600 text-white text-xs font-bold">1</button>
                        <button className="w-8 h-8 flex items-center justify-center rounded bg-white text-gray-600 text-xs hover:bg-gray-50">2</button>
                        <button className="w-8 h-8 flex items-center justify-center rounded bg-white text-gray-600 text-xs hover:bg-gray-50">3</button>
                        <span className="w-8 h-8 flex items-center justify-center text-gray-400 text-xs">...</span>
                        <button className="w-8 h-8 flex items-center justify-center rounded bg-white text-gray-600 text-xs hover:bg-gray-50">40</button>
                        <button className="w-8 h-8 flex items-center justify-center rounded bg-gray-50 text-gray-400 text-xs hover:bg-gray-100">{'>'}</button>
                    </div>
                </div>
            )}
        </div>
      </main>

      {/* Floating Action Bar */}
      {selectedUserIds.size > 0 && (
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-white rounded-xl shadow-2xl border border-gray-100 px-6 py-3 flex items-center gap-6 animate-fade-in-up z-50">
              <div className="flex items-center gap-3 border-r border-gray-200 pr-6">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-sm">
                      {selectedUserIds.size}
                  </div>
                  <span className="font-bold text-gray-800 text-sm">User Selected</span>
              </div>
              
              <div className="flex items-center gap-3">
                    <button 
                        onClick={handleApproveSelected}
                        className="bg-[#E8F5E9] hover:bg-green-100 text-green-800 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                        Approve Selection
                    </button>
                    
                    <button 
                        onClick={handleRejectSelected}
                        className="bg-[#FFEBEE] hover:bg-red-100 text-red-800 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        Reject Selection
                    </button>

                    <button 
                        onClick={clearSelection}
                        className="text-gray-400 hover:text-gray-600 font-bold text-sm px-2"
                    >
                        Cancel
                    </button>
              </div>
          </div>
      )}

      {/* Edit User Modal */}
      <EditUserModal 
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        user={editingUser}
        onSave={handleSaveUser}
      />
    </div>
  );
}
