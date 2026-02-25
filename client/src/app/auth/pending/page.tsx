'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../../lib/api';
import { User } from '../../../types';

export default function PendingPage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        setIsChecking(true);
        // Fetch latest user data
        const user = await api.get<User>('/users/me');
        
        // If Approved/Active -> Redirect to Home (which redirects to Dashboard)
        if (user.status === 'ACTIVE') {
          router.push('/');
        }
        
        // If Rejected -> Redirect to Rejected page
        if (user.status === 'REJECTED') {
           router.push('/auth/reject'); 
        }
      } catch (err) {
        console.error("Error checking status:", err);
      } finally {
        setIsChecking(false);
      }
    };

    // Check immediately on mount
    checkStatus();

    // Poll every 3 seconds
    const interval = setInterval(checkStatus, 3000);

    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="fluid-background min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 text-black font-sans relative overflow-hidden">
      
      {/* Background Blobs */}
      <div className="fluid-blob fluid-blob-1" />
      <div className="fluid-blob fluid-blob-2" />
      <div className="fluid-blob fluid-blob-3" />

      <div className="max-w-md w-full bg-white/95 backdrop-blur-sm p-10 rounded-[40px] shadow-2xl text-center border border-white/20 z-10 relative">
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-yellow-50 p-6 shadow-inner relative">
             {/* Pulse animation to indicate live checking */}
             <div className="absolute inset-0 rounded-full bg-yellow-200 opacity-20 animate-ping"></div>
             
             {/* Clock Icon */}
             <svg className="w-20 h-20 text-yellow-500 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
             </svg>
          </div>
        </div>
        
        <h2 className="text-3xl font-extrabold text-[#1a1a1a] mb-4">รอการอนุมัติ</h2>
        <p className="text-gray-500 text-lg mb-8 leading-relaxed">
          ระบบได้รับข้อมูลการลงทะเบียนของท่านแล้ว<br/>
          กรุณารอการตรวจสอบและอนุมัติจากผู้ดูแลระบบ<br/>
          <span className="text-sm text-gray-400 mt-2 block">(อาจใช้เวลา 1-2 วันทำการ)</span>
        </p>
        
        <div className="flex flex-col gap-3">
            <Link href="/" className="inline-block w-full px-8 py-4 border border-transparent text-lg font-medium rounded-full text-white bg-[#5D9F75] hover:bg-[#4C8561] transition-colors shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
            กลับสู่หน้าเข้าสู่ระบบ
            </Link>
            
            <button 
                onClick={() => window.location.reload()}
                className="text-sm text-gray-400 hover:text-gray-600 underline"
            >
                ตรวจสอบสถานะอีกครั้ง
            </button>
        </div>
      </div>
    </div>
  );
}
