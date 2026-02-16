'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useCurrentUser } from '../../../../hooks/useCurrentUser';
import { api } from '../../../../lib/api';
import { AwardApplication, WorkItem, WorkItemAttachment } from '../../../../types';
import { getStatusColor, getStatusLabel } from '../../../../lib/status-helper';

export default function ApplicationDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const { user, loading: userLoading } = useCurrentUser();
  const [application, setApplication] = useState<AwardApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/');
      return;
    }

    const fetchApplication = async () => {
      try {
        setLoading(true);
        // Direct API call since useApplications hook doesn't support getById yet
        const data = await api.get<AwardApplication>(`/applications/${id}`);
        setApplication(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
            setError(err.message || 'Failed to load application');
        } else {
            setError('An error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id && user) {
      fetchApplication();
    }
  }, [id, user, userLoading, router]);

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


  return (
    <div className="min-h-screen bg-gray-50 pb-12">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    </button>
                    <h1 className="text-lg font-bold text-gray-900 truncate">
                        {application.awardType?.awardName || 'Application Details'} 
                    </h1>
                </div>
                <div>
                     <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(application.status)}`}>
                        {getStatusLabel(application.status)}
                     </span>
                </div>
            </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            
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
                       </div>
                   </div>
                   
                   <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                       <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Academic Info</h3>
                       <div className="space-y-2">
                           <div className="flex justify-between text-sm">
                                <span className="text-gray-600">GPAX</span>
                                <span className="font-bold text-gray-900 text-lg">
                                  {application.gpax ? parseFloat(application.gpax).toFixed(2) : '-'}
                                </span>
                           </div>
                           <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Academic Year</span>
                                <span className="font-medium text-gray-900">{application.academicYear || '-'}/{application.semester || '-'}</span>
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
               <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                   <span className="w-1 h-6 bg-green-500 rounded-full"></span>
                   Submitted Works
               </h3>
               
               <div className="space-y-6">
                 {application.workItems?.map((work, index) => (
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
                                            
                                            {/* File Name Overlay */}
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
                 ))}
               </div>
            </div>
            
            {/* Approval History Log - Optional but good for detail view */}
            {application.approvalLogs && application.approvalLogs.length > 0 && (
                <div className="pt-8 border-t border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Approval History</h3>
                    <div className="space-y-6 relative pl-4 border-l-2 border-gray-100 ml-4">
                        {application.approvalLogs.map((log) => (
                            <div key={log.id} className="relative">
                                {/* Dot */}
                                <div className={`absolute -left-[21px] top-1 w-4 h-4 rounded-full border-2 border-white ${
                                    log.action === 'APPROVED' ? 'bg-green-500' : 
                                    log.action === 'REJECTED' ? 'bg-red-500' : 'bg-blue-400'
                                }`}></div>
                                
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                                    <div>
                                        <p className="font-semibold text-gray-900">{log.action} <span className="text-gray-400 font-normal">by</span> {log.actor?.name}</p>
                                        <p className="text-sm text-gray-500 mt-1">{log.comment || 'No comments'}</p>
                                    </div>
                                    <span className="text-xs text-gray-400 whitespace-nowrap mt-1 sm:mt-0">
                                        {new Date(log.createdAt).toLocaleString('th-TH')}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

        </div>
    </div>
  );
}
