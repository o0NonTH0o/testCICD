'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Pencil } from 'lucide-react';
import { useCurrentUser } from '../../../../../../hooks/useCurrentUser'; 
import { api } from '../../../../../../lib/api';
import { AwardApplication, AwardType, WorkItemAttachment } from '../../../../../../types'; 
import { getStatusColor, getStatusLabel } from '../../../../../../lib/status-helper'; 

// Note: The file path is .../awards/[id]/applications/[id]/page.tsx
// params.id will likely refer to the last dynamic segment (applicationId).
// If we need the awardId, we might have issues if both are named [id].
// However, for fetching the application, we just need the application ID.

export default function AdminApplicationDetailPage() {
  const router = useRouter();
  const params = useParams();
  
  // Cleanly extract parameters from the URL
  const applicationId = params.applicationId as string;
  
  // Use applicationId for data fetching
  const id = applicationId; 

  
  const { user, loading: userLoading } = useCurrentUser();
  const [application, setApplication] = useState<AwardApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Action state
  const [comment, setComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [showRejectBox, setShowRejectBox] = useState(false);

  // Edit state
  type EditWorkItem = {
    title: string;
    competitionName: string;
    organizer: string;
    level: string;
    rank: string;
    isTeam: boolean;
    teamName: string;
    attachments: { fileUrl: string }[];
  };
  const [editMode, setEditMode] = useState(false);
  const [editGpax, setEditGpax] = useState('');
  const [editTypeId, setEditTypeId] = useState('');
  const [editWorkItems, setEditWorkItems] = useState<EditWorkItem[]>([]);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [allAwardTypes, setAllAwardTypes] = useState<AwardType[]>([]);

  useEffect(() => {
    if (!userLoading) {
      if (!user) {
        router.push('/');
      } else if (user.role === 'STUDENT') {
        router.push('/student/home');
      }
    }
  }, [user, userLoading, router]);

  const fetchApplication = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await api.get<AwardApplication>(`/applications/${id}`);
      setApplication(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load application');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id && user && user.role !== 'STUDENT') {
      fetchApplication();
    }
  }, [id, user, fetchApplication]);

  useEffect(() => {
    api.get<AwardType[]>('/master/award-types').then(setAllAwardTypes).catch(() => {});
  }, []);

  const handleAction = async (action: 'APPROVED' | 'REJECTED') => {
    if (action === 'REJECTED' && !comment.trim()) {
      setActionError('Please provide a reason for rejection.');
      return;
    }
    setActionLoading(true);
    setActionError(null);
    try {
      await api.patch(`/applications/${id}/status`, { action, comment });
      await fetchApplication();
      setComment('');
      setShowRejectBox(false);
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setActionLoading(false);
    }
  };

  const enterEditMode = () => {
    if (!application) return;
    setEditGpax(application.gpax?.toString() ?? '');
    setEditTypeId(application.typeId ?? '');
    setEditWorkItems(
      (application.workItems ?? []).map((w) => ({
        title: w.title ?? '',
        competitionName: w.competitionName ?? '',
        organizer: w.organizer ?? '',
        level: w.level ?? '',
        rank: w.rank ?? '',
        isTeam: w.isTeam ?? false,
        teamName: w.teamName ?? '',
        attachments: (w.attachments ?? []).map((a) => ({
          fileUrl: a.fileUrl ?? '',
        })),
      }))
    );
    setSaveError(null);
    setEditMode(true);
  };

  const cancelEdit = () => setEditMode(false);

  const handleSave = async () => {
    if (editGpax !== '') {
      const gpaxNum = parseFloat(editGpax);
      if (isNaN(gpaxNum) || gpaxNum < 0 || gpaxNum > 4) {
        setSaveError('GPAX ต้องอยู่ระหว่าง 0.00 - 4.00');
        return;
      }
    }
    setSaveLoading(true);
    setSaveError(null);
    try {
      await api.put(`/applications/${id}`, {
        gpax: editGpax ? parseFloat(editGpax) : null,
        typeId: editTypeId || undefined,
        workItems: editWorkItems,
      });
      await fetchApplication();
      setEditMode(false);
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaveLoading(false);
    }
  };

  const updateWorkItem = (index: number, field: string, value: string | boolean) => {
    setEditWorkItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const addWorkItem = () => {
    setEditWorkItems((prev) => [
      ...prev,
      { title: '', competitionName: '', organizer: '', level: '', rank: '', isTeam: false, teamName: '', attachments: [] },
    ]);
  };

  const removeWorkItem = (index: number) => {
    setEditWorkItems((prev) => prev.filter((_, i) => i !== index));
  };

  if (loading || userLoading) {
     return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error || !application) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
                <p className="text-gray-600 mb-4">{error || 'Application not found'}</p>
                <button onClick={() => router.back()} className="text-green-600 hover:underline">Go Back</button>
            </div>
        </div>
    );
  }
  
  const getFileIcon = (fileUrl: string) => {
      // Simple extension check
      if (fileUrl.match(/\.pdf($|\?)/i)) return (
          <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" /></svg>
      );
      if (fileUrl.match(/\.(jpg|jpeg|png|gif)($|\?)/i)) return (
          <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg>
      );
      return (
          <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" /></svg>
      );
  }
  
  const isImage = (fileUrl: string) => fileUrl.match(/\.(jpg|jpeg|png|gif)($|\?)/i);

  const isPending =
    application?.status === 'ACCEPTED_BY_DEAN' || application?.status === 'PENDING_ADMIN';

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <div className="flex items-center gap-4 min-w-0">
                    <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors" title="Back">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    </button>
                    <div>
                         <h1 className="text-lg font-bold text-gray-900 truncate">
                            Admin View: {application.awardType?.awardName || 'Application Details'} 
                        </h1>
                        <p className="text-xs text-gray-500">
                            Viewing as {user?.role}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    {user?.role === 'ADMIN' && editMode && (
                      <button
                        onClick={handleSave}
                        disabled={saveLoading}
                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white transition-colors whitespace-nowrap"
                      >
                        {saveLoading ? <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white" /> : null}
                        {saveLoading ? 'Saving...' : 'Save Changes'}
                      </button>
                    )}
                    {user?.role === 'ADMIN' && editMode && (
                      <button
                        onClick={cancelEdit}
                        disabled={saveLoading}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors whitespace-nowrap"
                      >
                        Cancel Edit
                      </button>
                    )}
                    {user?.role === 'ADMIN' && !editMode && (
                      <button
                        onClick={enterEditMode}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors whitespace-nowrap"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                      </button>
                    )}
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border whitespace-nowrap ${getStatusColor(application.status)}`}>
                        {getStatusLabel(application.status)}
                    </span>
                </div>
            </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            
            {/* Student Profile Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row gap-6 items-start">
               <div className="w-24 h-24 rounded-xl bg-gray-200 flex-shrink-0 overflow-hidden">
                   {application.user?.image ? (
                       // eslint-disable-next-line @next/next/no-img-element
                       <img src={application.user.image} alt="Profile" className="w-full h-full object-cover" />
                   ) : (
                       <div className="w-full h-full flex items-center justify-center text-gray-400">
                           <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                       </div>
                   )}
               </div>
               
               <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                       <h2 className="text-xl font-bold text-gray-900">{application.user?.name}</h2>
                       <p className="text-gray-500 text-sm">{application.user?.email}</p>
                       <div className="mt-4 space-y-2">
                           <div className="flex items-center text-sm">
                               <span className="w-24 text-gray-500">Student ID:</span>
                               <span className="font-medium text-gray-900">{application.user?.actualId || '-'}</span>
                           </div>
                           <div className="flex items-center text-sm">
                               <span className="w-24 text-gray-500">Faculty:</span>
                               <span className="font-medium text-gray-900">{application.user?.faculty?.facultyName || '-'}</span>
                           </div>
                           <div className="flex items-center text-sm">
                               <span className="w-24 text-gray-500">Department:</span>
                               <span className="font-medium text-gray-900">{application.user?.department?.name || '-'}</span>
                           </div>
                           <div className="flex items-center text-sm">
                               <span className="w-24 text-gray-500">Phone:</span>
                               <span className="font-medium text-gray-900">{application.user?.tel || '-'}</span>
                           </div>
                       </div>
                   </div>
                   
                   <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                       <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Academic Info</h3>
                       <div className="space-y-2">
                           <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600">Award Type</span>
                                {editMode ? (
                                  <select
                                    value={editTypeId}
                                    onChange={(e) => setEditTypeId(e.target.value)}
                                    className="w-44 border border-amber-300 rounded-lg px-2 py-0.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                                  >
                                    {allAwardTypes.map((t) => (
                                      <option key={t.id} value={t.id}>{t.awardName}</option>
                                    ))}
                                  </select>
                                ) : (
                                  <span className="font-medium text-gray-900 text-right">{application.awardType?.awardName || '-'}</span>
                                )}
                           </div>
                           <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600">GPAX</span>
                                {editMode ? (
                                  <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="4"
                                    value={editGpax}
                                    onChange={(e) => setEditGpax(e.target.value)}
                                    placeholder="0.00"
                                    className="w-24 border border-amber-300 rounded-lg px-2 py-0.5 text-sm text-right font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
                                  />
                                ) : (
                                  <span className="font-bold text-gray-900 text-lg">
                                    {application.gpax ? parseFloat(application.gpax).toFixed(2) : '-'}
                                  </span>
                                )}
                           </div>
                           <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Academic Year</span>
                                <span className="font-medium text-gray-900">{application.academicYear || '-'}/{application.semester || '-'}</span>
                           </div>
                           <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Advisor</span>
                                <span className="font-medium text-gray-900">{application.advisor || '-'}</span>
                            </div>
                       </div>
                       
                        {application.transcriptFile && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <a href={application.transcriptFile} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700 font-medium">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                                    Verify Transcript
                                </a>
                            </div>
                        )}
                   </div>
               </div>
            </div>

            {/* Work Items / Achievements */}
            <div>
               <div className="flex items-center justify-between mb-4">
                 <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                   <span className={`w-1 h-6 ${editMode ? 'bg-amber-400' : 'bg-green-500'} rounded-full`}></span>
                   Submitted Works
                 </h3>
                 {editMode && (
                   <button
                     onClick={addWorkItem}
                     className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1 border border-amber-200 bg-amber-50 px-3 py-1.5 rounded-lg"
                   >
                     + Add Work Item
                   </button>
                 )}
               </div>
               
               <div className="space-y-6">
                 {editMode ? (
                   // ─── Edit mode: inline editable work items ───
                   editWorkItems.map((item, idx) => (
                     <div key={idx} className="bg-white rounded-2xl border border-amber-200 shadow-sm overflow-hidden">
                       <div className="flex items-center justify-between px-6 py-3 bg-amber-50 border-b border-amber-100">
                         <span className="text-sm font-semibold text-amber-700">Work Item #{idx + 1}</span>
                         <button
                           onClick={() => removeWorkItem(idx)}
                           className="text-xs text-red-500 hover:text-red-700 font-medium"
                         >
                           Remove
                         </button>
                       </div>
                       <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                         {([
                           { field: 'title', label: 'Title *', placeholder: 'Title' },
                           { field: 'competitionName', label: 'Competition', placeholder: 'Competition name' },
                           { field: 'organizer', label: 'Organizer', placeholder: 'Organizer' },
                           { field: 'level', label: 'Level', placeholder: 'e.g. National' },
                           { field: 'rank', label: 'Rank / Award', placeholder: 'e.g. 1st place' },
                         ] as { field: string; label: string; placeholder: string }[]).map(({ field, label, placeholder }) => (
                           <div key={field}>
                             <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
                             <input
                               type="text"
                               value={item[field as keyof typeof item] as string}
                               onChange={(e) => updateWorkItem(idx, field, e.target.value)}
                               placeholder={placeholder}
                               className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                             />
                           </div>
                         ))}
                         <div className="flex items-center gap-3 md:col-span-2">
                           <label className="text-xs font-medium text-gray-500">Team Entry</label>
                           <input
                             type="checkbox"
                             checked={item.isTeam}
                             onChange={(e) => updateWorkItem(idx, 'isTeam', e.target.checked)}
                             className="h-4 w-4 text-amber-500 rounded"
                           />
                           {item.isTeam && (
                             <input
                               type="text"
                               value={item.teamName}
                               onChange={(e) => updateWorkItem(idx, 'teamName', e.target.value)}
                               placeholder="Team name"
                               className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                             />
                           )}
                         </div>
                       </div>
                       {item.attachments.length > 0 && (
                         <div className="px-6 pb-4 pt-2 bg-gray-50 border-t border-gray-100">
                           <p className="text-xs text-gray-400 mb-2">Existing attachments ({item.attachments.length} files) — will be kept</p>
                           <div className="flex gap-2 flex-wrap">
                             {item.attachments.map((a, ai) => (
                               <a key={ai} href={a.fileUrl} target="_blank" rel="noopener noreferrer"
                                 className="text-xs text-green-600 underline hover:text-green-800">
                                 File {ai + 1}
                               </a>
                             ))}
                           </div>
                         </div>
                       )}
                     </div>
                   ))
                 ) : (
                   // ─── View mode: read-only work items ───
                   application.workItems?.map((work, index) => (
                     <div key={work.id || index} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                         <div className="p-6 border-b border-gray-100">
                             <div className="flex justify-between items-start mb-2">
                                 <h4 className="text-lg font-bold text-gray-800">{work.title}</h4>
                                 {work.isTeam && (
                                     <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                         Team: {work.teamName}
                                     </span>
                                 )}
                             </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                                 <div className="flex gap-2">
                                     <span className="text-gray-400">Competition:</span>
                                     <span className="font-medium text-gray-900">{work.competitionName || '-'}</span>
                                 </div>
                                 <div className="flex gap-2">
                                     <span className="text-gray-400">Organizer:</span>
                                     <span className="font-medium text-gray-900">{work.organizer || '-'}</span>
                                 </div>
                                 <div className="flex gap-2">
                                     <span className="text-gray-400">Level:</span>
                                     <span className="font-medium text-gray-900">{work.level || '-'}</span>
                                 </div>
                                 <div className="flex gap-2">
                                     <span className="text-gray-400">Rank/Award:</span>
                                     <span className="font-medium text-gray-900">{work.rank || '-'}</span>
                                 </div>
                             </div>
                         </div>
                         
                         {/* Attachments Area */}
                         <div className="bg-gray-50 p-6">
                              <h5 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Evidence Files</h5>
                              {work.attachments && work.attachments.length > 0 ? (
                                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                     {work.attachments.map((file: WorkItemAttachment, fIndex: number) => (
                                         <a 
                                            key={fIndex} 
                                            href={file.fileUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="group block relative aspect-square bg-white rounded-xl border border-gray-200 hover:border-green-400 hover:shadow-md transition-all p-2 flex flex-col items-center justify-center text-center overflow-hidden"
                                         >
                                             {isImage(file.fileUrl || '') ? (
                                                 <div className="absolute inset-0">
                                                     {/* eslint-disable-next-line @next/next/no-img-element */}
                                                     <img src={file.fileUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Evidence" />
                                                     <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                                 </div>
                                             ) : (
                                                 <div className="mb-2 transform group-hover:-translate-y-1 transition-transform">
                                                     {getFileIcon(file.fileUrl || '')}
                                                 </div>
                                             )}
                                             <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent text-white text-xs truncate opacity-0 group-hover:opacity-100 transition-opacity">
                                                 File
                                             </div>
                                         </a>
                                     ))}
                                 </div>
                              ) : (
                                 <p className="text-sm text-gray-400 italic">No files attached.</p>
                              )}
                         </div>
                     </div>
                   ))
                 )}
               </div>
            </div>
            
            {/* ประวัติการอนุมัติ */}
            {application.approvalLogs && application.approvalLogs.length > 0 && (
                <div className="pt-8 border-t border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">ประวัติการอนุมัติ</h3>
                    <div className="bg-white rounded-xl p-6 border border-gray-200">
                        <div className="space-y-6 relative pl-4 border-l-2 border-gray-100 ml-4">
                            {application.approvalLogs.map((log) => (
                                <div key={log.id} className="relative">
                                    <div className={`absolute -left-[21px] top-1 w-4 h-4 rounded-full border-2 border-white ${
                                        log.action === 'APPROVED' ? 'bg-green-500' : 
                                        log.action === 'REJECTED' ? 'bg-red-500' : 'bg-blue-400'
                                    }`}></div>
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                                        <div>
                                            <p className="font-semibold text-gray-900">
                                                {log.action} 
                                                <span className="text-gray-400 font-normal mx-1">โดย</span> 
                                                <span className="text-gray-700">{log.actor?.name || log.actor?.email}</span>
                                            </p>
                                            <p className="text-sm text-gray-500 mt-1">{log.comment || 'ไม่มีความคิดเห็น'}</p>
                                        </div>
                                        <span className="text-xs text-gray-400 whitespace-nowrap mt-1 sm:mt-0">
                                            {new Date(log.createdAt).toLocaleString('th-TH')}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Save error — shown below content when save fails */}
            {editMode && saveError && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">{saveError}</p>
            )}

            {/* Action Panel — only shown when status is ACCEPTED_BY_DEAN / PENDING_ADMIN */}
            {isPending && (
                <div className="pt-8 border-t border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                        Admin Decision
                    </h3>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Comment / Reason
                                {showRejectBox && <span className="text-red-500 ml-1">*</span>}
                            </label>
                            <textarea
                                rows={3}
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Add a comment or reason (required for rejection)"
                                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent resize-none"
                            />
                        </div>

                        {actionError && (
                            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{actionError}</p>
                        )}

                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={() => handleAction('APPROVED')}
                                disabled={actionLoading}
                                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-semibold rounded-xl transition-colors"
                            >
                                {actionLoading ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                                Approve → Send to Committee
                            </button>

                            <button
                                onClick={() => {
                                    if (!showRejectBox) {
                                        setShowRejectBox(true);
                                    } else {
                                        handleAction('REJECTED');
                                    }
                                }}
                                disabled={actionLoading}
                                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-semibold rounded-xl transition-colors"
                            >
                                {actionLoading ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                )}
                                {showRejectBox ? 'Confirm Rejection' : 'Reject'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    </div>
  );
}
