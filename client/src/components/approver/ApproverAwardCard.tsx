import React from 'react';

interface ApproverAwardCardProps {
  id: string;
  title: string;
  iconUrl?: string;
  totalApplications: number;
  submittedCount: number;
  pendingCount: number;
  gradientType: 'purple' | 'blue' | 'yellow';
}

export default function ApproverAwardCard({ 
  title, 
  iconUrl, 
  totalApplications, 
  submittedCount, 
  pendingCount, 
  gradientType = 'blue' 
}: ApproverAwardCardProps) {
  
  const getTheme = () => {
    switch (gradientType) {
      case 'purple':
        return {
          bg: 'bg-gradient-to-br from-[#d8b4fe] to-[#c084fc]', 
          text: 'text-[#9333ea]', 
          subText: 'text-[#a855f7]',
          iconBg: 'bg-white/90 text-[#9333ea]',
          buttonStyle: 'border-[#d8b4fe] text-[#9333ea] hover:bg-[#faf5ff]'
        };
      case 'yellow':
        return {
          bg: 'bg-gradient-to-br from-[#fde047] to-[#facc15]', 
          text: 'text-[#ca8a04]', 
          subText: 'text-[#ca8a04]',
          iconBg: 'bg-white/90 text-[#ca8a04]',
          buttonStyle: 'border-[#fde047] text-[#ca8a04] hover:bg-[#fefce8]'
        };
      case 'blue':
      default:
        return {
          bg: 'bg-gradient-to-br from-[#93c5fd] to-[#60a5fa]', 
          text: 'text-[#2563eb]', 
          subText: 'text-[#3b82f6]',
          iconBg: 'bg-white/90 text-[#2563eb]',
          buttonStyle: 'border-[#93c5fd] text-[#2563eb] hover:bg-[#eff6ff]'
        };
    }
  };

  const theme = getTheme();

  const renderIcon = () => {
      if (iconUrl && iconUrl !== 'trophy') {
         // Standardize image display to avoid next/image complexity for dynamic urls if external
         // or use simple img tag as per previous implementation pattern
         if (iconUrl.includes('/') || iconUrl.startsWith('http')) {
             // eslint-disable-next-line @next/next/no-img-element
             return <img src={iconUrl} alt="icon" className="w-8 h-8 object-contain" />;
         }
         return <span className="text-2xl">{iconUrl}</span>;
      }
      return (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
      );
  };

  return (
    <div className="bg-white rounded-[24px] overflow-hidden shadow-lg border border-gray-100 flex flex-col h-full transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* Header Gradient */}
      <div className={`h-24 ${theme.bg} relative flex justify-center items-end pb-4`}>
         <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-white opacity-20 rounded-full"></div>
         
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
      </div>
    </div>
  );
}
