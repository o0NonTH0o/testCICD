import React from 'react';
import { useRouter } from 'next/navigation';
import { AwardType } from '../hooks/useMasterData';

interface Props {
  award: AwardType;
  isDisabled?: boolean;
  disabledReason?: string;
  gradientType?: 'purple' | 'blue' | 'yellow';
}

export default function AwardCard({ award, isDisabled, disabledReason, gradientType = 'blue' }: Props) {
  const router = useRouter();

  const getTheme = () => {
    switch (gradientType) {
      case 'purple':
        return {
          bg: 'bg-gradient-to-br from-[#d8b4fe] to-[#c084fc]',
          text: 'text-[#9333ea]',
          subText: 'text-[#a855f7]',
          border: 'border-[#f3e8ff]',
          iconBg: 'bg-white text-[#9333ea]',
          buttonStyle: 'bg-white text-[#9333ea] border-[#e9d5ff] hover:bg-[#faf5ff]',
          disabledStyle: 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed',
        };
      case 'yellow':
        return {
          bg: 'bg-gradient-to-br from-[#fde68a] to-[#fcd34d]',
          text: 'text-[#d97706]',
          subText: 'text-[#f59e0b]',
          border: 'border-[#fef3c7]',
          iconBg: 'bg-white text-[#d97706]',
          buttonStyle: 'bg-white text-[#d97706] border-[#fde68a] hover:bg-[#fffbeb]',
          disabledStyle: 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed',
        };
      default: // blue
        return {
          bg: 'bg-gradient-to-br from-[#bfdbfe] to-[#93c5fd]',
          text: 'text-[#2563eb]',
          subText: 'text-[#3b82f6]',
          border: 'border-[#eff6ff]',
          iconBg: 'bg-white text-[#2563eb]',
          buttonStyle: 'bg-white text-[#2563eb] border-[#dbeafe] hover:bg-[#eff6ff]',
          disabledStyle: 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed',
        };
    }
  };

  const theme = getTheme();

  const renderIcon = () => {
    if (award.iconUrl && (award.iconUrl.startsWith('/') || award.iconUrl.startsWith('http') || award.iconUrl.startsWith('blob:'))) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={award.iconUrl} alt={award.awardName} className="w-full h-full object-contain p-2" />
      );
    }
    if (gradientType === 'purple') {
      return (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      );
    } else if (gradientType === 'yellow') {
      return (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
        </svg>
      );
    } else {
      return (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      );
    }
  };

  const description = award.description || 'ไม่มีคำอธิบาย';

  return (
    <div className={`bg-white rounded-[20px] overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col h-full border ${theme.border}`}>
      {/* Gradient header with icon */}
      <div className={`${theme.bg} h-28 relative flex items-center justify-center`}>
        <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-sm ${theme.iconBg}`}>
          {renderIcon()}
        </div>
      </div>

      <div className="p-5 flex-grow flex flex-col items-center text-center">
        <h3 className="font-bold text-base text-gray-800 mb-3 leading-tight px-2 min-h-[3rem] flex items-center justify-center">
          {award.awardName}
        </h3>

        <p className="text-xs text-gray-500 mb-6 line-clamp-3 flex-grow text-center px-2">
          {description}
        </p>

        <div className="mt-auto w-full">
          <button
            onClick={() => {
              if (!isDisabled) {
                router.push(`/student/create?type=${encodeURIComponent(award.id)}&mode=id`);
              }
            }}
            disabled={isDisabled}
            className={`w-full py-2 rounded-xl border-2 text-sm font-bold transition-all shadow-sm active:scale-95 ${
              isDisabled ? theme.disabledStyle : theme.buttonStyle
            }`}
          >
            {isDisabled ? (disabledReason || 'ไม่สามารถสมัครได้') : 'ส่งใบสมัคร'}
          </button>
        </div>
      </div>
    </div>
  );
}
