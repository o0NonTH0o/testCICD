'use client';

import React from 'react';
import Link from 'next/link';

export default function RejectPage() {
  return (
    <div className="fluid-background min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 text-black font-sans relative overflow-hidden bg-gray-50">
      
      {/* Background Blobs (Red theme) */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-red-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-[500px] h-[500px] bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      <div className="max-w-md w-full bg-white/95 backdrop-blur-sm p-10 rounded-[40px] shadow-2xl text-center border border-white/20 z-10 relative">
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-red-50 p-6 shadow-inner relative">
             <div className="absolute inset-0 rounded-full bg-red-200 opacity-20 animate-ping"></div>
             
             {/* Cross Icon */}
             <svg className="w-20 h-20 text-red-500 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
             </svg>
          </div>
        </div>
        
        <h2 className="text-3xl font-extrabold text-[#1a1a1a] mb-4">การลงทะเบียนถูกปฏิเสธ</h2>
        <p className="text-gray-500 text-lg mb-8 leading-relaxed">
          ขออภัย ข้อมูลการลงทะเบียนของท่านไม่ผ่านการอนุมัติ<br/>
          กรุณาติดต่อผู้ดูแลระบบเพื่อแก้ไขข้อมูล หรือสอบถามรายละเอียดเพิ่มเติม
        </p>
      </div>
    </div>
  );
}
