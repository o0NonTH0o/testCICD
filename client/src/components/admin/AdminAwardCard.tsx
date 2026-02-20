import React from 'react';
import Link from 'next/link';

interface AdminAwardCardProps {
  id: string;
  title: string;
  iconUrl?: string;
  totalApplications: number;
  submittedCount: number;
  pendingCount: number;
  gradientType: 'purple' | 'blue' | 'yellow';
  href?: string;
}

export default function AdminAwardCard({ 
  id,
  title, 
  iconUrl, 
  totalApplications, 
  submittedCount, 
  pendingCount, 
  gradientType = 'blue',
  href
}: AdminAwardCardProps) {
  
  const getTheme = () => {
    switch (gradientType) {
      case 'purple':
        return {
          bg: 'bg-gradient-to-br from-[#d8b4fe] to-[#c084fc]', 
          text: 'text-[#9333ea]', 
          subText: 'text-[#a855f7]',
          border: 'border-[#f3e8ff]', 
          iconBg: 'bg-white text-[#9333ea]',
          buttonStyle: 'bg-white text-[#9333ea] border-[#e9d5ff] hover:bg-[#faf5ff]'
        };
      case 'yellow':
        return {
          bg: 'bg-gradient-to-br from-[#fde68a] to-[#fcd34d]', 
          text: 'text-[#d97706]',
          subText: 'text-[#f59e0b]',
          border: 'border-[#fef3c7]', 
          iconBg: 'bg-white text-[#d97706]',
          buttonStyle: 'bg-white text-[#d97706] border-[#fde68a] hover:bg-[#fffbeb]'
        };
      default: // blue
        return {
          bg: 'bg-gradient-to-br from-[#bfdbfe] to-[#93c5fd]', 
          text: 'text-[#2563eb]',
          subText: 'text-[#3b82f6]',
          border: 'border-[#eff6ff]', 
          iconBg: 'bg-white text-[#2563eb]',
          buttonStyle: 'bg-white text-[#2563eb] border-[#dbeafe] hover:bg-[#eff6ff]'
        };
    }
  };

  const theme = getTheme();

  // Rendering the specific icon based on iconUrl or default
  const renderIcon = () => {
    // If iconUrl is a real file/url (contains dot or slash), render image
    if (iconUrl && (iconUrl.startsWith('/') || iconUrl.startsWith('http') || iconUrl.startsWith('blob:'))) {
        return (
            <img 
                src={iconUrl} 
                alt={title} 
                className="w-full h-full object-contain p-2"
            />
        );
    }

    // Fallback based on gradientType if no specific iconUrl or if it's just a keyword
    if (gradientType === 'purple') {
        // Lightbulb/Innovation
        return (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
        );
    } else if (gradientType === 'yellow') {
        // Star / Good Conduct
        return (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
        );
    } else {
        // Trophy/Activity
        return (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
        );
    }
  };

  return (
    <div className={`bg-white rounded-[20px] overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col h-full border ${theme.border}`}>
      {/* Header with Gradient & Icon */}
      <div className={`${theme.bg} h-28 relative flex items-center justify-center`}>
         <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-sm ${theme.iconBg} transform transition-transform duration-300`}>
            {renderIcon()}
         </div>
      </div>

      <div className="p-5 flex-grow flex flex-col items-center text-center">
        <h3 className="font-bold text-base text-gray-800 mb-2 leading-tight px-2 min-h-[3rem] flex items-center justify-center">
            {title}
        </h3>

        <div className="flex items-baseline justify-center mb-4">
            <span className={`text-5xl font-bold ${theme.text}`}>
                {totalApplications}
            </span>
            <span className="text-gray-400 text-xs font-medium ml-2">คน</span>
        </div>

        <div className="w-full space-y-2 mb-6 px-4">
            <div className="flex justify-between items-center text-xs border-b border-gray-100 pb-2">
                <span className="font-medium text-gray-500">ส่งแล้ว</span>
                <span className={`font-bold ${theme.subText}`}>{submittedCount} คน</span>
            </div>
            <div className="flex justify-between items-center text-xs pt-1">
                <span className="font-medium text-gray-500">รอดำเนินการ</span>
                <span className={`font-bold ${theme.subText}`}>{pendingCount} คน</span>
            </div>
        </div>

        <div className="mt-auto w-full">
            <Link href={href || `/admin/awards/${id}`}>
                <button className={`w-full py-2 rounded-xl border-2 ${theme.buttonStyle} text-sm font-bold transition-all shadow-sm active:scale-95`}>
                    ตรวจสอบ
                </button>
            </Link>
        </div>
      </div>
    </div>
  );
}

