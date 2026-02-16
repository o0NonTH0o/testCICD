import React from 'react';
import { AwardApplication } from '../types';
import Link from 'next/link';
import { getStatusColor, getStatusLabel } from '../lib/status-helper';

interface Props {
  applications: AwardApplication[];
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  isApprover?: boolean;
}

export default function ApplicationList({ applications, onApprove, onReject, isApprover }: Props) {
  if (applications.length === 0) {
    return <div className="p-4 text-center text-gray-500">ไม่พบรายการใบสมัคร</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left">สถานะ</th>
            <th className="px-4 py-2 text-left">หัวข้อผลงาน</th>
            <th className="px-4 py-2 text-left">การแข่งขัน</th>
            <th className="px-4 py-2 text-left">ผู้สมัคร</th>
            <th className="px-4 py-2 text-left">รายละเอียด</th>
            {isApprover && <th className="px-4 py-2 text-left">จัดการ</th>}
          </tr>
        </thead>
        <tbody>
          {applications.map((app) => (
            <tr key={app.id} className="border-t hover:bg-gray-50">
              <td className="px-4 py-2">
                <span className={`px-2 py-1 rounded text-xs font-bold 
                  ${getStatusColor(app.status)}`}>
                  {getStatusLabel(app.status)}
                </span>
              </td>
              <td className="px-4 py-2">
                <div className="text-sm font-medium text-gray-900">{app.workItems?.[0]?.title || '-'}</div>
                <div className="text-xs text-gray-500">{app.awardType?.awardName}</div>
              </td>
              <td className="px-4 py-2 text-sm text-gray-600">
                 {app.workItems?.[0]?.competitionName || '-'}
              </td>
              <td className="px-4 py-2">
                <div className="text-sm">{app.user?.name}</div>
                <div className="text-xs text-gray-500">{app.user?.email}</div>
              </td>
              <td className="px-4 py-2">
                <Link 
                  href={`/student/applications/${app.id}`}
                  className="inline-flex items-center justify-center w-8 h-8 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                  title="ดูรายละเอียด"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                </Link>
              </td>
              {isApprover && (
                <td className="px-4 py-2 space-x-2">
                  <button 
                    onClick={() => onApprove?.(app.id)}
                    className="bg-green-500 text-white px-2 py-1 rounded text-sm hover:bg-green-600"
                  >
                    อนุมัติ
                  </button>
                  <button 
                    onClick={() => onReject?.(app.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600"
                  >
                    ปัดตก
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
