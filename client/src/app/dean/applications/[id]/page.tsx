'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useCurrentUser } from '../../../../hooks/useCurrentUser';
import { api } from '../../../../lib/api';
import { AwardApplication, WorkItemAttachment } from '../../../../types';
import { getStatusColor, getStatusLabel } from '../../../../lib/status-helper';

export default function DeanApplicationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { user, loading: userLoading } = useCurrentUser();
  const [application, setApplication] = useState<AwardApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (!userLoading) {
      if (!user) {
        router.push('/');
      } else if (user.role !== 'DEAN') {
        router.push('/');
      }
    }
  }, [user, userLoading, router]);

  const fetchApplication = async () => {
    if (!id) return;
    try {
      setLoading(true);
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

  useEffect(() => {
    if (id && user && user.role === 'DEAN') {
      fetchApplication();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user]);

  const handleAction = async (action: 'APPROVED' | 'REJECTED') => {
    setActionLoading(true);
    setActionError(null);
    try {
      await api.patch(`/applications/${id}/status`, { action });
      await fetchApplication();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setActionError(err.message || 'เกิดข้อผิดพลาด');
      } else {
        setActionError('เกิดข้อผิดพลาด');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const getFileIcon = (fileUrl: string) => {
    if (fileUrl.match(/\.pdf($|\?)/i)) return <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" /></svg>;
    if (fileUrl.match(/\.(jpg|jpeg|png|gif)($|\?)/i)) return <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg>;
    return <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" /></svg>;
  };

  const isImage = (fileUrl: string) => fileUrl.match(/\.(jpg|jpeg|png|gif)($|\?)/i);

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

  // ACCEPTED_BY_VICE_DEAN = vice dean approved → now in Dean's queue; PENDING_DEAN is an explicit enum alias
  const isPending = application.status === 'ACCEPTED_BY_VICE_DEAN' || application.status === 'PENDING_DEAN';

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900 truncate">
                {application.awardType?.awardName || 'รายละเอียดใบสมัคร'}
              </h1>
              <p className="text-xs text-gray-500">คณบดี · ตรวจสอบใบสมัคร</p>
            </div>
          </div>
          <div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(application.status)}`}>
              {getStatusLabel(application.status)}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
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
                  <span className="w-24 text-gray-500">รหัสนิสิต:</span>
                  <span className="font-medium text-gray-900">{application.user?.actualId || '-'}</span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="w-24 text-gray-500">คณะ:</span>
                  <span className="font-medium text-gray-900">{application.user?.faculty?.facultyName || '-'}</span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="w-24 text-gray-500">ภาควิชา:</span>
                  <span className="font-medium text-gray-900">{application.user?.department?.name || '-'}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">ข้อมูลการศึกษา</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">GPAX</span>
                  <span className="font-bold text-gray-900 text-lg">
                    {application.gpax ? parseFloat(application.gpax).toFixed(2) : '-'}
                  </span>
                </div>
              </div>
              {application.transcriptFile && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <a href={application.transcriptFile} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700 font-medium">
                    ดูใบทรานสคริปต์
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Work Items */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-green-500 rounded-full"></span>
            ผลงานที่ส่ง
          </h3>

          <div className="space-y-6">
            {application.workItems?.map((work, index) => (
              <div key={work.id || index} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-lg font-bold text-gray-800">{work.title}</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex gap-2">
                      <span className="text-gray-400">การแข่งขัน:</span>
                      <span className="font-medium text-gray-900">{work.competitionName || '-'}</span>
                    </div>
                  </div>
                </div>

                {/* Attachments */}
                <div className="bg-gray-50 p-6">
                  <h5 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">ไฟล์หลักฐาน</h5>
                  {work.attachments && work.attachments.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {work.attachments.map((file: WorkItemAttachment, fIndex: number) => (
                        <a key={fIndex} href={file.fileUrl} target="_blank" rel="noopener noreferrer" className="block p-2 border rounded-xl hover:shadow">
                          {isImage(file.fileUrl || '') ? "รูปภาพแนบ" : "ไฟล์แนบ"}
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 italic">ไม่มีไฟล์แนบ</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Panel */}
        {isPending && (
          <div className="pt-8 border-t border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
              ดำเนินการ (ระดับคณะ)
            </h3>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
              {actionError && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{actionError}</p>}

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => handleAction('APPROVED')}
                  disabled={actionLoading}
                  className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl"
                >
                  อนุมัติผ่านระดับคณะ
                </button>
                <button
                  onClick={() => handleAction('REJECTED')}
                  disabled={actionLoading}
                  className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl"
                >
                  ปฏิเสธ
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}