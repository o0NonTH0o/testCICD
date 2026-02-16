import React from 'react';
import { AwardApplication, ApplicationStatus } from '../../types';
import Link from 'next/dist/client/link';
import { getProgress, getStatusColor, getStatusLabel } from '../../lib/status-helper';

interface Props {
  application: AwardApplication;
}

export default function ApplicationStatusCard({ application }: Props) {
  const progress = getProgress(application.status as ApplicationStatus);
  const user = application.user; // Assuming user is populated

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6 border border-gray-100">
      <div className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left: Profile Image & Info */}
          <div className="flex-shrink-0">
            <div className="w-24 h-24 rounded-lg bg-gray-200 overflow-hidden">
                {/* Fallback image or user image */}
               {user?.image ? (
                   <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
               ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                </div>
               )}
            </div>
          </div>

          {/* Middle: Details */}
          <div className="flex-grow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{user?.name || 'Unknown Student'}</h3>
                {/* User faculty, fallback to application direct faculty string if any */}
                <p className="text-sm text-green-600 font-medium">
                    {user?.faculty?.facultyName || application.faculty || '-'}
                </p> 
                <p className="text-xs text-gray-500 mt-1">GPA: {application.gpax || '-'}</p>
                
                <div className="mt-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Key Achievements</p>
                  <ul className="mt-2 space-y-1">
                    <li className="flex items-start text-sm text-gray-700">
                      <span className="mr-2 text-green-500">★</span>
                      <span>{application.workItems?.[0]?.title || 'No Title'}</span>
                    </li>
                     <li className="flex items-start text-sm text-gray-500">
                      <span className="mr-2 text-green-500">★</span>
                      <span>{application.workItems?.[0]?.competitionName || ''}</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Right: Status Badge */}
              <div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status as ApplicationStatus)}`}>
                      {getStatusLabel(application.status as ApplicationStatus)}
                      {/* Optional Icon */}
                      <svg className="ml-1.5 w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                  </span>
              </div>
            </div>
            
             <div className="mt-4">
                <Link 
                  href={`/student/applications/${application.id}`}
                  className="inline-flex items-center justify-center w-8 h-8 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                  title="ดูรายละเอียด"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                </Link>
             </div>
          </div>
        </div>
      </div>

      {/* Footer: Progress Bar */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
        <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-gray-500">Total Progress</span>
            <span className="text-xs font-bold text-green-600">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
            <div className="bg-green-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
        </div>

        {/* Dynamic Steps - Simplified */}
        <div className="flex flex-col md:flex-row md:items-center justify-between text-xs text-gray-500 gap-2">
            <div>
               {application.status === 'PENDING_DEPT_HEAD' && <span>ขั้นตอนถัดไป : อนุมัติจากหัวหน้าภาควิชา</span>}
               {application.status === 'PENDING_VICE_DEAN' && <span>ขั้นตอนถัดไป : อนุมัติจากรองคณบดี</span>}
               {application.status === 'PENDING_DEAN' && <span>ขั้นตอนถัดไป : อนุมัติจากคณบดี</span>}
               {application.status === 'APPROVED' && <span className="text-green-600 font-medium">✨ การสมัครเสร็จสมบูรณ์</span>}
            </div>
             <div className="flex gap-2">
                 {/* Can add small status indicators if needed */}
             </div>
        </div>
      </div>
    </div>
  );
}
